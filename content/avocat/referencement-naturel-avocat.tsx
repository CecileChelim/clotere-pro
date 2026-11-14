import { OFFRE_SEO } from "@/components/landing/OffreSeo";
import type { ProductPageData } from "@/components/landing/ProductTemplate";
import { ApercuAnnonceGoogle, ApercuArticle, ApercuRapport, ApercuReponseIA } from "@/components/landing/apercus";
import { CTA_DEMO, CTA_SITE, PAGES } from "@/lib/landing-avocat";
import { FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT } from "./shared";

// Contenu repris de la maquette Figma « produit/referencement-naturel-avocat ».
export const referencementNaturelAvocat: ProductPageData = {
  path: PAGES.seo,
  meta: {
    title: "Référencement naturel pour avocat",
    description:
      "Articles sur vos domaines, fiche Google optimisée, référencement local : faites de votre cabinet d’avocat celui que Google affiche dans votre ville.",
  },
  hero: {
    eyebrow: "RÉFÉRENCEMENT POUR AVOCATS",
    title: "Le cabinet que Google affiche dans votre ville.",
    subtitle: "Référencement naturel, fiche Google et campagnes Google Ads : on vous rend visible sur les recherches de vos futurs clients.",
    ctas: [CTA_DEMO],
    note: "Conforme aux règles de la profession · Sans engagement · Reporting mensuel",
  },
  stats: [
    { value: "1 à 3 mois", label: "pour vos premières positions sur des recherches précises" },
    { value: "Chaque mois", label: "de nouveaux articles publiés sur vos domaines" },
    { value: "1 rapport", label: "mensuel : positions, visites et rendez-vous générés" },
  ],
  features: {
    title: "Ce qu’on fait pour votre visibilité.",
    items: [
      {
        eyebrow: "SEO · RÉFÉRENCEMENT NATUREL",
        title: "Des articles qui répondent à vos futurs clients.",
        text: "Durable, sur vos domaines : nous rédigeons les questions que se posent vos clients, vous validez avant publication. Des articles et des pages optimisés, publiés chaque mois sur votre site.",
        points: ["Sujets choisis selon les recherches réelles", "Relus et validés par vous", "Optimisation technique et référencement local"],
        visual: <ApercuArticle />,
      },
      {
        eyebrow: "SEA · GOOGLE ADS",
        title: "Rapide, dès les premières semaines.",
        text: "Des campagnes Google Ads ciblées sur votre ville et vos domaines pour capter les recherches urgentes, le temps que le référencement naturel prenne le relais.",
        points: ["Campagnes par domaine", "Annonces conformes, validées par vous", "Budget maîtrisé"],
        href: PAGES.ads,
        linkLabel: "Découvrir Google Ads",
        visual: <ApercuAnnonceGoogle />,
      },
      {
        eyebrow: "GEO · IA",
        title: "Visible dans les réponses des IA.",
        text: "Votre cabinet cité par ChatGPT, Gemini ou Perplexity quand vos futurs clients leur posent la question.",
        points: ["Contenus structurés", "Données cohérentes partout", "Suivi des citations"],
        href: PAGES.ia,
        linkLabel: "Découvrir l’IA",
        visual: <ApercuReponseIA />,
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
  pricing: OFFRE_SEO,
  faq: [
    {
      q: "Combien de temps avant des résultats ?",
      a: "Les premières positions sur des recherches précises arrivent en 1 à 3 mois. Les recherches très concurrentielles demandent plutôt 6 à 12 mois, d’où l’intérêt de Google Ads au démarrage.",
    },
    { q: "Qui écrit les articles ?", a: "Notre équipe, sur vos domaines d’intervention et votre ville. Vous relisez et validez chaque article avant publication." },
    FAQ_DEONTOLOGIE,
    FAQ_ENGAGEMENT,
  ],
  guide: {
    link: { href: "/blog/visibilite-referencement-avocat-guide-2026", label: "Lire le guide complet" },
    title: "Référencement naturel d’un cabinet d’avocat : le guide",
    intro:
      "« Avocat divorce Lyon », « avocat licenciement Nantes » : vos futurs clients tapent leur besoin et leur ville, puis appellent l’un des premiers cabinets affichés. Le référencement naturel consiste à faire partie de ces premiers résultats, durablement, sans payer chaque clic.",
    sections: [
      {
        title: "Les trois piliers du référencement local",
        paragraphs: [
          "Pour une recherche locale, Google s’appuie sur la pertinence de votre site pour la requête, sur votre proximité avec la personne qui cherche et sur la notoriété de votre cabinet. Concrètement : des pages claires par domaine et par ville, une fiche Google complète et des avis réguliers.",
        ],
      },
      {
        title: "Des contenus qui répondent à de vraies questions",
        paragraphs: [
          "Vos clients ne cherchent pas seulement un avocat, ils cherchent une réponse : délais, étapes d’une procédure, documents à réunir. Des articles qui traitent ces questions, sur vos domaines, attirent des visiteurs déjà concernés et installent votre expertise avant même le premier contact.",
          "La régularité compte davantage que le volume : quelques articles de qualité publiés chaque mois valent mieux qu’une série d’articles courts publiés d’un coup.",
        ],
      },
      {
        title: "La fiche Google, souvent la première impression",
        paragraphs: [
          "Sur mobile, la fiche Google s’affiche avant même les sites. Catégories exactes, horaires à jour, photos du cabinet, publications et bouton de prise de rendez-vous : chaque élément complété augmente vos chances d’être choisi. Les avis, et les réponses que vous y apportez, jouent un rôle important.",
        ],
      },
      {
        title: "Mesurer pour ajuster",
        paragraphs: [
          "Un bon suivi ne se limite pas aux positions : il mesure les visites, les appels et surtout les demandes de rendez-vous générées. C’est ce qui permet de savoir quels domaines et quels contenus rapportent réellement des clients, et où concentrer les efforts.",
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
