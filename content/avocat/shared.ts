import { metaPage, shareImage } from "@/lib/landing-meta";

/** Questions de FAQ communes à plusieurs pages (maquettes Figma). */
export const FAQ_DEONTOLOGIE = {
  q: "Est-ce conforme aux règles de la profession ?",
  a: "Oui. Nos tarifs sont des montants fixes, sans aucun lien avec vos honoraires ni avec l’issue de vos dossiers, et Clotere n’encaisse jamais vos honoraires : votre client vous règle directement. Les contenus sont relus et validés par vous.",
};

export const FAQ_PAIEMENT_RDV = {
  q: "Comment fonctionne le modèle à la performance ?",
  a: "Aucun abonnement ni frais fixe : Clotere est rémunérée par un montant fixe pour chaque rendez-vous qu’elle vous apporte, présenté dans votre espace avant toute activation. Vous fixez votre budget mensuel. Un rendez-vous contesté (client absent, hors de vos domaines, doublon) n’est pas facturé.",
};

export const FAQ_ENGAGEMENT = { q: "Suis-je engagé ?", a: "Non. Nos offres sont sans engagement : vous arrêtez quand vous voulez." };

/** Métadonnées d'une landing (title complété par « · Clotere Avocat » via app/layout.tsx). */
export const SHARE_IMAGE = shareImage("avocat");
export { metaPage };
