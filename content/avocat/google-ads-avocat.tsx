import type { ProductPageData } from "@/components/landing/ProductTemplate";
import { ApercuAnnonceGoogle, ApercuRapport } from "@/components/landing/apercus";
import { CTA_DEMO, CTA_SITE, PAGES } from "@/lib/landing-avocat";
import { FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT } from "./shared";

// Contenu repris de la maquette Figma « /solution/google-ads-avocat ».
export const googleAdsAvocat: ProductPageData = {
  path: PAGES.ads,
  meta: {
    title: "Google Ads pour avocat : campagnes conformes",
    description:
      "Campagnes Google Ads ciblées sur votre ville et vos domaines, annonces conformes à la déontologie et suivi jusqu’au rendez-vous. Sans engagement.",
  },
  hero: {
    eyebrow: "GOOGLE ADS POUR AVOCATS",
    title: "Des demandes de clients dès les premières semaines.",
    subtitle: "Des campagnes Google Ads ciblées sur votre ville et vos domaines, qui renvoient vers votre prise de rendez-vous.",
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
      { badge: "1", eyebrow: "ÉTAPE 1", title: "On cible vos domaines.", text: "Domaines d’intervention, zone géographique, budget : on part de ce qui vous rapporte." },
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
        text: "On exclut les recherches d’information et on vise les clients qui cherchent un avocat maintenant.",
        points: ["Ciblage par ville et par domaine", "Mots-clés négatifs gérés", "Horaires de diffusion adaptés"],
        visual: <ApercuAnnonceGoogle />,
      },
      {
        eyebrow: "CONFORMITÉ",
        title: "Des annonces conformes à la déontologie.",
        text: "Pas de promesse de résultat, pas de comparaison : des annonces factuelles, relues avec vous.",
        points: ["Mentions conformes", "Validation avant diffusion", "Pages d’arrivée sobres"],
        visual: (
          <ApercuAnnonceGoogle
            recherche="avocat droit du travail lyon"
            titre="Avocat en droit du travail à Lyon — Premier rendez-vous en ligne"
            texte="Licenciement, rupture conventionnelle, prud’hommes. Consultation au cabinet ou en visio."
            statut="Validée le 12 nov. par Me Martin"
            detail="Relue avant diffusion · aucune promesse de résultat"
          />
        ),
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
    texte: "Les frais de gestion et le budget publicitaire dépendent de votre ville et de vos domaines : on vous les présente pendant la démo.",
    inclus: [
      "Ciblage par ville et par domaine d’intervention",
      "Annonces rédigées, relues et validées par vous avant diffusion",
      "Mots-clés négatifs et horaires de diffusion gérés",
      "Pages d’arrivée reliées à votre prise de rendez-vous",
      "Suivi du coût par demande et des rendez-vous générés",
      "Ajustements et reporting chaque mois",
    ],
  },
  faq: [
    { q: "Quel budget prévoir ?", a: "Il dépend de votre ville et de vos domaines. Nous vous donnons une estimation pendant la démo, avant de démarrer." },
    {
      q: "Le budget publicitaire est-il inclus ?",
      // TODO réponse à valider
      a: "Non. Le budget publicitaire est réglé directement à Google, sur votre compte : vous gardez la main sur ce que vous dépensez.",
    },
    FAQ_DEONTOLOGIE,
    FAQ_ENGAGEMENT,
  ],
  guide: {
    link: { href: "/blog/visibilite-referencement-avocat-guide-2026", label: "Lire le guide complet" },
    title: "Google Ads pour un cabinet d’avocat : le guide",
    intro:
      "Le référencement naturel prend du temps. Google Ads permet d’apparaître dès les premiers jours sur les recherches de vos futurs clients, à condition de cibler finement et de rester dans le cadre des règles de la profession.",
    sections: [
      {
        title: "Quand Google Ads est-il utile ?",
        paragraphs: [
          "Au lancement d’un cabinet, sur un nouveau domaine d’intervention ou sur des recherches très concurrentielles où le référencement naturel demande plusieurs mois. Les campagnes permettent aussi de tester rapidement quels domaines génèrent des demandes avant d’investir dans des contenus.",
        ],
      },
      {
        title: "Cibler l’intention, pas le volume",
        paragraphs: [
          "Toutes les recherches ne se valent pas : « divorce définition » attire des curieux, « avocat divorce Paris 11 » attire des clients. Un ciblage par ville et par domaine, une liste de mots-clés exclus et des horaires de diffusion adaptés évitent de payer des clics inutiles.",
        ],
      },
      {
        title: "Des annonces sobres et factuelles",
        paragraphs: [
          "La publicité d’un avocat doit rester loyale et mesurée : pas de promesse de résultat, pas de comparaison avec d’autres cabinets. Une annonce efficace décrit simplement votre domaine, votre ville et la possibilité de prendre rendez-vous en ligne. Chaque annonce doit pouvoir être relue et validée par le cabinet avant diffusion.",
        ],
      },
      {
        title: "Mesurer jusqu’au rendez-vous",
        paragraphs: [
          "Le nombre de clics ne dit pas grand-chose. Ce qui compte, c’est le nombre de demandes de rendez-vous et leur coût. En reliant les campagnes à la prise de rendez-vous en ligne, on sait exactement ce que chaque domaine rapporte et on ajuste le budget chaque mois.",
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
