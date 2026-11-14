import type { ProductPageData } from "@/components/landing/ProductTemplate";
import { ApercuEditeurSite, ApercuFicheGoogle, ApercuReservation } from "@/components/landing/apercus";
import { CTA_DEMO, CTA_SITE, PAGES } from "@/lib/landing-avocat";
import { FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT } from "./shared";

// Contenu repris de la maquette Figma « /produit/creation-site-internet-avocat ».
// Page de conversion : CTA « Créer mon site » (et non « Réserver une démo »).
export const creationSiteInternetAvocat: ProductPageData = {
  path: PAGES.site,
  meta: {
    title: "Création de site internet pour avocat",
    description:
      "Créez vous-même le site de votre cabinet d’avocat en 10 minutes : prise de rendez-vous, avis Google et référencement intégrés. Sans engagement.",
  },
  hero: {
    eyebrow: "SITE INTERNET POUR AVOCATS",
    title: "Votre site d’avocat en ligne en 10 minutes.",
    subtitle: "Créez vous-même un site moderne, avec la prise de rendez-vous, les avis Google et le référencement déjà intégrés.",
    ctas: [CTA_SITE, { href: "#tarifs", label: "Voir les tarifs", style: "secondary" }],
    note: "Conforme aux règles de la profession · Sans engagement · Hébergé en France",
  },
  stats: [
    { value: "10 min", label: "pour mettre votre site en ligne avec notre éditeur" },
    { value: "24h/24", label: "vos visiteurs réservent un rendez-vous depuis votre site" },
    { value: "0", label: "prestataire nécessaire pour le modifier" },
  ],
  features: {
    title: "Un site qui travaille pour votre cabinet.",
    items: [
      {
        eyebrow: "ÉDITEUR",
        title: "Modifiez votre site comme un document.",
        text: "Textes, photos, couleurs, pages : tout se change en quelques clics, sans prestataire.",
        points: ["Modèles pensés pour les cabinets", "Pages domaines, cabinet, honoraires, contact", "Adapté au mobile"],
        visual: <ApercuEditeurSite />,
      },
      {
        eyebrow: "PRISE DE RENDEZ-VOUS",
        title: "Vos visiteurs deviennent des rendez-vous.",
        text: "Le module de prise de rendez-vous qualifié est intégré sur chaque page de votre site.",
        points: ["Motifs et questions de qualification", "Créneaux synchronisés avec votre agenda", "Confirmation et rappels automatiques"],
        href: PAGES.rdv,
        linkLabel: "Découvrir l’outil",
        visual: <ApercuReservation />,
      },
      {
        eyebrow: "AVIS & RÉFÉRENCEMENT",
        title: "Trouvé sur Google, choisi grâce à vos avis.",
        text: "Votre site est optimisé pour le référencement local et affiche vos avis Google, récoltés automatiquement.",
        points: ["Référencement local de base", "Blog pour publier vos articles", "Récolte automatique des avis Google"],
        href: PAGES.seo,
        linkLabel: "Découvrir le référencement",
        visual: <ApercuFicheGoogle />,
      },
    ],
  },
  pricing: "offres",
  faq: [
    {
      q: "Est-ce que je peux vraiment créer mon site seul ?",
      a: "Oui. Vous répondez à quelques questions sur votre cabinet, l’éditeur génère un site complet que vous modifiez ensuite comme vous voulez.",
    },
    {
      q: "Puis-je garder mon nom de domaine ?",
      // TODO réponse à valider
      a: "Oui. Vous pouvez connecter le nom de domaine que votre cabinet utilise déjà, ou en choisir un nouveau au moment de la mise en ligne.",
    },
    FAQ_DEONTOLOGIE,
    FAQ_ENGAGEMENT,
  ],
  guide: {
    link: { href: "/blog/site-internet-avocat-guide-2026", label: "Lire le guide complet" },
    title: "Créer le site internet de son cabinet d’avocat : l’essentiel",
    intro:
      "Avant de prendre rendez-vous, la plupart des clients cherchent un avocat en ligne, comparent quelques cabinets et lisent leurs avis. Un site clair, à jour et qui permet de réserver un créneau fait souvent la différence entre un cabinet consulté et un cabinet choisi.",
    sections: [
      {
        title: "Ce qu’un client cherche sur le site d’un avocat",
        paragraphs: [
          "Un futur client veut comprendre en quelques secondes si vous pouvez l’aider : vos domaines d’intervention, la ville où vous exercez, la manière dont se déroule un premier rendez-vous et la façon de vous joindre. Une page par domaine, rédigée avec des mots simples, répond mieux à ces questions qu’une longue présentation générale.",
          "La page honoraires et la page contact comptent parmi les plus consultées. Expliquer votre mode de facturation, sans forcément afficher de tarif, rassure et évite des échanges inutiles.",
        ],
      },
      {
        title: "Transformer les visites en rendez-vous",
        paragraphs: [
          "Un formulaire de contact oblige le client à attendre votre retour. Un bouton de prise de rendez-vous lui permet de choisir un créneau tout de suite, y compris le soir ou le week-end, en précisant son motif. Vous recevez une demande déjà qualifiée et vous gardez la main pour la valider.",
        ],
      },
      {
        title: "Être trouvé sur Google dans sa ville",
        paragraphs: [
          "Le référencement d’un site d’avocat repose d’abord sur des pages claires pour chaque domaine et chaque ville, une fiche Google complète et des avis clients réguliers. Un blog permet ensuite de répondre aux questions précises que se posent vos clients et d’apparaître sur ces recherches.",
        ],
      },
      {
        title: "Rester dans le cadre des règles de la profession",
        paragraphs: [
          "Le site d’un cabinet est soumis aux règles de communication de la profession : information sincère, mentions obligatoires, prudence sur les comparaisons et les promesses de résultat. En cas de doute sur un contenu, le plus simple est de se référer au règlement intérieur de la profession et aux recommandations de votre Ordre.",
        ],
      },
    ],
  },
  cta: {
    title: "Votre prochain client commence par votre site.",
    subtitle: "En ligne en 10 minutes, sans engagement.",
    ctas: [CTA_SITE, CTA_DEMO],
  },
};
