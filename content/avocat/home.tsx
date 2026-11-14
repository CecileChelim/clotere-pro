import type { HomeData } from "@/components/landing/HomeTemplate";
import { VisualPriseRdv, VisualSite, VisualVisibilite } from "@/components/landing/FeatureVisuals";
import { CTA_DEMO, CTA_SITE, PAGES } from "@/lib/landing-avocat";
import { FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT } from "./shared";

// Accueil avocat.clotere.fr — maquette Figma « Avocat · Accueil (avocat.clotere.fr) ».
export const homeAvocat: HomeData = {
  profession: "avocat",
  hero: {
    eyebrow: "CROISSANCE DES CABINETS D’AVOCATS",
    title: "Accélérez la croissance de votre cabinet",
    subtitle: "Site internet, prise de rendez-vous, avis Google, référencement et IA : tout ce qu’il faut pour qu’un client choisisse votre cabinet plutôt qu’un autre.",
    ctas: [CTA_DEMO],
  },
  cartes: [
    {
      badge: "01",
      eyebrow: "SITE INTERNET",
      title: "Votre site en ligne en 10 minutes.",
      text: "Vous le créez seul, la prise de rendez-vous est incluse.",
      cta: { href: PAGES.site, label: "Créer mon site →" },
    },
    {
      badge: "02",
      eyebrow: "PRISE DE RENDEZ-VOUS",
      title: "Des rendez-vous qualifiés, 24h/24.",
      text: "Les demandes arrivent triées, directement dans votre agenda.",
      cta: { href: PAGES.rdv, label: "Découvrir la prise de rdv →" },
    },
    {
      badge: "03",
      eyebrow: "RÉFÉRENCEMENT",
      title: "Soyez l’avocat qu’on trouve sur Google et dans les IA.",
      text: "Articles, fiche Google et référencement local sur vos domaines.",
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
    title: "Devenez l’avocat qu’on trouve en premier.",
    items: [
      {
        eyebrow: "SITE INTERNET",
        title: "On crée un site à votre image.",
        text: "Un site moderne pour votre cabinet, à vos couleurs, avec vos domaines d’intervention et la prise de rendez-vous intégrée. En ligne en 10 minutes, modifiable à tout moment, sans prestataire.",
        href: PAGES.site,
        linkLabel: "Découvrir la création de site",
        visual: <VisualSite />,
      },
      {
        eyebrow: "PRISE DE RENDEZ-VOUS",
        title: "On transforme vos visiteurs en rendez-vous.",
        text: "Sur votre site, votre fiche Google ou votre signature mail, vos visiteurs réservent un créneau en un clic, même le dimanche soir. Chaque demande arrive qualifiée dans votre agenda.",
        href: PAGES.rdv,
        linkLabel: "Découvrir la prise de rendez-vous",
        visual: <VisualPriseRdv />,
      },
      {
        eyebrow: "RÉFÉRENCEMENT",
        title: "Vos futurs clients vous trouvent en premier.",
        text: "Articles sur vos domaines, fiche Google optimisée, Google Ads et visibilité dans les IA : quand un client cherche un avocat dans votre ville, c’est votre cabinet qui apparaît.",
        href: PAGES.seo,
        linkLabel: "Découvrir le référencement",
        visual: <VisualVisibilite />,
      },
    ],
  },
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
  cta: {
    title: "Prêt à remplir votre agenda ? Lancez-vous aujourd’hui.",
    subtitle: "En ligne en 10 minutes, sans engagement.",
    ctas: [CTA_SITE, CTA_DEMO],
  },
};
