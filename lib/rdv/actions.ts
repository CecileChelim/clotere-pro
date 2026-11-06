import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { ics } from "./format";
import { envoyer, liens, mails } from "./emails";
import { adresseCabinet, libelleMotif, nomClient, nomPro, rdvParId, type RdvComplet } from "./load";
import { etatAbonnement } from "@/lib/abonnement";
import { notifierSlack } from "@/lib/slack";
import { lienAvisGoogle } from "@/lib/google";
import { creerDemandeAvis } from "@/lib/avis-serveur";
import { estRaison, RAISONS_SUPPRESSION } from "./suppression";
import { chevauche, creerEvenement, plagesIndisponibles, supprimerEvenement } from "@/lib/agenda";

export class ErreurRdv extends Error {}

const H24 = 24 * 3600 * 1000;

export function baseUrl(req: Request | null, r?: RdvComplet) {
  if (req) return new URL(req.url).origin;
  if (process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost")) return process.env.NEXT_PUBLIC_SITE_URL; // dev local uniquement
  return r?.pro.profession === "comptable" ? "https://comptable.clotere.fr" : "https://avocat.clotere.fr";
}

async function maj(id: string, patch: Record<string, unknown>) {
  const { error } = await createAdminClient().from("bookings").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new ErreurRdv(error.message);
  const r = await rdvParId(id);
  if (!r) throw new ErreurRdv("Rendez-vous introuvable");
  return r;
}

function invitation(r: RdvComplet) {
  return ics({
    uid: r.id, debut: r.creneau_debut, fin: r.creneau_fin,
    titre: `Rendez-vous avec ${nomPro(r)}`,
    lieu: r.mode === "cabinet" ? adresseCabinet(r) : r.mode === "visio" ? "Visioconférence" : "Téléphone",
    description: libelleMotif(r),
  });
}

/** Ajoute le rdv confirmé dans l'agenda du pro (si connecté) et mémorise l'événement + le lien visio. */
async function versAgenda(r: RdvComplet) {
  const ev = await creerEvenement(r.pro.id, {
    titre: `RDV ${nomClient(r)} — ${libelleMotif(r)}`,
    description: [`Client : ${nomClient(r)}`, `Email : ${r.client_email}`, r.client_tel ? `Téléphone : ${r.client_tel}` : "", `Format : ${r.mode}`, r.message ? `\nMessage :\n${r.message}` : ""].filter(Boolean).join("\n"),
    debut: r.creneau_debut, fin: r.creneau_fin, lieu: r.mode === "cabinet" ? adresseCabinet(r) : undefined,
    clientEmail: r.client_email, clientNom: nomClient(r), visio: r.mode === "visio", refId: r.id,
  });
  if (!ev) return r;
  return maj(r.id, { agenda_event_id: ev.id, visio_url: ev.visio });
}

/* ---------------- Création (client) ---------------- */
export type NouvelleDemande = {
  professional_id: string; motif_id: string | null; mode: string; creneau_debut: string; creneau_fin: string;
  client_nom: string; client_prenom: string; client_email: string; client_tel: string;
  message: string | null; suivi_existant: boolean; deja_avocat: string | null; source: string | null;
};

export async function creerDemande(d: NouvelleDemande, base: string) {
  const db = createAdminClient();
  if (!d.professional_id || !d.client_email || !d.client_nom || !d.creneau_debut) throw new ErreurRdv("Champs manquants");
  if ((d.client_tel ?? "").replace(/\D/g, "").length < 10) throw new ErreurRdv("Merci d'indiquer un numéro de téléphone valide.");
  if (new Date(d.creneau_debut).getTime() < Date.now()) throw new ErreurRdv("Ce créneau est passé");
  const { data: pro } = await db.from("professionals").select("id, cabinet:cabinets(trial_ends_at, subscription_status)").eq("id", d.professional_id).maybeSingle();
  if (!pro) throw new ErreurRdv("Professionnel introuvable");
  const cab = Array.isArray(pro.cabinet) ? pro.cabinet[0] : pro.cabinet;
  if (!etatAbonnement(cab as { trial_ends_at: string; subscription_status: string } | null).actif) throw new ErreurRdv("La prise de rendez-vous en ligne de ce cabinet est momentanément indisponible.");

  const libre = !(await plagesIndisponibles(d.professional_id, new Date(d.creneau_debut), new Date(d.creneau_fin)))
    .some((x) => chevauche(x, { debut: d.creneau_debut, fin: d.creneau_fin }));
  if (!libre) throw new ErreurRdv("Ce créneau vient d'être pris. Merci d'en choisir un autre.");

  const { data, error } = await db.from("bookings").insert({
    ...d, type_rdv: d.mode, statut: "demandé",
    message: d.message?.slice(0, 500) ?? null,
  }).select("id").single();
  if (error || !data) throw new ErreurRdv(error?.message ?? "Insertion impossible");

  const r = (await rdvParId(data.id))!;
  const l = liens(r, base);
  await envoyer({ to: r.client_email, type: "demande_client", rdv: r, ...mails.demandeClient(r, l) });
  await envoyer({ to: r.pro.email, type: "demande_pro", rdv: r, ...mails.demandePro(r, l) });
  await notifierSlack(r.pro.profession, `📅 Nouvelle demande de rendez-vous : ${r.pro.cabinet?.nom || nomPro(r)}`, [
    ["Motif", libelleMotif(r)],
    ["Créneau", new Date(r.creneau_debut).toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "medium", timeStyle: "short" })],
    ["Client", nomClient(r)], ["E-mail", r.client_email], ["Téléphone", r.client_tel],
  ]);
  return r;
}

