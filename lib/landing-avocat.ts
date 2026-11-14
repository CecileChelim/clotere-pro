// Configuration du site vitrine avocat.clotere.fr (menus, liens, CTA).

export const SITE_URL = "https://avocat.clotere.fr";
export const DEMO_LINK = "https://calendar.app.google/k2btydyaoysdvgTx6";
export const SIGNUP = "/signup";
export const LOGIN = "/login";

export type Lien = { href: string; label: string };
export type MenuEntry = Lien & { description: string };
export type Cta = Lien & { style?: "primary" | "secondary" };

export const CTA_DEMO: Cta = { href: DEMO_LINK, label: "Réserver une démo" };
export const CTA_SITE: Cta = { href: SIGNUP, label: "Créer mon site" };

export const PAGES = {
  site: "/produit/creation-site-internet-avocat",
  rdv: "/produit/rendez-vous-en-ligne-avocat",
  seo: "/produit/referencement-naturel-avocat",
  ads: "/solution/google-ads-avocat",
  ia: "/solution/ia-avocat",
} as const;

/** Menu « Produits ». */
export const PRODUITS: MenuEntry[] = [
  { href: PAGES.site, label: "Site internet avocat", description: "Votre site de cabinet en ligne en 10 minutes, prise de rendez-vous incluse." },
  { href: PAGES.rdv, label: "Prise de rendez-vous en ligne", description: "Des rendez-vous qualifiés, 24h/24, dans votre agenda." },
  { href: PAGES.seo, label: "Référencement naturel", description: "Le cabinet que Google affiche dans votre ville." },
];

/** Menu « Solutions ». */
export const SOLUTIONS: MenuEntry[] = [
  { href: PAGES.ads, label: "Google Ads avocat", description: "Des demandes de clients dès les premières semaines." },
  { href: PAGES.ia, label: "IA avocat", description: "Votre cabinet cité par ChatGPT, Gemini et Perplexity." },
];

export const FOOTER_COLONNES: { titre: string; liens: Lien[] }[] = [
  {
    titre: "Solutions",
    liens: [
      { href: PAGES.site, label: "Site internet" },
      { href: PAGES.rdv, label: "Prise de rendez-vous" },
      { href: PAGES.seo, label: "Référencement" },
      { href: PAGES.ads, label: "Google Ads" },
      { href: PAGES.ia, label: "IA" },
    ],
  },
  {
    titre: "Clotere",
    liens: [
      { href: "https://notaire.clotere.fr", label: "Notaires" },
      { href: "/", label: "Avocats" },
      { href: "https://comptable.clotere.fr", label: "Experts-comptables" },
      { href: "/blog", label: "Blog" },
      { href: LOGIN, label: "Se connecter" },
    ],
  },
  {
    titre: "Légal",
    liens: [
      { href: "https://notaire.clotere.fr/mentions-legales", label: "Mentions légales" },
      { href: "https://notaire.clotere.fr/politique-confidentialite", label: "Confidentialité" },
      { href: "https://notaire.clotere.fr/cgv", label: "CGV" },
    ],
  },
];

export const isExternal = (href: string) => href.startsWith("http") || href.startsWith("mailto:");
