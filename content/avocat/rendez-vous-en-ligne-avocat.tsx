import type { ProductPageData } from "@/components/landing/ProductTemplate";
import { ApercuAgendaSemaine, ApercuDemandeQualifiee, ApercuFicheGoogle } from "@/components/landing/apercus";
import ReponsesSection from "@/components/landing/ReponsesSection";
import { CTA_DEMO, PAGES, SIGNUP } from "@/lib/landing-avocat";
import { FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT } from "./shared";

const CTA_ESSAI = { href: SIGNUP, label: "Essayer l’outil" };

// Contenu repris de la maquette Figma « /produit/rendez-vous-en-ligne-avocat ».
export const rendezVousEnLigneAvocat: ProductPageData = {
  path: PAGES.rdv,
  meta: {
    title: "Prise de rendez-vous en ligne pour avocat",
    description:
      "Vos clients réservent 24h/24 depuis votre site, votre fiche Google ou vos mails. Chaque demande arrive qualifiée dans votre agenda. 69 € HT / mois.",
  },
  hero: {
    eyebrow: "PRISE DE RENDEZ-VOUS POUR AVOCATS",
    title: "Des rendez-vous qualifiés, même cabinet fermé.",
    subtitle: "Un bouton sur votre site, votre fiche Google et votre signature mail. Chaque demande arrive avec son motif et les réponses du client.",
    ctas: [CTA_DEMO, { ...CTA_ESSAI, style: "secondary" }],
    note: "69 € HT / mois · Sans engagement · Installé en 5 minutes",
  },
  stats: [
    { value: "85 %", label: "des demandes de rendez-vous arrivent hors horaires d’ouverture" },
    { value: "5 min", label: "pour intégrer le bouton sur votre site" },
    { value: "0", label: "appel à passer pour trier les demandes" },
  ],
  features: {
    title: "La prise de rendez-vous pensée pour le cabinet.",
    items: [
      {
        eyebrow: "QUALIFICATION",
        title: "Vous savez tout avant le rendez-vous.",
        text: "Motif, situation, urgence, documents : le client répond à vos questions avant de réserver.",
        points: ["Questions par domaine d’intervention", "Demandes hors sujet filtrées", "Fiche client prête avant l’échange"],
        visual: <ApercuDemandeQualifiee />,
      },
      {
        eyebrow: "AGENDA",
        title: "Vos créneaux, vos règles.",
        text: "Les rendez-vous se calent sur vos disponibilités réelles, synchronisées avec votre agenda.",
        points: ["Google Agenda et Outlook", "Au cabinet, en visio ou par téléphone", "Rappels automatiques au client"],
        visual: <ApercuAgendaSemaine />,
      },
      {
        eyebrow: "PARTOUT",
        title: "Un seul bouton, partout où l’on vous cherche.",
        text: "Site internet, fiche Google, LinkedIn, signature mail : le même module, les mêmes règles.",
        points: ["Site internet et fiche Google", "LinkedIn et signature mail", "Lien à partager par message"],
        href: PAGES.site,
        linkLabel: "Pas encore de site ? Créez-le",
        visual: <ApercuFicheGoogle />,
      },
    ],
  },
  apresFeatures: <ReponsesSection />,
  pricing: "outil",
  faq: [
    { q: "Est-ce compatible avec mon agenda ?", a: "Oui. Le module se synchronise avec Google Agenda et Outlook : seuls vos créneaux libres sont proposés." },
    {
      q: "Où sont hébergées les données de mes clients ?",
      a: "En Europe, sur une infrastructure sécurisée, et chiffrées. Elles ne sont jamais revendues et les échanges avec vos clients restent confidentiels.",
    },
    FAQ_DEONTOLOGIE,
    FAQ_ENGAGEMENT,
  ],
  guide: {
    link: { href: "/blog/rendez-vous-qualifies-avocat", label: "Lire le guide complet" },
    title: "Prise de rendez-vous en ligne pour avocat : le guide",
    intro:
      "Un client qui a besoin d’un avocat cherche souvent le soir ou le week-end, depuis son téléphone. S’il ne peut pas réserver tout de suite, il remet sa démarche à plus tard ou contacte le cabinet suivant. Proposer la prise de rendez-vous en ligne, c’est capter ces demandes au moment où elles naissent.",
    sections: [
      {
        title: "Pourquoi vos clients veulent réserver en ligne",
        paragraphs: [
          "Choisir un créneau, préciser son besoin et recevoir une confirmation immédiate : pour le client, c’est plus simple qu’un appel pendant les heures de bureau. Pour le cabinet, ce sont moins d’appels à traiter et moins d’allers-retours pour trouver une date.",
        ],
      },
      {
        title: "Qualifier la demande avant le premier rendez-vous",
        paragraphs: [
          "Motif, situation, urgence, pièces déjà réunies : collectées à la réservation, ces informations permettent de préparer l’échange et d’orienter la demande vers le bon interlocuteur. Les demandes qui ne relèvent pas de vos domaines peuvent être écartées avant d’occuper un créneau.",
        ],
      },
      {
        title: "Un même bouton sur tous vos canaux",
        paragraphs: [
          "Votre site, votre fiche Google, votre profil LinkedIn et votre signature mail sont autant de points d’entrée. Un module unique garantit les mêmes règles partout : mêmes motifs, mêmes durées, mêmes disponibilités, et un seul tableau de bord pour suivre les demandes.",
        ],
      },
      {
        title: "Garder la maîtrise de son agenda",
        paragraphs: [
          "Synchronisé avec Google Agenda ou Outlook, l’outil ne propose que vos créneaux réellement libres. Vous définissez les durées, les modes de consultation (cabinet, visio, téléphone) et vous validez chaque demande avant qu’elle ne soit confirmée au client.",
        ],
      },
    ],
  },
  cta: {
    title: "Votre agenda se remplit pendant que vous plaidez.",
    subtitle: "Installé en 5 minutes, sans engagement.",
    ctas: [CTA_DEMO, CTA_ESSAI],
  },
};
