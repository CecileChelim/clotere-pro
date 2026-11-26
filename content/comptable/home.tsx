import type { HomeData } from "@/components/landing/HomeTemplate";
import { VisualPriseRdv, VisualSite, VisualVisibilite } from "@/components/landing/FeatureVisuals";
import { CTA_DEMO } from "@/lib/landing-config";
import { COMPTABLE, PAGES } from "@/lib/landing-comptable";
import { FAQ_DEONTOLOGIE, FAQ_DOMAINE, FAQ_ENGAGEMENT, FAQ_PAIEMENT_RDV, FAQ_SITE_SEUL } from "./shared";

// Accueil comptable.clotere.fr — maquette Figma « Expert-comptable · Accueil (comptable.clotere.fr) ».
export const homeComptable: HomeData = {
  profession: "comptable",
  hero: {
    eyebrow: "CROISSANCE DES CABINETS D’EXPERTISE COMPTABLE",
    title: "Votre cabinet, choisi avant même le premier appel.",
    subtitle: "Site internet, prise de rendez-vous, avis Google, référencement et IA : tout ce qu’il faut pour qu’un client choisisse votre cabinet plutôt qu’un autre.",
    ctas: [COMPTABLE.ctaPage, { ...CTA_DEMO, style: "secondary" }],
    note: "Conforme aux règles de communication de la profession · Sans engagement · Hébergé en France",
  },
  cartes: [
    {
      badge: "01",
      eyebrow: "APPORT D’AFFAIRES",
      title: "Développez votre portefeuille, à la performance.",
      text: "Des rendez-vous qualifiés apportés par Clotere, rémunérés au résultat.",
      cta: { href: PAGES.apport, label: "Découvrir l’apport d’affaires →" },
    },
    {
      badge: "02",
      eyebrow: "SITE INTERNET",
      title: "Votre site en ligne en 10 minutes.",
      text: "Vous le créez seul, la prise de rendez-vous est incluse.",
      cta: { href: PAGES.site, label: "Créer mon site →" },
    },
    {
      badge: "03",
      eyebrow: "PRISE DE RENDEZ-VOUS",
      title: "Des rendez-vous qualifiés, 24h/24.",
      text: "Les demandes arrivent triées, directement dans votre agenda.",
      cta: { href: PAGES.rdv, label: "Découvrir la prise de rdv →" },
    },
    {
      badge: "04",
      eyebrow: "RÉFÉRENCEMENT",
      title: "Soyez l’expert-comptable qu’on trouve sur Google et dans les IA.",
      text: "Articles, fiche Google et référencement local sur vos missions.",
      cta: { href: PAGES.seo, label: "Découvrir le référencement →" },
    },
  ],
  stats: [
    { value: "85 %", label: "des demandes de rendez-vous arrivent hors horaires d’ouverture" },
    { value: "10 min", label: "pour mettre votre site en ligne avec notre éditeur" },
    { value: "24h/24", label: "vos clients réservent, même le dimanche soir" },
  ],
  features: {
    eyebrow: "La plateforme",
    title: "Devenez l’expert-comptable qu’on trouve en premier.",
    items: [
      {
        eyebrow: "SITE INTERNET",
        title: "On crée un site à votre image.",
        text: "Un site moderne pour votre cabinet, à vos couleurs, avec vos missions et la prise de rendez-vous intégrée. En ligne en 10 minutes, modifiable à tout moment, sans prestataire.",
        href: PAGES.site,
        linkLabel: "Découvrir la création de site",
        visual: <VisualSite p="comptable" />,
      },
      {
        eyebrow: "PRISE DE RENDEZ-VOUS",
        title: "On transforme vos visiteurs en rendez-vous.",
        text: "Sur votre site, votre fiche Google ou votre signature mail, les dirigeants réservent un créneau en un clic, même le dimanche soir. Chaque demande arrive qualifiée dans votre agenda.",
        href: PAGES.rdv,
        linkLabel: "Découvrir la prise de rendez-vous",
        visual: <VisualPriseRdv p="comptable" />,
      },
      {
        eyebrow: "RÉFÉRENCEMENT",
        title: "Vos futurs clients vous trouvent en premier.",
        text: "Articles sur vos missions, fiche Google optimisée, Google Ads et visibilité dans les IA : quand un dirigeant cherche un expert-comptable dans votre ville, c’est votre cabinet qui apparaît.",
        href: PAGES.seo,
        linkLabel: "Découvrir le référencement",
        visual: <VisualVisibilite p="comptable" />,
      },
    ],
  },
  faq: [FAQ_PAIEMENT_RDV, FAQ_SITE_SEUL, FAQ_DOMAINE, FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT],
  cta: {
    title: "Prêt à remplir votre agenda ? Lancez-vous aujourd’hui.",
    subtitle: "Votre profil en ligne en 5 minutes, sans abonnement ni engagement.",
    ctas: [COMPTABLE.ctaPage, CTA_DEMO],
  },
};
