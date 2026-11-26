import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { notifierSlack, infosCabinet } from "@/lib/slack";
import {
  DELAI_CARTE_H, DELAI_CONTESTATION_H, FENETRE_DOUBLON_JOURS, RAISONS_CONTESTATION, STATUTS_FACTURABLES,
  debutMois, moisCle, prixLead, type RaisonContestation,
} from "@/lib/leads";

/* Facturation au lead, côté serveur (voir lib/leads.ts pour les règles). */

type Cab = { id: string; leads_actifs?: boolean | null; leads_plafond?: number | null };

/** Formule page sans carte : une demande reçue il y a plus de 48 h → réservation en pause jusqu'à l'ajout de la carte. */
async function enAttenteDeCarte(cabinetId: string) {
  const db = createAdminClient();
  const { data: c } = await db.from("cabinets").select("page_seule, leads_carte_at").eq("id", cabinetId).maybeSingle();
  if (!c?.page_seule || c.leads_carte_at) return false;
  const { count } = await db.from("leads").select("id", { count: "exact", head: true }).eq("cabinet_id", cabinetId)
    .lte("created_at", new Date(Date.now() - DELAI_CARTE_H * 3600e3).toISOString());
  return (count ?? 0) > 0;
}

/** Nombre de leads comptés ce mois-ci (hors contestés et annulés). */
export async function leadsDuMois(cabinetId: string) {
  const { count } = await createAdminClient().from("leads").select("id", { count: "exact", head: true })
    .eq("cabinet_id", cabinetId).in("statut", STATUTS_FACTURABLES).gte("created_at", debutMois());
  return count ?? 0;
}

/** Recalcule cabinets.leads_ouverts (lu par la fiche clotere.fr et le tunnel de rdv). */
export async function majOuvertureLeads(cabinetId: string) {
  const db = createAdminClient();
  const { data: cab } = await db.from("cabinets").select("id, leads_actifs, leads_plafond, leads_ouverts").eq("id", cabinetId).maybeSingle();
  if (!cab) return false;
  const ouverts = !!cab.leads_actifs && (cab.leads_plafond == null || (await leadsDuMois(cabinetId)) < cab.leads_plafond) && !(await enAttenteDeCarte(cabinetId));
  if (ouverts !== cab.leads_ouverts) {
    await db.from("cabinets").update({ leads_ouverts: ouverts }).eq("id", cabinetId);
    if (!ouverts && cab.leads_actifs) {
      const i = await infosCabinet(cabinetId);
      const carte = await enAttenteDeCarte(cabinetId);
      await notifierSlack(i.profession, carte ? `⏸️ Page en pause, carte non ajoutée sous 48 h : ${i.cabinet}` : `🔒 Plafond de leads atteint : ${i.cabinet}`,
        carte ? [["Contact", i.contact]] : [["Plafond", String(cab.leads_plafond)]]);
    }
  }
  return ouverts;
}

/** Le cabinet accepte-t-il une nouvelle demande via clotere.fr ? */
export async function leadsOuverts(cab: Cab) {
  return !!cab.leads_actifs && (cab.leads_plafond == null || (await leadsDuMois(cab.id)) < cab.leads_plafond) && !(await enAttenteDeCarte(cab.id));
}

type RdvLead = {
  id: string; professional_id: string; client_email: string; client_prenom: string | null; client_nom: string | null;
  creneau_debut: string; creneau_fin: string | null; motif_libelle?: string | null;
};

export type LeadMail = { facture: boolean; montantHT: number; contestableJusqu: string };

/** Crée le lead d'une demande venue de clotere.fr (appelé juste après l'insertion du rendez-vous).
    Renvoie de quoi informer le pro dans l'e-mail de nouvelle demande. */
