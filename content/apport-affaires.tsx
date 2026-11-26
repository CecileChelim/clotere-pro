import type { ProductPageData } from "@/components/landing/ProductTemplate";
import { ApercuDemandeQualifiee, ApercuPageClotere, ApercuRdvApportes } from "@/components/landing/apercus";
import { CONFIGS, CTA_DEMO, type Cta, type ProfessionId } from "@/lib/landing-config";
import * as avocat from "./avocat/shared";
import * as comptable from "./comptable/shared";

/* Page produit « Apport d'affaires » (avocats et experts-comptables).
   Règle : aucun montant affiché publiquement. Le prix par rendez-vous est présenté
   dans l'espace pro, au moment de l'activation (voir /dashboard/leads et les CGV). */

/** Pages de démonstration sur clotere.fr (comptes de démo, voir supabase/seed_demo_fiches.sql). */
export const PAGE_DEMO: Record<ProfessionId, Cta> = {
  avocat: { href: "https://clotere.fr/avocat/audrey-tellier", label: "Voir un exemple de page", style: "secondary" },
  comptable: { href: "https://clotere.fr/comptable/martin-pain", label: "Voir un exemple de page", style: "secondary" },
};

export function pageApport(profession: ProfessionId): ProductPageData {
  const conf = CONFIGS[profession];
  const av = profession === "avocat";
  const metier = av ? "avocat" : "expert-comptable";
  const clients = av ? "justiciables" : "dirigeants et particuliers";
  const domaines = av ? "domaines" : "missions";
  const shared = av ? avocat : comptable;
  const ctas: Cta[] = [conf.ctaPage, PAGE_DEMO[profession]];

  return {
    profession,
    path: conf.pages.apport,
    meta: {
      title: `Apport d’affaires ${av ? "avocat" : "expert-comptable"} : développez votre clientèle à la performance`,
      description: `Développez votre ${av ? "clientèle" : "portefeuille clients"} avec Clotere : profil mis en avant, rendez-vous qualifiés, et un modèle 100 % à la performance, sans abonnement ni frais fixes.`,
    },
    hero: {
      eyebrow: `APPORT D’AFFAIRES POUR ${av ? "AVOCATS" : "EXPERTS-COMPTABLES"}`,
      title: av ? "Développez votre clientèle, à la performance." : "Développez votre portefeuille clients, à la performance.",
      subtitle: `Vous créez votre profil, nous le mettons en avant auprès des ${clients} de votre ville. Vous recevez des rendez-vous qualifiés, et notre rémunération dépend uniquement des rendez-vous que nous vous apportons.`,
      ctas,
      note: "Sans abonnement · Sans frais fixes · Sans engagement",
    },
    stats: [
      { value: "+40 000", label: "visiteurs chaque mois sur clotere.fr" },
      { value: "100 %", label: "à la performance : aucun abonnement, aucun frais fixe" },
      { value: "48 h", label: "pour contester un rendez-vous après le créneau" },
    ],
    cartes: {
      eyebrow: "Comment ça marche",
      title: "Vous recevez des clients. Nous sommes payés au résultat.",
      items: [
        {
          badge: "01",
          eyebrow: "VOTRE PROFIL",
          title: "Créez votre profil en 5 minutes.",
          text: `Photo, présentation, ${domaines}, motifs de rendez-vous et disponibilités : votre profil est publié sur clotere.fr.`,
        },
        {
          badge: "02",
          eyebrow: "VOTRE VISIBILITÉ",
          title: "Nous vous apportons des rendez-vous qualifiés.",
          text: `Les ${clients} qui vous trouvent réservent directement, avec leur motif et les réponses à votre questionnaire. Les demandes hors de vos ${domaines} sont écartées.`,
        },
        {
          badge: "03",
          eyebrow: "LA PERFORMANCE",
          title: "Nous sommes rémunérés au rendez-vous.",
          text: "Un montant fixe par rendez-vous reçu, présenté dans votre espace avant activation. Vous fixez votre budget mensuel, et contestez en un clic.",
        },
      ],
    },
    features: {
      title: `Une page qui travaille pour votre cabinet.`,
      items: [
        {
          eyebrow: "VISIBILITÉ",
          title: "Présent là où l’on vous cherche.",
          text: `Votre page est référencée sur clotere.fr, la plateforme qui reçoit déjà des dizaines de milliers de visiteurs chaque mois sur les questions de droit, de famille et de patrimoine.`,
          points: ["Page à votre nom dans l’annuaire de votre ville", `Vos ${domaines} et vos honoraires affichés`, "Votre photo et votre présentation"],
          visual: <ApercuPageClotere p={profession} />,
        },
        {
          eyebrow: "QUALIFICATION",
          title: "Uniquement des demandes utiles.",
          text: "Le client choisit son motif, son format (cabinet, visio, téléphone) et répond à votre questionnaire avant de réserver.",
          points: [`Questions par ${av ? "domaine d’intervention" : "type de mission"}`, "Demandes hors sujet filtrées", "Fiche client prête avant le rendez-vous"],
          visual: <ApercuDemandeQualifiee p={profession} />,
        },
        {
          eyebrow: "MAÎTRISE",
          title: "Vous gardez la main sur votre budget.",
          text: "Budget mensuel plafonné, pause en un clic, contestation jusqu’à 48 h après le rendez-vous : chaque euro investi correspond à un rendez-vous utile.",
          points: ["Client absent ou doublon : non facturé", "Annulation par le client : jamais facturée", "Une seule facture par mois"],
          visual: <ApercuRdvApportes p={profession} />,
        },
      ],
    },
    pricing: {
      badge: "APPORT D’AFFAIRES",
      titre: "Un modèle 100 % à la performance.",
      accroche: "Notre rémunération dépend des rendez-vous que nous vous apportons.",
      texte: "Aucun abonnement, aucun frais fixe. Le montant par rendez-vous vous est présenté dans votre espace avant activation, et vous maîtrisez votre budget mois par mois.",
      sousTitre: "Sans abonnement, sans frais fixes, sans engagement.",
      cta: conf.ctaPage,
      inclus: [
        "Profil à votre nom, mis en avant sur clotere.fr",
        "Prise de rendez-vous qualifiée depuis votre page",
        "Rémunération au rendez-vous, sans lien avec vos honoraires",
        "Contestation jusqu’à 48 h après le rendez-vous",
        "Budget mensuel plafonné, pause à tout moment",
        "Cumulable avec un site, l’outil de rendez-vous ou le référencement",
      ],
    },
    faq: [
      shared.FAQ_PAIEMENT_RDV,
      {
        q: "Qu’est-ce qu’un rendez-vous facturé ?",
        a: "Une demande de rendez-vous prise depuis votre page Clotere. Elle n’est pas facturée si le client annule, si vous la contestez dans les 48 h suivant le créneau (client absent, hors de vos " + domaines + ", doublon, fausse demande), ou si le même client vous a déjà sollicité dans les 30 jours.",
      },
      {
        q: "Et les demandes venues de mon propre site ?",
        a: "Elles ne sont jamais facturées à l’unité : seules les demandes prises depuis votre page sur clotere.fr le sont.",
      },
      shared.FAQ_DEONTOLOGIE,
      shared.FAQ_ENGAGEMENT,
    ],
    guide: {
      link: { href: av ? "/blog/rendez-vous-qualifies-avocat" : "/blog/rendez-vous-qualifies-expert-comptable", label: "Lire le guide complet" },
      title: `Trouver des clients quand on est ${metier} : le guide`,
      intro: `La plupart des clients cherchent leur ${metier} en ligne, souvent le soir ou le week-end, et choisissent celui qui leur permet de réserver tout de suite. Être présent sur les plateformes où ils comparent, avec une prise de rendez-vous immédiate, c’est capter ces demandes au moment où elles naissent.`,
      sections: [
        {
          title: "Un modèle à la performance plutôt qu’un abonnement",
          paragraphs: [
            "Un abonnement de visibilité se paie même quand rien n’arrive. Avec un modèle à la performance, la plateforme n’est rémunérée que lorsqu’elle vous apporte un rendez-vous : votre coût suit exactement l’activité générée, et un budget plafonné vous protège des mauvaises surprises.",
          ],
        },
        {
          title: "Qualifier avant de recevoir",
          paragraphs: [
            `Motif, situation, pièces disponibles : collectées à la réservation, ces informations vous évitent les rendez-vous inutiles et vous permettent de préparer l’échange. Les demandes hors de vos ${domaines} sont filtrées avant d’occuper un créneau.`,
          ],
        },
        {
          title: "Rester dans les règles de la profession",
          paragraphs: [
            av
              ? "Le montant versé à la plateforme est forfaitaire et ne dépend jamais de vos honoraires, et vos honoraires vous sont réglés directement par le client, après convention d’honoraires."
              : "Clotere vous facture une prestation réelle (visibilité, qualification des demandes, outil de rendez-vous) à prix fixe, sans aucun lien avec vos honoraires ni vos missions.",
          ],
        },
      ],
    },
    cta: {
      title: av ? "Développez votre clientèle dès ce mois-ci." : "Développez votre portefeuille clients dès ce mois-ci.",
      subtitle: "Votre profil en ligne en 5 minutes. Sans abonnement, sans engagement.",
      ctas: [conf.ctaPage, CTA_DEMO],
    },
  };
}
