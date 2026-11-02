// Raisons de suppression d'un rendez-vous par le pro (partagé client / serveur).
export const RAISONS_SUPPRESSION = [
  { id: "termine", label: "Dossier mené à bien", aide: "Le rendez-vous a eu lieu et le dossier est terminé." },
  { id: "absent", label: "Le client ne s'est pas présenté", aide: "Rendez-vous manqué, client injoignable." },
  { id: "sans_suite", label: "Le client n'a pas donné suite", aide: "Pas de mission ou de dossier après l'échange." },
  { id: "hors_champ", label: "Hors de mon domaine", aide: "Demande que vous ne traitez pas." },
  { id: "doublon", label: "Doublon ou demande de test", aide: "" },
  { id: "autre", label: "Autre raison", aide: "" },
] as const;

export type RaisonSuppression = (typeof RAISONS_SUPPRESSION)[number]["id"];
export const estRaison = (x: unknown): x is RaisonSuppression => RAISONS_SUPPRESSION.some((r) => r.id === x);
