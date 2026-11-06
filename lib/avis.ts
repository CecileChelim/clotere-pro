/* Option « Avis Google » : types et constantes partagés client / serveur. */

export type StatutAvis = "a_repondre" | "repondu" | "ignore";
export type AvisRow = {
  id: string; auteur: string | null; photo: string | null; note: number | null; texte: string | null;
  publie_le: string | null; quand: string | null; reponse_google: string | null; reponse_suggeree: string | null; statut: StatutAvis;
};

export type StatutDemande = "en_cours" | "avis_recu" | "terminee" | "arretee";
export type EnvoiDemande = { type: "demande" | "relance"; le: string; envoye: boolean };
export type DemandeAvis = {
  id: string; booking_id: string | null; client_nom: string | null; client_email: string; statut: StatutDemande;
  historique: EnvoiDemande[]; nb_relances: number; prochaine_relance_le: string | null; created_at: string;
};

/** Relances automatiques : 1re relance 4 jours après la demande, 2de 6 jours après la 1re. On s'arrête là. */
export const DELAIS_RELANCE_JOURS = [4, 6] as const;
export const MAX_RELANCES = DELAIS_RELANCE_JOURS.length;
/** Sans avis 7 jours après la dernière relance, la demande est close. */
export const CLOTURE_JOURS = 7;

export const STATUT_DEMANDE: Record<StatutDemande, { label: string; classe: string }> = {
  en_cours: { label: "En attente", classe: "bg-amber-50 text-amber-800 ring-amber-200" },
  avis_recu: { label: "Avis reçu", classe: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  terminee: { label: "Sans réponse", classe: "bg-gray-100 text-gray-600 ring-gray-200" },
  arretee: { label: "Arrêtée", classe: "bg-gray-100 text-gray-600 ring-gray-200" },
};

export const etoiles = (n: number | null | undefined) => "★★★★★".slice(0, Math.max(0, Math.round(n ?? 0))) + "☆☆☆☆☆".slice(0, 5 - Math.max(0, Math.round(n ?? 0)));
