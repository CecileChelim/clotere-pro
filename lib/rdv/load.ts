import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROFESSIONS, type Profession } from "@/lib/professions-config";

export type RdvComplet = {
  id: string; statut: string; creneau_debut: string; creneau_fin: string; mode: string | null; type_rdv: string;
  client_nom: string; client_prenom: string | null; client_email: string; client_tel: string | null;
  message: string | null; suivi_existant: boolean; deja_avocat: string | null; source: string | null;
  message_pro: string | null; creneaux_proposes: { debut: string; fin: string }[] | null;
  token_pro: string; token_client: string; created_at: string; annule_par: string | null; annulation_raison: string | null; agenda_event_id: string | null; visio_url: string | null;
  motif: { libelle: string; duree_min: number; domaine_id: string | null } | null;
  pro: {
    id: string; prenom: string; nom: string; email: string; slug: string; telephone: string | null; profession: Profession; photo_url: string | null;
    cabinet: { nom: string; adresse: string | null; code_postal: string | null; ville: string | null; telephone: string | null; google_place_id: string | null; google_business_url: string | null; google_reviews_url: string | null } | null;
  };
};

const SELECT = `id, statut, creneau_debut, creneau_fin, mode, type_rdv, client_nom, client_prenom, client_email, client_tel, message,
  suivi_existant, deja_avocat, source, message_pro, creneaux_proposes, token_pro, token_client, created_at, annule_par, annulation_raison, agenda_event_id, visio_url,
  motif:motifs(libelle, duree_min, domaine_id),
  pro:professionals(id, prenom, nom, email, slug, telephone, profession, photo_url, cabinet:cabinets(nom, adresse, code_postal, ville, telephone, google_place_id, google_business_url, google_reviews_url))`;

const one = <T,>(x: T | T[] | null): T | null => (Array.isArray(x) ? x[0] ?? null : x);

function normaliser(row: Record<string, unknown> | null): RdvComplet | null {
  if (!row) return null;
  const pro = one(row.pro as RdvComplet["pro"] | RdvComplet["pro"][]);
  if (!pro) return null;
  return {
    ...(row as unknown as RdvComplet),
    motif: one(row.motif as RdvComplet["motif"]),
    pro: { ...pro, profession: pro.profession === "comptable" ? "comptable" : "avocat", cabinet: one(pro.cabinet as RdvComplet["pro"]["cabinet"]) },
  };
}

export async function rdvParId(id: string) {
  const { data } = await createAdminClient().from("bookings").select(SELECT).eq("id", id).maybeSingle();
  return normaliser(data);
}
export async function rdvParTokenPro(token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await createAdminClient().from("bookings").select(SELECT).eq("token_pro", token).maybeSingle();
  return normaliser(data);
}
export async function rdvParTokenClient(token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await createAdminClient().from("bookings").select(SELECT).eq("token_client", token).maybeSingle();
  return normaliser(data);
}

export const nomPro = (r: RdvComplet) => `${PROFESSIONS[r.pro.profession].titre ? PROFESSIONS[r.pro.profession].titre + " " : ""}${r.pro.prenom} ${r.pro.nom}`;
export const nomClient = (r: RdvComplet) => [r.client_prenom, r.client_nom].filter(Boolean).join(" ");
export const libelleMotif = (r: RdvComplet) => (r.suivi_existant ? "Suivi de dossier existant" : r.motif?.libelle ?? "Rendez-vous");
export const adresseCabinet = (r: RdvComplet) =>
  r.pro.cabinet ? [r.pro.cabinet.adresse, [r.pro.cabinet.code_postal, r.pro.cabinet.ville].filter(Boolean).join(" ")].filter(Boolean).join(", ") : "";
export const marque = (r: RdvComplet) => PROFESSIONS[r.pro.profession].brand;

export type EmailRdv = { id: string; destinataire: string; type: string; sujet: string; html: string; envoye: boolean; erreur: string | null; created_at: string };
export async function emailsDuRdv(bookingId: string): Promise<EmailRdv[]> {
  const { data } = await createAdminClient().from("emails")
    .select("id, destinataire, type, sujet, html, envoye, erreur, created_at").eq("booking_id", bookingId).order("created_at");
  return (data ?? []) as EmailRdv[];
}
