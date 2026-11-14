import type { ProfessionId } from "@/lib/landing-config";

/** Données d'exemple affichées dans les aperçus d'interface, par profession. */
export const EXEMPLES: Record<
  ProfessionId,
  {
    cabinet: string;
    initiales: string;
    url: string;
    titreSite: string;
    accrocheSite: string;
    cartesSite: [string, string, string];
    ville: string;
    demande: { titre: string; motif: string };
    agendaCreneau: string;
    article: string;
    recherche: string;
    annonce: { titre: string; texte: string };
    annonce2: { recherche: string; titre: string; texte: string };
    ia: { question: string; texte: string };
    telephone: { cabinet: string; sous: string };
    maps: { recherche: string; autres: [string, string] };
    qualification: { tag: string; items: [string, string, string] };
  }
> = {
  avocat: {
    cabinet: "Cabinet Martin",
    initiales: "CM",
    url: "cabinet-martin.fr",
    titreSite: "AVOCAT EN DROIT DE LA FAMILLE · LYON",
    accrocheSite: "Un accompagnement clair, à chaque étape.",
    cartesSite: ["Divorce", "Garde d’enfants", "Pension"],
    ville: "Lyon",
    demande: { titre: "Nouvelle demande · Divorce", motif: "Divorce par consentement mutuel" },
    agendaCreneau: "Audience",
    article: "Divorce : les 5 étapes à connaître en 2026",
    recherche: "avocat divorce paris 11",
    annonce: {
      titre: "Avocat en divorce à Paris 11 — Rendez-vous sous 48 h",
      texte: "Première consultation en cabinet ou en visio. Réservez en ligne 24h/24, réponse garantie.",
    },
    annonce2: {
      recherche: "avocat droit du travail lyon",
      titre: "Avocat en droit du travail à Lyon — Premier rendez-vous en ligne",
      texte: "Licenciement, rupture conventionnelle, prud’hommes. Consultation au cabinet ou en visio.",
    },
    ia: { question: "Quel avocat en droit de la famille à Lyon ?", texte: "qui intervient en divorce et garde d’enfants" },
    telephone: { cabinet: "Cabinet Lefèvre & Associés", sous: "Avocats · Paris 4e" },
    maps: { recherche: "avocat divorce paris 4e", autres: ["Cabinet Saint-Paul Avocats", "Avocats du Marais"] },
    qualification: {
      tag: "Première consultation · Droit de la famille",
      items: ["Divorce par consentement mutuel", "2 enfants · garde à organiser", "Pièces reçues · 3/3"],
    },
  },
  comptable: {
    cabinet: "Cabinet Lefèvre Conseil",
    initiales: "LC",
    url: "lefevre-conseil.fr",
    titreSite: "EXPERT-COMPTABLE · CRÉATION ET TPE · LYON",
    accrocheSite: "Votre comptabilité entre de bonnes mains.",
    cartesSite: ["Création", "Comptabilité", "Fiscalité"],
    ville: "Lyon",
    demande: { titre: "Nouvelle demande · Création de société", motif: "Création d’une SAS" },
    agendaCreneau: "Bilan",
    article: "Créer sa SAS en 2026 : les 5 étapes clés",
    recherche: "expert-comptable création sas lyon",
    annonce: {
      titre: "Expert-comptable à Lyon — Création de SAS et TPE",
      texte: "Premier rendez-vous au cabinet ou en visio. Réservez en ligne 24h/24, réponse sous 24 h.",
    },
    annonce2: {
      recherche: "expert-comptable lmnp bordeaux",
      titre: "Expert-comptable LMNP à Bordeaux — Premier rendez-vous en ligne",
      texte: "Déclarations LMNP, SCI, revenus fonciers. Rendez-vous au cabinet ou en visio.",
    },
    ia: { question: "Quel expert-comptable pour ma SAS à Lyon ?", texte: "qui accompagne les créations d’entreprise et les TPE" },
    telephone: { cabinet: "Cabinet Lefèvre Conseil", sous: "Expert-comptable · Lyon 6e" },
    maps: { recherche: "expert-comptable lyon 6", autres: ["Cabinet Saint-Paul Expertise", "Audit & Conseil Lyon"] },
    qualification: {
      tag: "Premier rendez-vous · Création d’entreprise",
      items: ["Création d’une SAS à 2 associés", "Démarrage prévu en janvier", "Prévisionnel reçu · 2/2"],
    },
  },
};