export async function enregistrerLead(r: RdvLead): Promise<LeadMail | null> {
  const db = createAdminClient();
  const { data: pro } = await db.from("professionals").select("cabinet_id, profession").eq("id", r.professional_id).maybeSingle();
  if (!pro?.cabinet_id) return null;

  // Même client, même cabinet, dans les 30 derniers jours : non facturé.
  const depuis = new Date(Date.now() - FENETRE_DOUBLON_JOURS * 86400e3).toISOString();
  const { data: memesClient } = await db.from("bookings").select("id").eq("client_email", r.client_email).neq("id", r.id).gte("created_at", depuis);
  const ids = (memesClient ?? []).map((b) => b.id);
  const { count: doublons } = ids.length
    ? await db.from("leads").select("id", { count: "exact", head: true }).eq("cabinet_id", pro.cabinet_id).in("booking_id", ids)
    : { count: 0 };

  const fin = new Date(r.creneau_fin ?? r.creneau_debut);
  const contestableJusqu = new Date(fin.getTime() + DELAI_CONTESTATION_H * 3600e3).toISOString();
  const prenom = (r.client_prenom ?? "").trim();
  const initiale = (r.client_nom ?? "").trim().charAt(0);
  const { error } = await db.from("leads").insert({
    booking_id: r.id, cabinet_id: pro.cabinet_id, professional_id: r.professional_id,
    profession: pro.profession === "comptable" ? "comptable" : "avocat",
    montant_ht_cents: prixLead(pro.profession) * 100,
    statut: doublons ? "annule" : "en_attente",
    raison: doublons ? "doublon_auto" : null,
    client_label: [prenom, initiale ? `${initiale.toUpperCase()}.` : ""].filter(Boolean).join(" ") || "Client",
    motif: r.motif_libelle ?? null,
    creneau_debut: r.creneau_debut,
    contestable_jusqu: contestableJusqu,
  });
  if (error) console.error("[leads] création :", error.message);
  await majOuvertureLeads(pro.cabinet_id);
  return error ? null : { facture: !doublons, montantHT: prixLead(pro.profession), contestableJusqu };
}

/** Le client a annulé sa demande : le lead n'est pas facturé. */
export async function annulerLeadParClient(bookingId: string) {
  const db = createAdminClient();
  const { data: l } = await db.from("leads").update({ statut: "annule", raison: "client" })
    .eq("booking_id", bookingId).eq("statut", "en_attente").select("cabinet_id").maybeSingle();
  if (l) await majOuvertureLeads(l.cabinet_id);
}

/** Contestation par le pro, possible tant que le lead est « en_attente ». */
export async function contesterLead(cabinetId: string, leadId: string, raison: RaisonContestation, detail: string) {
  const db = createAdminClient();
  const { data: l } = await db.from("leads").update({
    statut: "conteste", raison, raison_detail: detail.slice(0, 500) || null, conteste_at: new Date().toISOString(),
  }).eq("id", leadId).eq("cabinet_id", cabinetId).eq("statut", "en_attente").gt("contestable_jusqu", new Date().toISOString())
    .select("id, client_label, motif, montant_ht_cents").maybeSingle();
  if (!l) return false;
  await majOuvertureLeads(cabinetId);
  const i = await infosCabinet(cabinetId);
  await notifierSlack(i.profession, `↩️ Lead contesté : ${i.cabinet}`, [
    ["Raison", RAISONS_CONTESTATION.find((x) => x.id === raison)?.label], ["Détail", detail || null],
    ["Client", l.client_label], ["Motif", l.motif], ["Montant", `${l.montant_ht_cents / 100} € HT`],
  ]);
  return true;
}

/* ── Tâches planifiées (cron horaire) ───────────────────────────────────── */

