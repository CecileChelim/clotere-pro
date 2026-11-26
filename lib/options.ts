/* Options payantes souscrites depuis l'espace pro (upsell Stripe), en plus de l'abonnement de base à 69 € HT. */

export type OptionPayante = "visibilite" | "avis" | "widget" | "site";

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
  // Formule page : widget et site sont des abonnements séparés, résiliables l'un sans l'autre.
  widget: {
    nom: "Widget de prise de rendez-vous", produit: "widget de prise de rendez-vous (site, fiche Google, LinkedIn, e-mail)",
    prixMensuelHT: 69, // par professionnel du cabinet
    envPrix: "STRIPE_PRICE_WIDGET", retour: "/dashboard/widget",
  },
  site: {
    nom: "Site internet", produit: "site internet",
    prixMensuelHT: 99, // 69 € avec formulaire de contact seul (voir prixSite)
    envPrix: "STRIPE_PRICE_SITE", retour: "/dashboard/site",
  },
};

/** Site de la formule page : 99 € HT avec prise de rdv et actualités, 69 € HT avec formulaire de contact. */
export const prixSite = (c: { offre_rdv?: boolean | null } | null | undefined) => (c?.offre_rdv === false ? 69 : 99);

export const estOption = (x: unknown): x is OptionPayante => x === "visibilite" || x === "avis" || x === "widget" || x === "site";

/** L'option Avis est incluse dans Visibilité. */
export const avisActif = (c: { offre_avis?: boolean | null; offre_visibilite?: boolean | null } | null | undefined) =>
  !!(c?.offre_avis || c?.offre_visibilite);

export const prixLabel = (o: OptionPayante) => {
  const p = OPTIONS[o];
  return `${p.prixMensuelHT} € HT / mois${p.fraisLancementHT ? ` + ${p.fraisLancementHT} € de lancement` : ""}`;
};
