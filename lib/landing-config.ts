// Configuration des sites vitrines par profession (avocat.clotere.fr, comptable.clotere.fr) :
// menus, liens, footer, image de partage. Les composants de components/landing/ la reçoivent en prop.

export type ProfessionId = "avocat" | "comptable";

export type Lien = { href: string; label: string };
export type MenuEntry = Lien & { description: string };
export type Cta = Lien & { style?: "primary" | "secondary" };

export const DEMO_LINK = "https://calendar.app.google/k2btydyaoysdvgTx6";
export const SIGNUP = "/signup";
export const LOGIN = "/login";

export const CTA_DEMO: Cta = { href: DEMO_LINK, label: "Réserver une démo" };
export const CTA_SITE: Cta = { href: "/creer-mon-site", label: "Créer mon site" };

/** Date de dernière mise à jour des landings (sitemap.xml). À changer quand le contenu des pages évolue. */
export const LANDINGS_MAJ = "2026-11-14";

export const isExternal = (href: string) => href.startsWith("http") || href.startsWith("mailto:");

type Pages = { site: string; rdv: string; seo: string; ads: string; ia: string };

export type LandingConfig = {
  id: ProfessionId;
  /** Nom du site (Open Graph, JSON-LD). */
  nom: string;
  /** Pastille à côté du logo. */
  badge: string;
  siteUrl: string;
  pages: Pages;
  produits: MenuEntry[];
  solutions: MenuEntry[];
  footer: { titre: string; liens: Lien[] }[];
  disclaimer: string;
  share: { url: string; alt: string };
  /** Public visé (JSON-LD Service). */
  audience: string;
};

const legal = {
  titre: "Légal",
  liens: [
    { href: "https://notaire.clotere.fr/mentions-legales", label: "Mentions légales" },
    { href: "https://notaire.clotere.fr/politique-confidentialite", label: "Confidentialité" },
    { href: "https://notaire.clotere.fr/cgv", label: "CGV" },
  ],
};

function solutionsCol(p: Pages) {
  return {
    titre: "Solutions",
    liens: [
      { href: p.site, label: "Site internet" },
      { href: p.rdv, label: "Prise de rendez-vous" },
      { href: p.seo, label: "Référencement" },
      { href: p.ads, label: "Google Ads" },
      { href: p.ia, label: "IA" },
    ],
  };
}

const AVOCAT_PAGES: Pages = {
  site: "/produit/creation-site-internet-avocat",
  rdv: "/produit/rendez-vous-en-ligne-avocat",
  seo: "/produit/referencement-naturel-avocat",
  ads: "/solution/google-ads-avocat",
  ia: "/solution/ia-avocat",
};

const COMPTABLE_PAGES: Pages = {
  site: "/produit/creation-site-internet-expert-comptable",
  rdv: "/produit/rendez-vous-en-ligne-expert-comptable",
  seo: "/produit/referencement-naturel-expert-comptable",
  ads: "/solution/google-ads-expert-comptable",
  ia: "/solution/ia-expert-comptable",
};

export const CONFIGS: Record<ProfessionId, LandingConfig> = {
  avocat: {
    id: "avocat",
    nom: "Clotere Avocat",
    badge: "AVOCATS",
    siteUrl: "https://avocat.clotere.fr",
    pages: AVOCAT_PAGES,
    produits: [
      { href: AVOCAT_PAGES.site, label: "Site internet avocat", description: "Votre site de cabinet en ligne en 10 minutes, prise de rendez-vous incluse." },
      { href: AVOCAT_PAGES.rdv, label: "Prise de rendez-vous en ligne", description: "Des rendez-vous qualifiés, 24h/24, dans votre agenda." },
      { href: AVOCAT_PAGES.seo, label: "Référencement naturel", description: "Le cabinet que Google affiche dans votre ville." },
    ],
    solutions: [
      { href: AVOCAT_PAGES.ads, label: "Google Ads avocat", description: "Des demandes de clients dès les premières semaines." },
      { href: AVOCAT_PAGES.ia, label: "IA avocat", description: "Votre cabinet cité par ChatGPT, Gemini et Perplexity." },
    ],
    footer: [
      solutionsCol(AVOCAT_PAGES),
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
      legal,
    ],
    disclaimer: "Clotere n’est pas un cabinet d’avocats.",
    share: { url: "/img/share-avocat.png", alt: "Clotere — la solution croissance des avocats" },
    audience: "Cabinets d’avocats",
  },
  comptable: {
    id: "comptable",
    nom: "Clotere Expert-comptable",
    badge: "EXPERTS-COMPTABLES",
    siteUrl: "https://comptable.clotere.fr",
    pages: COMPTABLE_PAGES,
    produits: [
      { href: COMPTABLE_PAGES.site, label: "Site internet expert-comptable", description: "Votre site de cabinet en ligne en 10 minutes, prise de rendez-vous incluse." },
      { href: COMPTABLE_PAGES.rdv, label: "Prise de rendez-vous en ligne", description: "Des rendez-vous qualifiés, 24h/24, dans votre agenda." },
      { href: COMPTABLE_PAGES.seo, label: "Référencement naturel", description: "Le cabinet que Google affiche dans votre ville." },
    ],
    solutions: [
      { href: COMPTABLE_PAGES.ads, label: "Google Ads expert-comptable", description: "Des demandes de clients dès les premières semaines." },
      { href: COMPTABLE_PAGES.ia, label: "IA expert-comptable", description: "Votre cabinet cité par ChatGPT, Gemini et Perplexity." },
    ],
    footer: [
      solutionsCol(COMPTABLE_PAGES),
      {
        titre: "Clotere",
        liens: [
          { href: "https://notaire.clotere.fr", label: "Notaires" },
          { href: "https://avocat.clotere.fr", label: "Avocats" },
          { href: "/", label: "Experts-comptables" },
          { href: "/blog", label: "Blog" },
          { href: LOGIN, label: "Se connecter" },
        ],
      },
      legal,
    ],
    disclaimer: "Clotere n’est pas un cabinet d’expertise comptable.",
    share: { url: "/img/share-comptable.png", alt: "Clotere — la solution croissance des experts-comptables" },
    audience: "Cabinets d’expertise comptable",
  },
};
