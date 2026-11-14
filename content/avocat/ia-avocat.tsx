import type { ProductPageData } from "@/components/landing/ProductTemplate";
import { ApercuFicheGoogle, ApercuRapport, ApercuReponseIA } from "@/components/landing/apercus";
import { CTA_DEMO, CTA_SITE, PAGES } from "@/lib/landing-avocat";
import { FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT } from "./shared";

// Contenu repris de la maquette Figma « solution/ia-avocat ».
export const iaAvocat: ProductPageData = {
  path: PAGES.ia,
  meta: {
    title: "IA et GEO pour avocat : être cité par ChatGPT",
    description:
      "Vos futurs clients interrogent ChatGPT, Gemini ou Perplexity. Nous faisons en sorte que votre cabinet d’avocat soit cité dans leurs réponses.",
  },
  hero: {
    eyebrow: "IA · GEO POUR AVOCATS",
    title: "Recommandé quand vos clients interrogent une IA.",
    subtitle: "De plus en plus de clients posent leur question à ChatGPT, Gemini ou Perplexity. On fait en sorte que votre cabinet fasse partie des réponses.",
    ctas: [CTA_DEMO],
    note: "Conforme aux règles de la profession · Sans engagement · Suivi mensuel",
  },
  stats: [
    { value: "3 IA", label: "suivies chaque mois : ChatGPT, Gemini et Perplexity" },
    { value: "1 audit", label: "de votre présence actuelle dans les réponses des IA pour démarrer" },
    { value: "Chaque mois", label: "vous voyez où et comment votre cabinet est cité" },
  ],
  cartes: {
    eyebrow: "COMMENT ÇA MARCHE",
    title: "Être cité, ça se travaille.",
    items: [
      { badge: "1", eyebrow: "ÉTAPE 1", title: "On mesure votre présence.", text: "Que répondent les IA quand on cherche un avocat sur vos domaines dans votre ville ?" },
      { badge: "2", eyebrow: "ÉTAPE 2", title: "On structure vos contenus.", text: "Pages, articles et fiches rédigés pour être compris et repris par les IA." },
      { badge: "3", eyebrow: "ÉTAPE 3", title: "On suit vos citations.", text: "Chaque mois, vous voyez où et comment votre cabinet apparaît." },
    ],
  },
  features: {
    title: "Votre cabinet dans les réponses des IA.",
    items: [
      {
        eyebrow: "CONTENUS",
        title: "Des contenus que les IA comprennent.",
        text: "Pages et articles structurés en questions-réponses, avec des informations claires sur vos domaines.",
        points: ["Format questions-réponses", "Données structurées sur le site", "Sources fiables et à jour"],
        visual: <ApercuReponseIA />,
      },
      {
        eyebrow: "DONNÉES",
        title: "Les mêmes informations partout.",
        text: "Site, fiche Google, annuaires : les IA s’appuient sur des données cohérentes sur votre cabinet.",
        points: ["Fiche Google à jour", "Annuaires harmonisés", "Avis clients visibles"],
        href: PAGES.seo,
        linkLabel: "Voir le référencement",
        visual: <ApercuFicheGoogle />,
      },
      {
        eyebrow: "SUIVI",
        title: "Vous savez quand une IA vous cite.",
        text: "Un suivi régulier des réponses des principales IA sur vos domaines et votre ville.",
        points: ["ChatGPT, Gemini, Perplexity", "Évolution mois par mois", "Recommandations d’actions"],
        visual: (
          <ApercuRapport
            titre="Citations IA · Octobre"
            tendance="+5 citations vs sept."
            kpis={[
              ["Questions testées", "40"],
              ["Citations", "17"],
              ["IA suivies", "3"],
            ]}
          />
        ),
      },
    ],
  },
  pricing: {
    badge: "IA · GEO",
    titre: "Votre présence dans les IA, prise en main.",
    accroche: "Recommandé quand vos clients interrogent une IA.",
    texte: "Le tarif dépend de votre ville et de vos domaines : on vous le présente pendant la démo.",
    inclus: [
      "Audit de votre présence actuelle dans les réponses des IA",
      "Pages et articles structurés en questions-réponses",
      "Données structurées sur votre site",
      "Informations harmonisées : site, fiche Google, annuaires",
      "Suivi mensuel des citations dans ChatGPT, Gemini et Perplexity",
      "Recommandations d’actions chaque mois",
    ],
  },
  faq: [
    {
      q: "Qu’est-ce que le GEO ?",
      a: "Le Generative Engine Optimization : optimiser votre présence dans les réponses des IA, comme le SEO le fait pour Google.",
    },
    {
      q: "Est-ce que ça remplace le référencement Google ?",
      a: "Non, ça le complète. Les IA s’appuient en partie sur les mêmes sources que Google : votre site, votre fiche Google, les annuaires et les avis. Un bon référencement reste la base.",
    },
    FAQ_DEONTOLOGIE,
    FAQ_ENGAGEMENT,
  ],
  guide: {
    link: { href: "/blog/etre-visible-avocat-2026", label: "Lire le guide complet" },
    title: "Être cité par ChatGPT et les IA : le guide pour les avocats",
    intro:
      "« Quel avocat consulter pour un licenciement à Bordeaux ? » : cette question, de plus en plus de personnes la posent directement à une IA plutôt qu’à Google. L’IA ne renvoie pas dix liens, elle cite quelques cabinets. Le GEO consiste à faire partie de ces recommandations.",
    sections: [
      {
        title: "Comment une IA choisit les cabinets qu’elle cite",
        paragraphs: [
          "Les assistants comme ChatGPT, Gemini ou Perplexity s’appuient sur les informations disponibles en ligne : sites de cabinets, fiches Google, annuaires, avis, articles. Un cabinet dont les informations sont claires, cohérentes d’une source à l’autre et bien documentées a plus de chances d’être repris dans une réponse.",
        ],
      },
      {
        title: "Des contenus faciles à reprendre",
        paragraphs: [
          "Les IA reprennent volontiers des réponses précises à des questions précises. Des pages organisées en questions-réponses, qui présentent clairement vos domaines d’intervention, votre ville et la façon de vous consulter, sont plus faciles à comprendre et à citer qu’un texte de présentation général.",
        ],
      },
      {
        title: "La cohérence des informations",
        paragraphs: [
          "Adresse, domaines, horaires, nom du cabinet : si ces informations diffèrent entre votre site, votre fiche Google et les annuaires, l’IA hésite. Harmoniser ces données est souvent l’action la plus simple et la plus rentable.",
        ],
      },
      {
        title: "Suivre sa présence dans le temps",
        paragraphs: [
          "Les réponses des IA évoluent. Tester régulièrement les questions que posent vos clients, sur vos domaines et votre ville, permet de savoir si votre cabinet est cité, à côté de qui, et d’ajuster les contenus en conséquence.",
        ],
      },
    ],
  },
  cta: {
    title: "Soyez dans la réponse, pas seulement dans les résultats.",
    subtitle: "On regarde ensemble ce que les IA répondent aujourd’hui sur vos domaines.",
    ctas: [CTA_DEMO, CTA_SITE],
  },
};