/* ---------------- Actions de l'avocat ---------------- */
export async function valider(r: RdvComplet, message: string | null, base: string) {
  if (!["demandé"].includes(r.statut)) throw new ErreurRdv("Cette demande a déjà été traitée");
  const n = await versAgenda(await maj(r.id, { statut: "confirmé", message_pro: message?.trim() || null, traite_at: new Date().toISOString() }));
  await envoyer({ to: n.client_email, type: "confirme_client", rdv: n, ics: invitation(n), ...mails.confirmeClient(n, liens(n, base)) });
  return n;
}

export async function refuser(r: RdvComplet, message: string | null, base: string) {
  if (!["demandé", "proposé"].includes(r.statut)) throw new ErreurRdv("Cette demande a déjà été traitée");
  const n = await maj(r.id, { statut: "refusé", message_pro: message?.trim() || null, traite_at: new Date().toISOString() });
  await envoyer({ to: n.client_email, type: "refuse_client", rdv: n, ...mails.refuseClient(n, liens(n, base)) });
  return n;
}

export async function proposer(r: RdvComplet, creneaux: string[], message: string | null, base: string) {
  if (!["demandé", "proposé"].includes(r.statut)) throw new ErreurRdv("Cette demande a déjà été traitée");
  const duree = new Date(r.creneau_fin).getTime() - new Date(r.creneau_debut).getTime();
  const liste = creneaux
    .filter(Boolean)
    .map((c) => new Date(c))
    .filter((d) => !isNaN(d.getTime()) && d.getTime() > Date.now())
    .slice(0, 3)
    .map((d) => ({ debut: d.toISOString(), fin: new Date(d.getTime() + duree).toISOString() }));
  if (!liste.length) throw new ErreurRdv("Proposez au moins un créneau à venir");
  const n = await maj(r.id, { statut: "proposé", creneaux_proposes: liste, message_pro: message?.trim() || null, traite_at: new Date().toISOString() });
  await envoyer({ to: n.client_email, type: "propose_client", rdv: n, ...mails.proposeClient(n, liens(n, base)) });
  return n;
}

export async function annulerParPro(r: RdvComplet, message: string | null, base: string) {
  if (r.statut !== "confirmé") throw new ErreurRdv("Seul un rendez-vous confirmé peut être annulé");
  const n = await maj(r.id, { statut: "annulé", annule_par: "pro", message_pro: message?.trim() || r.message_pro });
  if (r.agenda_event_id) await supprimerEvenement(r.pro.id, r.agenda_event_id);
  await envoyer({ to: n.client_email, type: "annule_client", rdv: n, ...mails.annuleClient(n, liens(n, base), "pro") });
  return n;
}

/** Déplacement par le pro, avec l'accord du client (ex. au téléphone) : le nouveau créneau est
 *  appliqué directement, sans confirmation du client. Même durée ; l'agenda du pro est mis à jour,
 *  le client reçoit la nouvelle date avec l'invitation (même UID : son agenda déplace l'événement). */
