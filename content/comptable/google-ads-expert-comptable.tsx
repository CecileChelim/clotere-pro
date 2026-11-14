import type { ProductPageData } from "@/components/landing/ProductTemplate";
import { ApercuAnnonceGoogle, ApercuRapport } from "@/components/landing/apercus";
import { CTA_DEMO, CTA_SITE } from "@/lib/landing-config";
import { PAGES } from "@/lib/landing-comptable";
import { FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT } from "./shared";

// Contenu repris de la maquette Figma « Expert-comptable · Google Ads expert-comptable (SEA) ».
export const googleAdsExpertComptable: ProductPageData = {
  profession: "comptable",
  path: PAGES.ads,
  meta: {
    title: "Google Ads pour expert-comptable",
    description:
      "Campagnes Google Ads ciblées sur votre ville et vos missions, annonces conformes à la déontologie et suivi jusqu’au rendez-vous. Sans engagement.",
  },
  hero: {
    eyebrow: "GOOGLE ADS POUR EXPERTS-COMPTABLES",
    title: "Des demandes de clients dès les premières semaines.",
    subtitle: "Des campagnes Google Ads ciblées sur votre ville et vos missions, qui renvoient vers votre prise de rendez-vous.",
    ctas: [CTA_DEMO],
    note: "Annonces conformes à la déontologie · Sans engagement · Suivi jusqu’au rendez-vous",
  },
  stats: [
    { value: "Quelques jours", label: "pour mettre vos campagnes en ligne" },
    { value: "100 %", label: "des annonces relues et validées par vous avant diffusion" },
    { value: "Chaque euro", label: "suivi jusqu’au rendez-vous généré" },
  ],
  cartes: {
    eyebrow: "COMMENT ÇA MARCHE",
    title: "Des campagnes en ligne en quelques jours.",
    items: [
      { badge: "1", eyebrow: "ÉTAPE 1", title: "On cible vos missions.", text: "Missions, zone géographique, budget : on part de ce qui vous rapporte." },
      { badge: "2", eyebrow: "ÉTAPE 2", title: "On lance les campagnes.", text: "Annonces rédigées, relues avec vous, et pages d’arrivée prêtes." },
      { badge: "3", eyebrow: "ÉTAPE 3", title: "Vous recevez des rendez-vous.", text: "Les demandes arrivent qualifiées dans votre agenda, le suivi est mensuel." },
    ],
  },
  features: {
    title: "Des campagnes pensées pour les cabinets.",
    items: [
      {
        eyebrow: "CIBLAGE",
        title: "Seulement les recherches qui comptent.",
        text: "On exclut les recherches d’information et on vise les dirigeants qui cherchent un expert-comptable maintenant.",
        points: ["Ciblage par ville et par mission", "Mots-clés négatifs gérés", "Horaires de diffusion adaptés"],
        visual: <ApercuAnnonceGoogle p="comptable" />,
      },
      {
        eyebrow: "CONFORMITÉ",
        title: "Des annonces conformes à la déontologie.",
        text: "Pas de promesse de résultat, pas de comparaison : des annonces factuelles, relues avec vous.",
        points: ["Mentions conformes", "Validation avant diffusion", "Pages d’arrivée sobres"],
        visual: <ApercuAnnonceGoogle p="comptable" variante={2} statut="Validée le 12 nov. par le cabinet" detail="Relue avant diffusion · aucune promesse de résultat" />,
      },
      {
        eyebrow: "SUIVI",
        title: "Chaque euro suivi jusqu’au rendez-vous.",
        text: "Le module de prise de rendez-vous mesure les demandes générées par chaque campagne.",
        points: ["Coût par demande", "Rendez-vous générés", "Ajustements chaque mois"],
        href: PAGES.rdv,
        linkLabel: "Découvrir la prise de rdv",
        visual: <ApercuRapport titre="Google Ads · Octobre" />,
      },
    ],
  },
  pricing: {
    badge: "GOOGLE ADS",
    titre: "Vos campagnes Google Ads, prises en main.",
    accroche: "Des demandes de clients dès les premières semaines.",
    texte: "Les frais de gestion et le budget publicitaire dépendent de votre ville et de vos missions : on vous les présente pendant la démo.",
    inclus: [
      "Ciblage par ville et par mission",
      "Annonces rédigées, relues et validées par vous avant diffusion",
      "Mots-clés négatifs et horaires de diffusion gérés",
      "Pages d’arrivée reliées à votre prise de rendez-vous",
      "Suivi du coût par demande et des rendez-vous générés",
      "Ajustements et reporting chaque mois",
    ],
  },
  faq: [
    { q: "Quel budget prévoir ?", a: "Il dépend de votre ville et de vos missions. Nous vous donnons une estimation pendant la démo, avant de démarrer." },
    {
      q: "Le budget publicitaire est-il inclus ?",
      // TODO réponse à valider
      a: "Non. Le budget publicitaire est réglé directement à Google, sur votre compte : vous gardez la main sur ce que vous dépensez.",
    },
    FAQ_DEONTOLOGIE,
    FAQ_ENGAGEMENT,
  ],
  guide: {
    link: { href: "/blog/visibilite-referencement-expert-comptable-guide-2026", label: "Lire le guide complet" },
    title: "Google Ads pour un cabinet d’expertise comptable : le guide",
    intro:
      "Le référencement naturel prend du temps. Google Ads permet d’apparaître dès les premiers jours sur les recherches des dirigeants, à condition de cibler finement et de rester dans le cadre des règles de la profession.",
    sections: [
      {
        title: "Quand Google Ads est-il utile ?",
        paragraphs: [
          "Au lancement ou à la reprise d’un cabinet, sur une nouvelle mission (LMNP, création d’entreprise, paie) ou sur des recherches très concurrentielles. Les campagnes permettent aussi de tester rapidement quelles missions génèrent des demandes.",
        ],
      },
      {
        title: "Cibler l’intention, pas le volume",
        paragraphs: [
          "« Bilan comptable définition » attire des curieux, « expert-comptable création SAS Lyon » attire des clients. Un ciblage par ville et par mission, une liste de mots-clés exclus et des horaires de diffusion adaptés évitent de payer des clics inutiles.",
        ],
      },
      {
        title: "Des annonces sobres et factuelles",
        paragraphs: [
          "Une annonce efficace décrit simplement votre mission, votre ville et la possibilité de prendre rendez-vous en ligne, sans promesse de résultat ni comparaison avec d’autres cabinets. Chaque annonce doit être relue et validée par le cabinet avant diffusion.",
        ],
      },
      {
        title: "Mesurer jusqu’au rendez-vous",
        paragraphs: [
          "Ce qui compte, c’est le nombre de demandes de rendez-vous et leur coût. En reliant les campagnes à la prise de rendez-vous en ligne, on sait ce que chaque mission rapporte et on ajuste le budget chaque mois.",
        ],
      },
    ],
  },
  cta: {
    title: "Des clients qui vous trouvent dès cette semaine.",
    subtitle: "Estimation de budget pour votre ville pendant la démo.",
    ctas: [CTA_DEMO, CTA_SITE],
  },
};
