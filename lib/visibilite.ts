export type StatutArticle = "a_relire" | "modifs_demandees" | "valide" | "publie";

export type Article = {
  id: string; cabinet_id: string; mois: string; titre: string; mot_cle: string | null; contenu: string; statut: StatutArticle;
  commentaire_client: string | null; modifie_par_client: boolean; valide_auto: boolean; url_publication: string | null;
  clics: number | null; impressions: number | null; pousse_le: string; valide_le: string | null; publie_le: string | null;
};
export type StatMois = { mois: string; clics: number; impressions: number; position: number | null };
export type Rapport = { id: string; titre: string; periode: string | null; created_at: string };

export const STATUT_ARTICLE: Record<StatutArticle, { label: string; classe: string }> = {
  a_relire: { label: "À relire", classe: "bg-amber-50 text-amber-800 ring-amber-200" },
  modifs_demandees: { label: "Modifications demandées", classe: "bg-sky-50 text-sky-800 ring-sky-200" },
  valide: { label: "Validé", classe: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  publie: { label: "Publié", classe: "bg-gray-950 text-white ring-gray-950" },
};

export const VALIDATION_AUTO_JOURS = 7;

export const moisLabel = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

/** Date limite de relecture : validation automatique au-delà. */
export const limiteRelecture = (pousse: string) => new Date(new Date(pousse).getTime() + VALIDATION_AUTO_JOURS * 86400000);
