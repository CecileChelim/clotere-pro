import type { ProductPageData } from "@/components/landing/ProductTemplate";
import { ApercuEditeurSite, ApercuFicheGoogle, ApercuReservation } from "@/components/landing/apercus";
import { CTA_DEMO, CTA_SITE } from "@/lib/landing-config";
import { PAGES } from "@/lib/landing-comptable";
import { FAQ_DEONTOLOGIE, FAQ_DOMAINE, FAQ_ENGAGEMENT, FAQ_SITE_SEUL } from "./shared";

// Contenu repris de la maquette Figma « Expert-comptable · Site internet expert-comptable ».
// Page de conversion : CTA « Créer mon site ».
export const creationSiteInternetExpertComptable: ProductPageData = {
  profession: "comptable",
  path: PAGES.site,
  meta: {
    title: "Création de site internet pour expert-comptable",
    description:
      "Créez vous-même le site de votre cabinet d’expertise comptable en 10 minutes : prise de rendez-vous, avis Google et référencement intégrés.",
  },
  hero: {
    eyebrow: "SITE INTERNET POUR EXPERTS-COMPTABLES",
    title: "Votre site d’expert-comptable en ligne en 10 minutes.",
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
        points: ["Modèles pensés pour les cabinets", "Pages missions, cabinet, honoraires, contact", "Adapté au mobile"],
        visual: <ApercuEditeurSite p="comptable" />,
      },
      {
        eyebrow: "PRISE DE RENDEZ-VOUS",
        title: "Vos visiteurs deviennent des rendez-vous.",
        text: "Le module de prise de rendez-vous qualifié est intégré sur chaque page de votre site.",
        points: ["Motifs et questions de qualification", "Créneaux synchronisés avec votre agenda", "Confirmation et rappels automatiques"],
        href: PAGES.rdv,
        linkLabel: "Découvrir l’outil",
        visual: <ApercuReservation p="comptable" />,
      },
      {
        eyebrow: "AVIS & RÉFÉRENCEMENT",
        title: "Trouvé sur Google, choisi grâce à vos avis.",
        text: "Votre site est optimisé pour le référencement local et affiche vos avis Google, récoltés automatiquement.",
        points: ["Référencement local de base", "Blog pour publier vos articles", "Récolte automatique des avis Google"],
        href: PAGES.seo,
        linkLabel: "Découvrir le référencement",
        visual: <ApercuFicheGoogle p="comptable" />,
      },
    ],
  },
  pricing: "offres",
  faq: [FAQ_SITE_SEUL, FAQ_DOMAINE, FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT],
  guide: {
    link: { href: "/blog/site-internet-expert-comptable-guide-2026", label: "Lire le guide complet" },
    title: "Créer le site internet de son cabinet d’expertise comptable : l’essentiel",
    intro:
      "Avant de contacter un expert-comptable, un dirigeant compare quelques cabinets en ligne : leurs missions, leur façon de travailler, leurs avis. Un site clair, à jour et qui permet de réserver un premier rendez-vous fait souvent la différence entre un cabinet consulté et un cabinet choisi.",
    sections: [
      {
        title: "Ce qu’un dirigeant cherche sur le site d’un expert-comptable",
        paragraphs: [
          "Un créateur d’entreprise ou un dirigeant de TPE veut savoir en quelques secondes si vous accompagnez des structures comme la sienne : création, tenue comptable, bilan, social, fiscalité, conseil. Une page par mission, rédigée avec des mots simples, répond mieux qu’une liste de prestations.",
          "La page honoraires et la manière dont vous travaillez (outils, échanges, délais) comptent parmi les plus consultées. Expliquer votre fonctionnement rassure et évite des échanges inutiles.",
        ],
      },
      {
        title: "Transformer les visites en rendez-vous",
        paragraphs: [
          "Un formulaire de contact oblige le dirigeant à attendre votre retour. Un bouton de prise de rendez-vous lui permet de réserver un créneau tout de suite, en précisant son besoin. Vous recevez une demande déjà qualifiée et vous gardez la main pour la valider.",
        ],
      },
      {
        title: "Être trouvé sur Google dans sa ville",
        paragraphs: [
          "Le référencement d’un cabinet repose d’abord sur des pages claires par mission et par ville, une fiche Google complète et des avis clients réguliers. Un blog permet ensuite de répondre aux questions précises des dirigeants et d’apparaître sur ces recherches.",
        ],
      },
      {
        title: "Rester dans le cadre des règles de la profession",
        paragraphs: [
          "La communication d’un cabinet d’expertise comptable obéit aux règles déontologiques de la profession : information loyale et sincère, respect du secret professionnel, pas de comparaison dénigrante. En cas de doute sur un contenu, le plus simple est de se rapprocher de votre Ordre régional.",
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