export async function tachesLeads() {
  const db = createAdminClient();
  const maintenant = new Date().toISOString();

  // 0. Formule page : pause des pages ouvertes sans carte dont la première demande a plus de 48 h.
  const { data: sansCarte } = await db.from("cabinets").select("id").eq("page_seule", true).is("leads_carte_at", null).eq("leads_ouverts", true).limit(500);
  for (const c of sansCarte ?? []) await majOuvertureLeads(c.id);
  let clos = 0, lignes = 0, factures = 0;

  // 1. Fin du délai de contestation : facturable, sauf si le client a annulé entre-temps.
  const { data: echus } = await db.from("leads").select("id, booking_id, bookings(annule_par, statut)")
    .eq("statut", "en_attente").lte("contestable_jusqu", maintenant).limit(500);
  for (const l of echus ?? []) {
    const b = (Array.isArray(l.bookings) ? l.bookings[0] : l.bookings) as { annule_par?: string | null; statut?: string } | null;
    const parClient = b?.statut === "annulé" && b?.annule_par === "client";
    await db.from("leads").update(parClient ? { statut: "annule", raison: "client" } : { statut: "a_facturer" }).eq("id", l.id);
    clos++;
  }

  // 2. Lignes de facture Stripe pour les leads « à facturer ».
  const { data: aFacturer } = await db.from("leads")
    .select("id, cabinet_id, montant_ht_cents, client_label, motif, creneau_debut, profession, cabinets(stripe_customer_id, nom)")
    .eq("statut", "a_facturer").limit(200);
  for (const l of aFacturer ?? []) {
    const cab = (Array.isArray(l.cabinets) ? l.cabinets[0] : l.cabinets) as { stripe_customer_id?: string | null; nom?: string } | null;
    if (!cab?.stripe_customer_id) { console.warn("[leads] pas de client Stripe pour", l.cabinet_id); continue; }
    try {
      const jour = l.creneau_debut ? new Date(l.creneau_debut).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" }) : "";
      const item = await stripe<{ id: string }>("invoiceitems", {
        customer: cab.stripe_customer_id, currency: "eur", amount: l.montant_ht_cents, tax_behavior: "exclusive",
        description: `Rendez-vous Clotere · ${l.client_label ?? "Client"}${l.motif ? ` · ${l.motif}` : ""}${jour ? ` · ${jour}` : ""}`,
        metadata: { lead_id: l.id, cabinet_id: l.cabinet_id },
      });
      await db.from("leads").update({ statut: "facture", stripe_invoice_item: item.id, facture_at: new Date().toISOString() }).eq("id", l.id);
      lignes++;
    } catch (e) {
      console.error("[leads] ligne de facture", l.id, e);
    }
  }

  // 3. Une fois par mois : facture des lignes en attente (celles déjà reprises par la facture d'abonnement sont ignorées par Stripe).
  const mois = moisCle();
  const { data: cabs } = await db.from("cabinets").select("id, stripe_customer_id")
    .not("stripe_customer_id", "is", null).or(`leads_facture_mois.is.null,leads_facture_mois.neq.${mois}`);
  for (const c of cabs ?? []) {
    const { count } = await db.from("leads").select("id", { count: "exact", head: true })
      .eq("cabinet_id", c.id).eq("statut", "facture").lt("facture_at", debutMois());
    if (!count) {
      await db.from("cabinets").update({ leads_facture_mois: mois }).eq("id", c.id);
      continue;
    }
    try {
      const facture = await stripe<{ id: string }>("invoices", {
        customer: c.stripe_customer_id, collection_method: "charge_automatically", auto_advance: true,
        pending_invoice_items_behavior: "include", description: "Rendez-vous apportés par Clotere (mois précédent)",
      });
      await stripe(`invoices/${facture.id}/finalize`, {});
      factures++;
    } catch (e) {
      // « Nothing to invoice » : les lignes ont déjà été reprises par la facture de l'abonnement.
      console.warn("[leads] facture mensuelle", c.id, String(e).slice(0, 200));
    }
    await db.from("cabinets").update({ leads_facture_mois: mois }).eq("id", c.id);
  }

  // 4. Plafonds : réouverture au changement de mois, fermeture si atteint.
  const { data: actifs } = await db.from("cabinets").select("id").eq("leads_actifs", true);
  for (const c of actifs ?? []) await majOuvertureLeads(c.id);

  return { leads_clos: clos, leads_lignes: lignes, leads_factures: factures };
}
