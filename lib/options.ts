/* Options payantes souscrites depuis l'espace pro (upsell Stripe), en plus de l'abonnement de base à 69 € HT. */

export type OptionPayante = "visibilite" | "avis";

export const OPTIONS: Record<OptionPayante, {
  nom: string; produit: string; prixMensuelHT: number; fraisLancementHT?: number;
  /** Variable d'environnement contenant l'ID de prix Stripe (sinon prix créé à la volée). */
  envPrix: string; envPrixLancement?: string; retour: string;
}> = {
  visibilite: {
    nom: "Visibilité", produit: "option Visibilité (articles SEO, fiche Google, rapports)",
    prixMensuelHT: 300, fraisLancementHT: 500,
    envPrix: "STRIPE_PRICE_VISIBILITE", envPrixLancement: "STRIPE_PRICE_VISIBILITE_LANCEMENT", retour: "/dashboard/visibilite",
  },
  avis: {
    nom: "Avis Google", produit: "option Avis Google (demandes, relances, réponses)",
    prixMensuelHT: 39,
    envPrix: "STRIPE_PRICE_AVIS", retour: "/dashboard/avis",
  },
};

export const estOption = (x: unknown): x is OptionPayante => x === "visibilite" || x === "avis";

/** L'option Avis est incluse dans Visibilité. */
export const avisActif = (c: { offre_avis?: boolean | null; offre_visibilite?: boolean | null } | null | undefined) =>
  !!(c?.offre_avis || c?.offre_visibilite);

export const prixLabel = (o: OptionPayante) => {
  const p = OPTIONS[o];
  return `${p.prixMensuelHT} € HT / mois${p.fraisLancementHT ? ` + ${p.fraisLancementHT} € de lancement` : ""}`;
};
