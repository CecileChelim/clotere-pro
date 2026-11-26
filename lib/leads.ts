/* Facturation au lead : demandes de rendez-vous prises depuis les fiches clotere.fr (bookings.source = "clotere").
   Règles :
   - activation : carte enregistrée (Stripe Checkout « setup »), facultativement un plafond mensuel ;
   - un lead est contestable jusqu'à 48 h après le créneau (client absent, hors domaine, doublon, fausse demande) ;
   - annulé automatiquement si le client annule, ou si le même client a déjà fait une demande au cabinet sous 30 jours ;
   - à l'issue du délai, il devient une ligne de facture Stripe, facturée chaque mois (en plus de l'abonnement). */

export type ProfessionLead = "avocat" | "comptable";

// Prix HT d'un lead par métier (validé le 2026-11-26 : 40 € pour tous).
export const PRIX_LEAD_HT: Record<ProfessionLead, number> = { avocat: 40, comptable: 40 };

export const DELAI_CONTESTATION_H = 48;
/** Formule page : sans carte, la réservation se met en pause 48 h après la première demande. */
export const DELAI_CARTE_H = 48;
export const FENETRE_DOUBLON_JOURS = 30;
export const PLAFONDS_PROPOSES = [5, 10, 20, 50] as const;

export const RAISONS_CONTESTATION = [
  { id: "absent", label: "Le client ne s'est pas présenté" },
  { id: "hors_domaine", label: "La demande ne relève pas de mes domaines" },
  { id: "doublon", label: "Client déjà connu ou demande en double" },
  { id: "spam", label: "Fausse demande ou coordonnées invalides" },
  { id: "autre", label: "Autre raison" },
] as const;
export type RaisonContestation = (typeof RAISONS_CONTESTATION)[number]["id"];
export const estRaison = (x: unknown): x is RaisonContestation => RAISONS_CONTESTATION.some((r) => r.id === x);

export const STATUTS_LEAD: Record<string, { label: string; classe: string }> = {
  en_attente: { label: "Contestable", classe: "bg-amber-50 text-amber-800" },
  a_facturer: { label: "À facturer", classe: "bg-violet-50 text-violet-700" },
  facture: { label: "Facturé", classe: "bg-gray-100 text-gray-700" },
  conteste: { label: "Contesté · non facturé", classe: "bg-emerald-50 text-emerald-700" },
  annule: { label: "Annulé · non facturé", classe: "bg-emerald-50 text-emerald-700" },
};

/** Statuts qui comptent dans le plafond et la facture du mois. */
export const STATUTS_FACTURABLES = ["en_attente", "a_facturer", "facture"];

export const prixLead = (profession: string | null | undefined) => PRIX_LEAD_HT[profession === "comptable" ? "comptable" : "avocat"];

/** Premier jour du mois courant (heure de Paris approchée par UTC, suffisant pour un plafond mensuel). */
export function debutMois(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}
/** Date ISO d'il y a n jours. */
export const ilYa = (jours: number) => new Date(Date.now() - jours * 86400e3).toISOString();
export const moisCle = (d = new Date()) => d.toISOString().slice(0, 7);