export async function deplacer(r: RdvComplet, debut: unknown, message: string | null, base: string) {
  if (!["demandé", "proposé", "confirmé"].includes(r.statut)) throw new ErreurRdv("Ce rendez-vous ne peut plus être déplacé");
  const d = new Date(String(debut ?? ""));
  if (isNaN(d.getTime())) throw new ErreurRdv("Indiquez la nouvelle date et l'heure");
  if (d.getTime() < Date.now()) throw new ErreurRdv("Ce créneau est passé");
  const duree = new Date(r.creneau_fin).getTime() - new Date(r.creneau_debut).getTime();
  const ancien = r.creneau_debut;
  if (r.agenda_event_id) await supprimerEvenement(r.pro.id, r.agenda_event_id);
  const n = await versAgenda(await maj(r.id, {
    statut: "confirmé", creneau_debut: d.toISOString(), creneau_fin: new Date(d.getTime() + duree).toISOString(),
    creneaux_proposes: null, agenda_event_id: null, visio_url: null, rappel_envoye_at: null,
    message_pro: message?.trim() || null, traite_at: new Date().toISOString(),
  }));
  await envoyer({ to: n.client_email, type: "deplace_client", rdv: n, ics: invitation(n), ...mails.deplaceClient(n, liens(n, base), ancien) });
  await notifierSlack(r.pro.profession, `🔁 Rendez-vous déplacé par le cabinet : ${r.pro.cabinet?.nom || nomPro(r)}`, [
    ["Client", nomClient(r)],
    ["Ancien créneau", new Date(ancien).toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "medium", timeStyle: "short" })],
    ["Nouveau créneau", new Date(n.creneau_debut).toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "medium", timeStyle: "short" })],
  ]);
  return n;
}

/** Suppression par le pro : le rendez-vous sort de ses listes mais reste en base (statistiques).
 *  Dossier mené à bien → possibilité d'envoyer une demande d'avis Google au client. */
export async function supprimerParPro(r: RdvComplet, raison: unknown, detail: string | null, demanderAvis: boolean) {
  if (r.statut === "supprimé") throw new ErreurRdv("Ce rendez-vous est déjà supprimé");
  if (!estRaison(raison)) throw new ErreurRdv("Choisissez une raison");
  const aVenir = new Date(r.creneau_debut).getTime() > Date.now();
  const n = await maj(r.id, {
    statut: "supprimé", statut_avant_suppression: r.statut, supprime_le: new Date().toISOString(),
    suppression_raison: raison, suppression_detail: detail?.trim().slice(0, 1000) || null,
  });
  // Libère le créneau dans l'agenda connecté si le rendez-vous n'a pas encore eu lieu.
  if (r.agenda_event_id && aVenir) await supprimerEvenement(r.pro.id, r.agenda_event_id);

  let avisEnvoye = false;
  const lien = lienAvisGoogle(r.pro.cabinet);
  if (demanderAvis && raison === "termine" && lien) {
    await envoyer({ to: n.client_email, type: "avis_client", rdv: n, ...mails.avisClient(n, lien) });
    await maj(r.id, { avis_demande_le: new Date().toISOString() });
    avisEnvoye = true;
    // Suivi dans le menu « Avis » (relances automatiques si l'option est active).
    const { data: p } = await createAdminClient().from("professionals").select("cabinet_id").eq("id", r.pro.id).maybeSingle();
    if (p?.cabinet_id) {
      await creerDemandeAvis({ cabinetId: p.cabinet_id, bookingId: r.id, clientNom: nomClient(n), clientEmail: n.client_email, dejaEnvoye: true })
        .catch((e) => console.warn("[avis] suivi de la demande :", e instanceof Error ? e.message : e));
    }
  }
  const label = RAISONS_SUPPRESSION.find((x) => x.id === raison)?.label ?? raison;
  await notifierSlack(r.pro.profession, `🗂️ Rendez-vous clôturé : ${label}${avisEnvoye ? " · avis Google demandé" : ""}`, [
    ["Cabinet", r.pro.cabinet?.nom || nomPro(r)], ["Client", nomClient(r)], ["Précision", detail?.trim() || null],
  ]);
  return { avisEnvoye };
}

