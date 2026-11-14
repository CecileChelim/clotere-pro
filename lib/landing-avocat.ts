// Raccourcis du site avocat.clotere.fr (la configuration complète est dans lib/landing-config.ts).
import { CONFIGS } from "./landing-config";

export { CTA_DEMO, CTA_SITE, DEMO_LINK, LOGIN, SIGNUP, isExternal } from "./landing-config";
export type { Cta, Lien, MenuEntry } from "./landing-config";

export const AVOCAT = CONFIGS.avocat;
export const SITE_URL = AVOCAT.siteUrl;
export const PAGES = AVOCAT.pages;
export const PRODUITS = AVOCAT.produits;
export const SOLUTIONS = AVOCAT.solutions;
export const FOOTER_COLONNES = AVOCAT.footer;
