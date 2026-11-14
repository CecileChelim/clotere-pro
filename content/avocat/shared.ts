import { metaPage, shareImage } from "@/lib/landing-meta";

/** Questions de FAQ communes à plusieurs pages (maquettes Figma). */
export const FAQ_DEONTOLOGIE = {
  q: "Est-ce conforme aux règles de la profession ?",
  a: "Oui. Abonnement fixe, aucune rémunération liée à vos dossiers, contenus relus et validés par vous : nos outils respectent les règles de communication de la profession d’avocat.",
};

export const FAQ_ENGAGEMENT = { q: "Suis-je engagé ?", a: "Non. Nos offres sont sans engagement : vous arrêtez quand vous voulez." };

/** Métadonnées d'une landing (title complété par « · Clotere Avocat » via app/layout.tsx). */
export const SHARE_IMAGE = shareImage("avocat");
export { metaPage };