/* ---------------- Actions du client ---------------- */
export async function choisirCreneau(r: RdvComplet, index: number, base: string) {
  if (r.statut !== "proposé") throw new ErreurRdv("Aucun créneau à choisir");
  const c = r.creneaux_proposes?.[index];
  if (!c) throw new ErreurRdv("Créneau introuvable");
  if (new Date(c.debut).getTime() < Date.now()) throw new ErreurRdv("Ce créneau est passé");
  const n = await versAgenda(await maj(r.id, { statut: "confirmé", creneau_debut: c.debut, creneau_fin: c.fin }));
  const l = liens(n, base);
  await envoyer({ to: n.client_email, type: "confirme_client", rdv: n, ics: invitation(n), ...mails.confirmeClient(n, l) });
  await envoyer({ to: n.pro.email, type: "choix_pro", rdv: n, ...mails.choixPro(n, l) });
  return n;
}

export const peutAnnulerClient = (r: RdvComplet) =>
  ["demandé", "proposé"].includes(r.statut) || (r.statut === "confirmé" && new Date(r.creneau_debut).getTime() - Date.now() > H24);

export const RAISONS_ANNULATION: Record<string, string> = {
  plus_besoin: "Je n'en ai plus besoin",
  imprevu: "J'ai un imprévu",
  autre_pro: "J'ai trouvé quelqu'un d'autre",
  autre: "Autre raison",
};

export async function annulerParClient(r: RdvComplet, base: string, raison: string) {
  if (!peutAnnulerClient(r)) throw new ErreurRdv("Annulation en ligne impossible moins de 24 h avant : contactez le cabinet");
  if (!RAISONS_ANNULATION[raison]) throw new ErreurRdv("Indiquez la raison de l'annulation");
  const n = await maj(r.id, { statut: "annulé", annule_par: "client", annulation_raison: raison });
  if (r.agenda_event_id) await supprimerEvenement(r.pro.id, r.agenda_event_id);
  await envoyer({ to: n.pro.email, type: "annule_pro", rdv: n, ...mails.annulePro(n, liens(n, base)) });
  return n;
}

/* ---------------- Tâches planifiées ---------------- */
export async function tachesPlanifiees() {
  const db = createAdminClient();
  const now = Date.now();
  const res = { relances: 0, annulations: 0, rappels: 0 };

  // Relance à 24 h, annulation automatique à 72 h.
  const { data: attente } = await db.from("bookings").select("id, created_at, relance_envoyee_at").eq("statut", "demandé");
  for (const b of attente ?? []) {
    const age = now - new Date(b.created_at).getTime();
    const r = await rdvParId(b.id);
    if (!r) continue;
    const base = baseUrl(null, r);
    if (age > 3 * H24) {
      const n = await maj(r.id, { statut: "annulé", annule_par: "auto" });
      await envoyer({ to: n.client_email, type: "annule_client", rdv: n, ...mails.annuleClient(n, liens(n, base), "auto") });
      res.annulations++;
    } else if (age > H24 && !b.relance_envoyee_at) {
      await maj(r.id, { relance_envoyee_at: new Date().toISOString() });
      await envoyer({ to: r.pro.email, type: "relance_pro", rdv: r, ...mails.relancePro(r, liens(r, base)) });
      res.relances++;
    }
  }

  // Rappel la veille (rendez-vous dans 12 à 36 h).
  const { data: demain } = await db.from("bookings").select("id").eq("statut", "confirmé").is("rappel_envoye_at", null)
    .gte("creneau_debut", new Date(now + 12 * 3600e3).toISOString()).lte("creneau_debut", new Date(now + 36 * 3600e3).toISOString());
  for (const b of demain ?? []) {
    const r = await rdvParId(b.id);
    if (!r) continue;
    const l = liens(r, baseUrl(null, r));
    await maj(r.id, { rappel_envoye_at: new Date().toISOString() });
    await envoyer({ to: r.client_email, type: "rappel_client", rdv: r, ...mails.rappelClient(r, l) });
    await envoyer({ to: r.pro.email, type: "rappel_pro", rdv: r, ...mails.rappelPro(r, l) });
    res.rappels++;
  }
  return res;
}
