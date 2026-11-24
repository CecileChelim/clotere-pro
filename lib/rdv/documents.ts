import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { ErreurRdv } from "./actions";
import type { RdvComplet } from "./load";

const BUCKET = "documents";
export const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo, aussi imposé par le bucket
const NB_MAX = 20;

export type DocumentRdv = { id: string; libelle: string; nom_fichier: string; taille: number; created_at: string };

/** Le client peut déposer tant que le rendez-vous est en cours (ni refusé, ni annulé, ni clôturé). */
export const peutDeposer = (r: Pick<RdvComplet, "statut">) => ["demandé", "proposé", "confirmé"].includes(r.statut);

export async function documentsDuRdv(bookingId: string): Promise<DocumentRdv[]> {
  const { data } = await createAdminClient().from("booking_documents")
    .select("id, libelle, nom_fichier, taille, created_at").eq("booking_id", bookingId).order("created_at");
  return (data ?? []) as DocumentRdv[];
}

/** Étape 1 : URL d'envoi signée. Le navigateur envoie le PDF directement à Supabase Storage. */
export async function preparerDepot(r: RdvComplet, taille: unknown) {
  if (!peutDeposer(r)) throw new ErreurRdv("Ce rendez-vous n'accepte plus de documents");
  if (typeof taille !== "number" || taille <= 0) throw new ErreurRdv("Fichier vide");
  if (taille > TAILLE_MAX) throw new ErreurRdv("Fichier trop lourd (10 Mo maximum)");
  if ((await documentsDuRdv(r.id)).length >= NB_MAX) throw new ErreurRdv(`${NB_MAX} documents maximum par rendez-vous`);
  const chemin = `${r.id}/${crypto.randomUUID()}.pdf`;
  const { data, error } = await createAdminClient().storage.from(BUCKET).createSignedUploadUrl(chemin);
  if (error || !data) throw new ErreurRdv("Envoi impossible pour le moment");
  return { chemin, jeton: data.token };
}

/** Étape 2 : le fichier est arrivé, on l'enregistre sur le rendez-vous. */
export async function enregistrerDepot(r: RdvComplet, chemin: unknown, libelle: unknown, nomFichier: unknown) {
  if (!peutDeposer(r)) throw new ErreurRdv("Ce rendez-vous n'accepte plus de documents");
  if (typeof chemin !== "string" || !new RegExp(`^${r.id}/[0-9a-f-]{36}\\.pdf$`).test(chemin)) throw new ErreurRdv("Fichier invalide");
  const lib = typeof libelle === "string" ? libelle.trim().slice(0, 200) : "";
  if (!lib) throw new ErreurRdv("Indiquez de quels documents il s'agit");
  const db = createAdminClient();
  const { data: info, error } = await db.storage.from(BUCKET).info(chemin);
  if (error || !info) throw new ErreurRdv("Le fichier n'a pas été reçu, réessayez");
  const taille = info.size ?? 0;
  if (taille > TAILLE_MAX || (info.contentType && info.contentType !== "application/pdf")) {
    await db.storage.from(BUCKET).remove([chemin]);
    throw new ErreurRdv("Seuls les PDF de 10 Mo maximum sont acceptés");
  }
  const nom = (typeof nomFichier === "string" ? nomFichier.trim() : "").slice(0, 200) || "document.pdf";
  const { data, error: e } = await db.from("booking_documents")
    .insert({ booking_id: r.id, chemin, libelle: lib, nom_fichier: nom, taille })
    .select("id, libelle, nom_fichier, taille, created_at").single();
  if (e || !data) throw new ErreurRdv("Enregistrement impossible, réessayez");
  return data as DocumentRdv;
}

/** Le client retire un document qu'il a déposé (erreur de fichier). */
export async function retirerDocument(r: RdvComplet, id: unknown) {
  if (!peutDeposer(r)) throw new ErreurRdv("Ce rendez-vous est clos");
  if (typeof id !== "string") throw new ErreurRdv("Document introuvable");
  const db = createAdminClient();
  const { data } = await db.from("booking_documents").select("chemin").eq("id", id).eq("booking_id", r.id).maybeSingle();
  if (!data) throw new ErreurRdv("Document introuvable");
  await db.storage.from(BUCKET).remove([data.chemin]);
  await db.from("booking_documents").delete().eq("id", id);
}

/** Lien de téléchargement temporaire (1 min) pour le pro. */
export async function lienTelechargement(r: RdvComplet, id: string) {
  const db = createAdminClient();
  const { data } = await db.from("booking_documents").select("chemin, nom_fichier").eq("id", id).eq("booking_id", r.id).maybeSingle();
  if (!data) return null;
  const { data: s } = await db.storage.from(BUCKET).createSignedUrl(data.chemin, 60, { download: data.nom_fichier });
  return s?.signedUrl ?? null;
}

/** Clôture : efface les documents (y compris les envois jamais confirmés), le journal des e-mails
 *  et les coordonnées du client. Le rendez-vous reste en base, anonymisé, pour les statistiques. */
export async function purgerDonneesClient(bookingId: string) {
  const db = createAdminClient();
  const { data: fichiers } = await db.storage.from(BUCKET).list(bookingId, { limit: 1000 });
  const chemins = (fichiers ?? []).map((f) => `${bookingId}/${f.name}`);
  if (chemins.length) {
    const { error } = await db.storage.from(BUCKET).remove(chemins);
    if (error) throw new ErreurRdv("Suppression des documents impossible, réessayez");
  }
  await db.from("booking_documents").delete().eq("booking_id", bookingId);
  await db.from("emails").delete().eq("booking_id", bookingId);
  const { error } = await db.from("bookings").update({
    client_nom: "Client supprimé", client_prenom: null, client_email: "", client_tel: null,
    message: null, message_pro: null, reponses: null, donnees_client_supprimees_le: new Date().toISOString(),
  }).eq("id", bookingId);
  if (error) throw new ErreurRdv(error.message);
}
