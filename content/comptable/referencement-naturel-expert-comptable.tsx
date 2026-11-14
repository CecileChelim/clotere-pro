import type { ProductPageData } from "@/components/landing/ProductTemplate";
import { ApercuAnnonceGoogle, ApercuArticle, ApercuRapport, ApercuReponseIA } from "@/components/landing/apercus";
import { OFFRE_SEO } from "@/components/landing/OffreSeo";
import { CTA_DEMO, CTA_SITE } from "@/lib/landing-config";
import { PAGES } from "@/lib/landing-comptable";
import { FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT } from "./shared";

// Contenu repris de la maquette Figma « Expert-comptable · Référencement site expert-comptable (SEO / SEA) »,
// avec la même structure que la page avocat (4 features + offre sans prix).
export const referencementNaturelExpertComptable: ProductPageData = {
  profession: "comptable",
  path: PAGES.seo,
  meta: {
    title: "Référencement naturel pour expert-comptable",
    description:
      "Articles sur vos missions, fiche Google optimisée, référencement local : faites de votre cabinet d’expertise comptable celui que Google affiche dans votre ville.",
  },
  hero: {
    eyebrow: "RÉFÉRENCEMENT POUR EXPERTS-COMPTABLES",
    title: "Le cabinet que Google affiche dans votre ville.",
    subtitle: "Référencement naturel, fiche Google et campagnes Google Ads : on vous rend visible sur les recherches de vos futurs clients.",
    ctas: [CTA_DEMO],
    note: "Conforme aux règles de la profession · Sans engagement · Reporting mensuel",
  },
  stats: [
    { value: "1 à 3 mois", label: "pour vos premières positions sur des recherches précises" },
    { value: "Chaque mois", label: "de nouveaux articles publiés sur vos missions" },
    { value: "1 rapport", label: "mensuel : positions, visites et rendez-vous générés" },
  ],
  features: {
    title: "Ce qu’on fait pour votre visibilité.",
    items: [
      {
        eyebrow: "SEO · RÉFÉRENCEMENT NATUREL",
        title: "Des articles qui répondent à vos futurs clients.",
        text: "Durable, sur vos missions : nous rédigeons les questions que se posent les dirigeants, vous validez avant publication. Des articles et des pages optimisés, publiés chaque mois sur votre site.",
        points: ["Sujets choisis selon les recherches réelles", "Relus et validés par vous", "Optimisation technique et référencement local"],
        visual: <ApercuArticle p="comptable" />,
      },
      {
        eyebrow: "SEA · GOOGLE ADS",
        title: "Rapide, dès les premières semaines.",
        text: "Des campagnes Google Ads ciblées sur votre ville et vos missions pour capter les recherches urgentes, le temps que le référencement naturel prenne le relais.",
        points: ["Campagnes par mission", "Annonces conformes, validées par vous", "Budget maîtrisé"],
        href: PAGES.ads,
        linkLabel: "Découvrir Google Ads",
        visual: <ApercuAnnonceGoogle p="comptable" />,
      },
      {
        eyebrow: "GEO · IA",
        title: "Visible dans les réponses des IA.",
        text: "Votre cabinet cité par ChatGPT, Gemini ou Perplexity quand les dirigeants leur demandent un expert-comptable.",
        points: ["Contenus structurés", "Données cohérentes partout", "Suivi des citations"],
        href: PAGES.ia,
        linkLabel: "Découvrir l’IA",
        visual: <ApercuReponseIA p="comptable" />,
      },
      {
        eyebrow: "REPORTING",
        title: "Vous voyez ce que ça rapporte.",
        text: "Chaque mois : positions, visites et demandes de rendez-vous reçues.",
        points: ["Positions sur vos mots-clés", "Visites et appels", "Rendez-vous générés"],
        visual: <ApercuRapport titre="Rapport SEO · Octobre" />,
      },
    ],
  },
  pricing: { ...OFFRE_SEO, texte: "Le tarif dépend de votre ville et de vos missions : on vous le présente pendant la démo." },
  faq: [
    {
      q: "Combien de temps avant des résultats ?",
      a: "Les premières positions sur des recherches précises arrivent en 1 à 3 mois. Les recherches très concurrentielles demandent plutôt 6 à 12 mois, d’où l’intérêt de Google Ads au démarrage.",
    },
    { q: "Qui écrit les articles ?", a: "Notre équipe, sur vos missions et votre ville. Vous relisez et validez chaque article avant publication." },
    FAQ_DEONTOLOGIE,
    FAQ_ENGAGEMENT,
  ],
  guide: {
    link: { href: "/blog/visibilite-referencement-expert-comptable-guide-2026", label: "Lire le guide complet" },
    title: "Référencement naturel d’un cabinet d’expertise comptable : le guide",
    intro:
      "« Expert-comptable création SAS Lyon », « comptable LMNP Bordeaux » : les dirigeants tapent leur besoin et leur ville, puis contactent l’un des premiers cabinets affichés. Le référencement naturel consiste à faire partie de ces premiers résultats, durablement, sans payer chaque clic.",
    sections: [
      {
        title: "Les trois piliers du référencement local",
        paragraphs: [
          "Pour une recherche locale, Google s’appuie sur la pertinence de votre site, sur votre proximité avec la personne qui cherche et sur la notoriété de votre cabinet. Concrètement : des pages claires par mission et par ville, une fiche Google complète et des avis réguliers.",
        ],
      },
      {
        title: "Des contenus qui répondent à de vraies questions",
        paragraphs: [
          "Les dirigeants ne cherchent pas seulement un expert-comptable, ils cherchent une réponse : quel statut choisir, quand passer en société, comment déclarer une location meublée. Des articles qui traitent ces questions attirent des visiteurs déjà concernés.",
          "La régularité compte davantage que le volume : quelques articles de qualité chaque mois valent mieux qu’une série d’articles courts publiés d’un coup.",
        ],
      },
      {
        title: "La fiche Google, souvent la première impression",
        paragraphs: [
          "Sur mobile, la fiche Google s’affiche avant même les sites. Catégories exactes, horaires à jour, photos du cabinet, publications et bouton de prise de rendez-vous : chaque élément complété augmente vos chances d’être choisi.",
        ],
      },
      {
        title: "Mesurer pour ajuster",
        paragraphs: [
          "Un bon suivi mesure les positions, les visites, les appels et surtout les demandes de rendez-vous générées. C’est ce qui permet de savoir quelles missions et quels contenus rapportent réellement des clients.",
        ],
      },
    ],
  },
  cta: {
    title: "Faites le point sur votre visibilité.",
    subtitle: "On regarde ensemble votre site, votre fiche Google et vos concurrents.",
    ctas: [CTA_DEMO, CTA_SITE],
  },
};
