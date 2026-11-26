// Questions posées au client pendant la prise de rendez-vous, selon le domaine du motif.
// Écrites par Clotere (pas par le pro) : le pro choisit seulement le domaine de chaque motif
// et peut couper le questionnaire. Partagé client / serveur.
//
// Règles : 5 questions au maximum sur l'écran « Votre situation », en comptant le sujet (sous-domaine choisi
// en puces, si le motif en propose plusieurs) et « Avez-vous déjà un avocat ? ». Le message libre n'est pas compté.
// Les questions marquées requis sont obligatoires, les autres facultatives (et souvent conditionnées).

export type Question = {
  id: string;
  label: string;
  type: "choix" | "date";
  options?: string[];
  requis?: boolean;
  aide?: string;
  /** Date à venir (audience, clôture…) plutôt que passée. */
  futur?: boolean;
  /** Affichée seulement si la question `id` a reçu une de ces réponses. */
  si?: { id: string; parmi: string[] };
};

/** Réponse enregistrée sur le rendez-vous : copie figée de la question, pour que l'historique reste juste. */
export type Reponse = { question: string; reponse: string };

/** Règle produit : jamais plus de 5 questions affichées au client, quel que soit le parcours (sujet et « déjà un avocat » compris). */
export const MAX_QUESTIONS = 5;

/** Nombre de questions du domaine qu'on peut encore afficher, une fois le sujet et « déjà un avocat » comptés. */
export const placesQuestions = (o: { sujet: boolean; deja: boolean }) => MAX_QUESTIONS - (o.sujet ? 1 : 0) - (o.deja ? 1 : 0);

/* ---------- Listes réutilisées ---------- */
const FORMES = ["Micro-entreprise", "Entreprise individuelle (au réel)", "EURL ou SARL", "SASU ou SAS", "SCI", "Association", "Autre"];
const CA = ["Moins de 100 000 €", "100 000 à 500 000 €", "500 000 € à 2 M€", "Plus de 2 M€"];

// Avocat : le sujet (« Votre demande concerne… ») n'est plus une question du questionnaire,
// c'est le sous-domaine choisi en puces parmi les sujets cochés sur le motif (id « sujet », valeur = id de spécialité).
// Une condition peut donc porter sur lui : si: { id: "sujet", parmi: ["avocat-travail-licenciement", …] }.
const PROFIL_PART_PRO = ["Un particulier", "Une entreprise", "Une association ou un organisme public"];
const STADE = ["Pas encore de procédure", "Courrier ou mise en demeure reçu", "Procédure en justice en cours", "Décision rendue (recours)"];
const MONTANT = ["Moins de 5 000 €", "5 000 à 50 000 €", "50 000 à 200 000 €", "Plus de 200 000 €", "Je ne sais pas"];
const ECHEANCE = { id: "echeance", label: "Date de l'audience ou de la prochaine échéance", type: "date", futur: true,
  aide: "Laissez vide s'il n'y en a pas." } as const satisfies Question;
const sp = (d: string, ...s: string[]) => s.map((x) => `avocat-${d}-${x}`);

const AVOCAT: Record<string, Question[]> = {
  "avocat-divorce": [
    { id: "avancement", label: "Votre situation actuelle", type: "choix", requis: true, options: [
      "Je réfléchis à me séparer", "Nous sommes d'accord pour divorcer", "Nous ne sommes pas d'accord", "Une procédure est déjà engagée", "Le divorce est prononcé (modification)",
    ] },
    { id: "enfants", label: "Avez-vous des enfants mineurs ?", type: "choix", requis: true, options: ["Non", "1 enfant", "2 enfants", "3 enfants ou plus"] },
    { id: "bien", label: "Êtes-vous propriétaires d'un bien immobilier ensemble ?", type: "choix", options: ["Oui", "Non"] },
    { id: "conjoint_avocat", label: "Votre conjoint a-t-il déjà un avocat ?", type: "choix", options: ["Oui", "Non", "Je ne sais pas"] },
  ],

  "avocat-immobilier": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: [
      "Propriétaire bailleur", "Locataire", "Copropriétaire ou syndic", "Acheteur", "Vendeur", "Maître d'ouvrage (travaux)", "Autre",
    ] },
    { id: "bien", label: "Type de bien", type: "choix", options: ["Appartement", "Maison", "Terrain", "Local professionnel", "Autre"] },
    { id: "montant", label: "Montant en jeu", type: "choix", options: MONTANT },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", options: STADE },
  ],

  "avocat-travail": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Salarié(e)", "Employeur", "Représentant(e) du personnel", "Travailleur indépendant"] },
    { id: "anciennete", label: "Ancienneté dans l'entreprise", type: "choix", si: { id: "profil", parmi: ["Salarié(e)"] }, options: [
      "Moins d'1 an", "1 à 2 ans", "2 à 5 ans", "5 à 10 ans", "Plus de 10 ans",
    ] },
    { id: "date_rupture", label: "Date de la rupture du contrat ou de sa notification", type: "date", si: { id: "profil", parmi: ["Salarié(e)"] },
      aide: "Laissez vide si vous êtes toujours en poste. Certains recours doivent être engagés dans un délai limité." },
    { id: "effectif", label: "Effectif de l'entreprise", type: "choix", si: { id: "profil", parmi: ["Employeur", "Représentant(e) du personnel"] }, options: [
      "Moins de 11 salariés", "11 à 49 salariés", "50 à 249 salariés", "250 salariés et plus",
    ] },
    { id: "prudhommes", label: "Le conseil de prud'hommes est-il déjà saisi ?", type: "choix", options: ["Non", "Oui", "Je ne sais pas"] },
  ],

  "avocat-etat-civil": [
    { id: "pour", label: "La demande concerne…", type: "choix", requis: true, options: ["Moi-même", "Mon enfant mineur", "Une autre personne"] },
    { id: "nationalite", label: "La personne concernée a-t-elle la nationalité française ?", type: "choix", options: ["Oui", "Non", "Double nationalité"] },
    { id: "demarches", label: "Une demande a-t-elle déjà été faite ?", type: "choix", options: ["Non", "Oui, en mairie (en cours)", "Oui, refusée", "Oui, devant le tribunal"] },
  ],

  "avocat-administratif": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Un particulier", "Un agent public", "Une entreprise", "Une association ou une collectivité"] },
    { id: "administration", label: "Administration concernée", type: "choix", options: ["État ou préfecture", "Commune ou collectivité", "Hôpital, université ou autre établissement public", "Autre"] },
    { id: "decision", label: "Avez-vous reçu une décision écrite ?", type: "choix", options: ["Oui", "Non, pas de réponse de l'administration", "Je ne sais pas"] },
    { id: "date_decision", label: "Date de la décision", type: "date", si: { id: "decision", parmi: ["Oui"] },
      aide: "Le délai de recours est généralement de 2 mois." },
  ],

  "avocat-banque": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Un particulier", "Une entreprise", "Une caution"] },
    { id: "montant", label: "Montant en jeu", type: "choix", options: MONTANT },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", options: [
      "Réclamation à la banque sans réponse", "Mise en demeure ou saisie reçue", "Médiateur saisi", "Procédure en justice en cours",
    ] },
  ],

  "avocat-commercial": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Le créancier / demandeur", "Le débiteur / défendeur", "Je souhaite sécuriser un contrat"] },
    { id: "montant", label: "Montant en jeu", type: "choix", options: MONTANT },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", options: STADE },
    ECHEANCE,
  ],

  "avocat-environnement": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Un particulier ou riverain", "Une entreprise ou un exploitant", "Une association", "Une collectivité"] },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", options: STADE },
    ECHEANCE,
  ],

  "avocat-urbanisme": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Porteur du projet", "Voisin ou tiers", "Professionnel (promoteur, architecte…)", "Collectivité"] },
    { id: "autorisation", label: "Où en est l'autorisation ?", type: "choix", options: ["Pas encore déposée", "En cours d'instruction", "Accordée", "Refusée", "Retirée ou contestée"] },
    { id: "date_affichage", label: "Date de la décision ou de l'affichage du permis", type: "date",
      aide: "Le recours contre un permis doit être formé dans les 2 mois suivant l'affichage." },
  ],

  "avocat-union-europeenne": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: PROFIL_PART_PRO },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", options: STADE },
    ECHEANCE,
  ],

  "avocat-consommation": [
    { id: "montant", label: "Montant en jeu", type: "choix", requis: true, options: ["Moins de 1 000 €", "1 000 à 5 000 €", "5 000 à 20 000 €", "Plus de 20 000 €"] },
    { id: "demarches", label: "Démarches déjà engagées", type: "choix", options: [
      "Aucune pour l'instant", "Réclamation écrite au professionnel", "Médiateur ou commission saisi", "Procédure en justice en cours",
    ] },
    { id: "date_faits", label: "Date de l'achat ou du litige", type: "date" },
  ],

  "avocat-famille": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Parent", "Grand-parent ou membre de la famille", "Personne concernée (majeur protégé, partenaire…)", "Autre"] },
    { id: "enfants", label: "Des enfants mineurs sont-ils concernés ?", type: "choix", options: ["Non", "1 enfant", "2 enfants", "3 enfants ou plus"] },
    { id: "juge", label: "Un juge est-il déjà intervenu ?", type: "choix", options: ["Non", "Oui, un jugement a été rendu", "Oui, une audience est prévue"] },
    { ...ECHEANCE, si: { id: "juge", parmi: ["Oui, une audience est prévue"] } },
  ],

  "avocat-propriete-intellectuelle": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Créateur ou auteur", "Une entreprise", "Une association", "Autre"] },
    { id: "objectif", label: "Vous souhaitez…", type: "choix", requis: true, options: [
      "Protéger une création ou une marque", "Agir contre une contrefaçon", "Me défendre contre une accusation", "Rédiger ou négocier un contrat",
    ] },
    { id: "montant", label: "Montant en jeu", type: "choix", si: { id: "objectif", parmi: ["Agir contre une contrefaçon", "Me défendre contre une accusation"] }, options: MONTANT },
  ],

  "avocat-sante": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Patient(e)", "Un proche du patient", "Un proche d'une personne décédée", "Professionnel ou établissement de santé"] },
    { id: "date_faits", label: "Date des faits", type: "date", aide: "Les délais pour agir dépendent de cette date." },
    { id: "demarches", label: "Démarches déjà engagées", type: "choix", options: [
      "Aucune pour l'instant", "Réclamation à l'établissement ou à l'assureur", "Expertise médicale en cours", "Procédure en cours (CCI, tribunal)",
    ] },
  ],

  "avocat-securite-sociale": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Assuré(e) ou allocataire", "Employeur", "Travailleur indépendant"] },
    { id: "organisme", label: "Organisme concerné", type: "choix", options: ["CPAM", "CAF", "URSSAF", "MSA", "France Travail", "Caisse de retraite", "Autre"] },
    { id: "recours", label: "Avez-vous déjà contesté la décision (commission de recours amiable) ?", type: "choix", options: ["Non", "Oui, en attente", "Oui, refusé", "Je ne sais pas"] },
    { id: "date_decision", label: "Date de la décision contestée", type: "date", aide: "Le délai de contestation est souvent de 2 mois." },
  ],

  "avocat-associations": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Dirigeant(e) ou membre du bureau", "Membre ou adhérent(e)", "Porteur de projet", "Autre"] },
    { id: "taille", label: "Taille de la structure", type: "choix", options: ["Pas encore créée", "Sans salarié", "1 à 10 salariés", "Plus de 10 salariés"] },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", options: ["J'ai besoin d'un conseil", ...STADE.slice(1)] },
  ],

  "avocat-assurance": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: PROFIL_PART_PRO },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", requis: true, options: [
      "Sinistre déclaré, pas de réponse", "Refus de l'assureur", "Offre jugée insuffisante", "Expertise en cours", "Procédure en cours",
    ] },
    { id: "montant", label: "Montant en jeu", type: "choix", options: MONTANT },
  ],

  "avocat-bail-commercial": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Locataire (preneur)", "Bailleur", "Futur locataire", "Intermédiaire"] },
    { id: "acte", label: "Avez-vous reçu un acte d'un commissaire de justice (commandement, congé, assignation) ?", type: "choix", options: ["Oui", "Non"] },
    { id: "loyer", label: "Loyer annuel", type: "choix", options: ["Moins de 20 000 €", "20 000 à 100 000 €", "Plus de 100 000 €"] },
    { ...ECHEANCE, si: { id: "acte", parmi: ["Oui"] } },
  ],

  "avocat-difficultes": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Dirigeant(e) de l'entreprise", "Créancier", "Repreneur", "Salarié(e)", "Autre"] },
    { id: "forme", label: "Forme de l'entreprise", type: "choix", options: ["Micro-entreprise ou EI", "SARL ou EURL", "SAS ou SASU", "Autre"] },
    { id: "procedure", label: "Une procédure collective est-elle ouverte ?", type: "choix", options: ["Non", "Oui, sauvegarde", "Oui, redressement", "Oui, liquidation", "Je ne sais pas"] },
    ECHEANCE,
  ],

  "avocat-etrangers": [
    { id: "titre", label: "Votre situation actuelle", type: "choix", requis: true, options: [
      "J'ai un titre de séjour valide", "Mon titre expire bientôt ou a expiré", "J'ai un récépissé", "Je n'ai pas de titre de séjour", "Je ne suis pas en France",
    ] },
    { id: "date_decision", label: "Date de notification de la décision", type: "date",
      si: { id: "sujet", parmi: sp("etrangers", "oqtf", "retention", "expulsion") }, aide: "Les délais de recours sont très courts, parfois 48 heures." },
    { id: "anciennete", label: "Depuis combien de temps vivez-vous en France ?", type: "choix", options: ["Moins d'1 an", "1 à 5 ans", "5 à 10 ans", "Plus de 10 ans"] },
    { id: "demarches", label: "Avez-vous déjà fait une demande en préfecture ?", type: "choix", options: ["Non", "Oui, en cours", "Oui, refusée"] },
  ],

  "avocat-numerique": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: PROFIL_PART_PRO },
    { id: "urgence", label: "Y a-t-il une urgence ?", type: "choix", options: [
      "Non", "Oui, un contenu en ligne à faire retirer", "Oui, mise en demeure ou contrôle CNIL reçu", "Oui, procédure en cours",
    ] },
    { id: "effectif", label: "Taille de l'entreprise", type: "choix", si: { id: "profil", parmi: ["Une entreprise"] },
      options: ["Moins de 10 salariés", "10 à 49 salariés", "50 à 249 salariés", "250 salariés et plus"] },
  ],

  "avocat-societes": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Dirigeant(e)", "Associé(e) ou actionnaire", "Créateur ou futur associé", "Investisseur ou repreneur"] },
    { id: "forme", label: "Forme de la société", type: "choix", requis: true, options: ["SAS ou SASU", "SARL ou EURL", "SCI", "Pas encore créée", "Autre"] },
    { id: "effectif", label: "Nombre de salariés", type: "choix", options: ["Aucun", "1 à 10", "11 à 49", "50 et plus"] },
    { id: "montant", label: "Montant en jeu", type: "choix", si: { id: "sujet", parmi: sp("societes", "conflit", "cession", "levee-fonds", "restructuration") }, options: MONTANT },
  ],

  "avocat-successions": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Héritier(e)", "Je prépare ma propre succession", "Bénéficiaire d'une assurance-vie", "Autre"] },
    { id: "date_deces", label: "Date du décès", type: "date", si: { id: "profil", parmi: ["Héritier(e)", "Bénéficiaire d'une assurance-vie"] } },
    { id: "notaire", label: "Un notaire est-il déjà en charge du dossier ?", type: "choix", options: ["Oui", "Non", "Je ne sais pas"] },
    { id: "desaccord", label: "Y a-t-il un désaccord entre héritiers ?", type: "choix", options: ["Oui", "Non", "Pas encore"] },
  ],

  "avocat-transports": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Voyageur", "Expéditeur ou destinataire", "Transporteur ou commissionnaire", "Autre"] },
    { id: "montant", label: "Montant en jeu", type: "choix", options: ["Moins de 1 000 €", "1 000 à 10 000 €", "Plus de 10 000 €"] },
    { id: "date_faits", label: "Date des faits", type: "date", aide: "Certaines réclamations doivent être faites très rapidement." },
  ],

  "avocat-dommage-corporel": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["La victime", "Un proche de la victime", "Un proche d'une personne décédée", "La personne mise en cause"] },
    { id: "date_faits", label: "Date de l'accident ou des faits", type: "date", aide: "Les délais pour agir dépendent de cette date." },
    { id: "offre", label: "Une offre d'indemnisation a-t-elle été faite ?", type: "choix", options: ["Non", "Oui, je la trouve insuffisante", "Oui, je veux la faire vérifier"] },
    { id: "expertise", label: "Une expertise médicale a-t-elle eu lieu ?", type: "choix", options: ["Oui", "Non", "Elle est prévue"] },
  ],

  "avocat-sport": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Sportif ou sportive", "Club ou fédération", "Agent", "Entreprise ou sponsor", "Autre"] },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", options: ["J'ai besoin d'un conseil", "Procédure disciplinaire en cours", ...STADE.slice(1)] },
    ECHEANCE,
  ],

  "avocat-fiscal": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Un particulier", "Une entreprise", "Un dirigeant", "Autre"] },
    { id: "courrier", label: "Avez-vous reçu un courrier de l'administration fiscale ?", type: "choix", options: [
      "Non", "Avis de vérification ou de contrôle", "Proposition de rectification", "Avis de mise en recouvrement ou saisie", "Autre",
    ] },
    { id: "montant", label: "Montant en jeu", type: "choix", options: ["Moins de 10 000 €", "10 000 à 100 000 €", "Plus de 100 000 €", "Je ne sais pas"] },
    { id: "date_courrier", label: "Date de réception du courrier", type: "date", si: { id: "courrier", parmi: ["Proposition de rectification", "Avis de mise en recouvrement ou saisie"] },
      aide: "Vous disposez en général de 30 jours pour répondre à une proposition de rectification." },
  ],

  "avocat-international": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: PROFIL_PART_PRO },
    { id: "pays", label: "Pays concerné (hors France)", type: "choix", options: ["Un pays de l'Union européenne", "Royaume-Uni ou Suisse", "Maghreb", "Afrique subsaharienne", "Amériques", "Asie", "Autre"] },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", options: STADE },
  ],

  "avocat-penal": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Victime", "Mis(e) en cause", "Proche d'une personne concernée"] },
    { id: "stade", label: "Où en est l'affaire ?", type: "choix", requis: true, options: [
      "Pas encore de plainte", "Plainte déposée", "Garde à vue ou convocation par la police", "Convocation au tribunal", "Jugement rendu",
    ] },
    { id: "date_audience", label: "Date de la convocation ou de l'audience", type: "date", futur: true,
      si: { id: "stade", parmi: ["Garde à vue ou convocation par la police", "Convocation au tribunal"] } },
  ],

  "avocat-rural": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Exploitant ou preneur", "Propriétaire ou bailleur", "Acquéreur ou repreneur", "Autre"] },
    { id: "surface", label: "Surface concernée", type: "choix", options: ["Moins de 10 ha", "10 à 50 ha", "Plus de 50 ha", "Je ne sais pas"] },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", options: STADE },
  ],

  "avocat-filiation": [
    { id: "pour", label: "La demande concerne…", type: "choix", requis: true, options: ["Moi-même", "Mon enfant mineur", "Un enfant majeur", "Autre"] },
    { id: "accord", label: "Les personnes concernées sont-elles d'accord ?", type: "choix", options: ["Oui", "Non", "Je ne sais pas"] },
    { id: "juge", label: "Un juge est-il déjà saisi ?", type: "choix", options: ["Non", "Oui", "Je ne sais pas"] },
  ],

  "avocat-routier": [
    { id: "stade", label: "Où en est le dossier ?", type: "choix", requis: true, options: [
      "J'ai reçu un avis de contravention", "Mon permis a été retenu ou suspendu", "J'ai reçu une lettre 48SI (invalidation)", "Je suis convoqué(e) au tribunal", "Je suis en discussion avec l'assurance", "Autre",
    ] },
    { id: "points", label: "Combien de points reste-t-il sur votre permis ?", type: "choix", options: ["0", "1 à 3", "4 à 6", "7 à 12", "Je ne sais pas"] },
    { id: "pro", label: "Avez-vous besoin du permis pour travailler ?", type: "choix", options: ["Oui", "Non"] },
    { id: "date_faits", label: "Date de l'infraction ou de l'accident", type: "date" },
  ],

  "avocat-surendettement": [
    { id: "dossier", label: "Avez-vous déjà déposé un dossier à la Banque de France ?", type: "choix", requis: true, options: ["Non", "Oui, en cours d'examen", "Oui, il a été refusé", "Oui, un plan est en place"] },
    { id: "montant", label: "Montant total de vos dettes", type: "choix", options: ["Moins de 10 000 €", "10 000 à 50 000 €", "Plus de 50 000 €", "Je ne sais pas"] },
    { id: "proprietaire", label: "Êtes-vous propriétaire de votre logement ?", type: "choix", options: ["Oui", "Non"] },
  ],
};

// Expert-comptable : comme pour l'avocat, le sujet est choisi en puces (sous-domaines cochés sur le motif) ;
// une condition peut porter sur lui : si: { id: "sujet", parmi: ["comptable-fiscalite-controle", …] }.
const cp = (d: string, ...s: string[]) => s.map((x) => `comptable-${d}-${x}`);
const PROFIL_CPT = ["Une société", "Un indépendant ou une profession libérale", "Un micro-entrepreneur", "Un particulier"];
const EFFECTIF = ["Aucun salarié", "1 à 5", "6 à 20", "21 à 50", "Plus de 50"];

const COMPTABLE: Record<string, Question[]> = {
  "comptable-creation": [
    { id: "avancement", label: "Où en est votre projet ?", type: "choix", requis: true, options: [
      "Idée en réflexion", "Création prévue dans les 3 mois", "Entreprise immatriculée récemment",
    ] },
    { id: "statut", label: "Statut envisagé", type: "choix", options: [
      "Micro-entreprise", "Entreprise individuelle (au réel)", "EURL ou SARL", "SASU ou SAS", "SCI", "Holding", "Je ne sais pas encore",
    ] },
    { id: "activite", label: "Type d'activité", type: "choix", options: [
      "Commerce ou e-commerce", "Artisanat, BTP", "Services, conseil", "Profession libérale", "Restauration", "Immobilier (location, SCI)", "Autre",
    ] },
    { id: "ca", label: "Chiffre d'affaires prévu la première année", type: "choix", options: [
      "Moins de 50 000 €", "50 000 à 150 000 €", "150 000 à 500 000 €", "Plus de 500 000 €", "Je ne sais pas encore",
    ] },
  ],

  "comptable-changement": [
    { id: "raison", label: "Pourquoi souhaitez-vous changer ?", type: "choix", requis: true, options: [
      "Manque de disponibilité ou de conseil", "Honoraires trop élevés", "Besoin d'outils plus modernes", "Mon comptable arrête son activité", "Je n'ai pas encore de comptable", "Autre",
    ] },
    { id: "forme", label: "Forme de l'entreprise", type: "choix", requis: true, options: FORMES },
    { id: "ca", label: "Chiffre d'affaires annuel", type: "choix", options: CA },
    { id: "cloture", label: "Date de clôture de l'exercice", type: "choix", options: ["31 décembre", "Une autre date", "Je ne sais pas"] },
  ],

  "comptable-bilan": [
    { id: "forme", label: "Forme de l'entreprise", type: "choix", requis: true, options: FORMES },
    { id: "ca", label: "Chiffre d'affaires annuel", type: "choix", options: CA },
    { id: "date_cloture", label: "Date de clôture du prochain exercice", type: "date", futur: true },
    { id: "outil", label: "Aujourd'hui, votre comptabilité est tenue…", type: "choix", options: ["Par moi-même (tableur ou logiciel)", "Par un autre cabinet", "Elle n'est pas tenue", "Je ne sais pas"] },
  ],

  "comptable-fiscalite": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: PROFIL_CPT },
    { id: "date_controle", label: "Date de l'avis de vérification ou de la proposition de rectification", type: "date",
      si: { id: "sujet", parmi: cp("fiscalite", "controle") }, aide: "Le délai pour répondre est souvent de 30 jours." },
    { id: "ca", label: "Chiffre d'affaires annuel", type: "choix", si: { id: "profil", parmi: ["Une société", "Un indépendant ou une profession libérale", "Un micro-entrepreneur"] }, options: CA },
    { id: "regime_tva", label: "Régime de TVA", type: "choix", si: { id: "sujet", parmi: cp("fiscalite", "tva") },
      options: ["Franchise en base", "Réel simplifié", "Réel normal", "Je ne sais pas"] },
  ],

  "comptable-social": [
    { id: "effectif", label: "Nombre de salariés", type: "choix", requis: true, options: EFFECTIF },
    { id: "paie_actuelle", label: "Aujourd'hui, la paie est faite par…", type: "choix", options: ["Moi-même", "Un autre cabinet", "Un logiciel ou un prestataire", "Personne pour l'instant"] },
    { id: "convention", label: "Connaissez-vous votre convention collective ?", type: "choix", options: ["Oui", "Non", "Je n'en ai pas"] },
  ],

  "comptable-juridique": [
    { id: "forme", label: "Forme de la société", type: "choix", requis: true, options: ["SASU ou SAS", "EURL ou SARL", "SCI", "Holding", "Autre"] },
    { id: "associes", label: "Nombre d'associés", type: "choix", options: ["1 (associé unique)", "2 à 5", "Plus de 5"] },
    { id: "echeance", label: "Date limite à respecter", type: "date", futur: true, aide: "Par exemple : approbation des comptes dans les 6 mois suivant la clôture." },
  ],

  "comptable-gestion": [
    { id: "forme", label: "Forme de l'entreprise", type: "choix", requis: true, options: FORMES },
    { id: "ca", label: "Chiffre d'affaires annuel", type: "choix", options: CA },
    { id: "echeance", label: "Y a-t-il une échéance ?", type: "choix", options: ["Non", "Oui, dans le mois", "Oui, dans les 3 mois"] },
  ],

  "comptable-immobilier": [
    { id: "nb_biens", label: "Nombre de biens", type: "choix", requis: true, options: ["1", "2 ou 3", "4 ou plus"] },
    { id: "regime", label: "Régime actuel", type: "choix", options: ["Micro (micro-BIC ou micro-foncier)", "Réel", "SCI à l'IR", "SCI à l'IS", "Je ne sais pas"] },
    { id: "premiere", label: "Est-ce la première année de location ?", type: "choix", options: ["Oui", "Non"] },
  ],

  "comptable-particulier": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Salarié(e)", "Retraité(e)", "Indépendant(e)", "Dirigeant(e) d'entreprise", "Autre"] },
    { id: "premiere", label: "Est-ce la première année pour cette situation ?", type: "choix", options: ["Oui", "Non"] },
    { id: "date_limite", label: "Date limite de déclaration ou de réponse", type: "date", futur: true, aide: "Laissez vide s'il n'y en a pas." },
  ],
};

export const QUESTIONNAIRES: Record<string, Question[]> = { ...AVOCAT, ...COMPTABLE };

export const aUnQuestionnaire = (domaineId: string | null | undefined) => !!domaineId && !!QUESTIONNAIRES[domaineId]?.length;

/**
 * Questions à afficher compte tenu des réponses déjà données (conditions « si », y compris sur le sujet choisi),
 * dans la limite de `max` (voir placesQuestions).
 */
export function questionsVisibles(domaineId: string | null | undefined, valeurs: Record<string, string>, max = MAX_QUESTIONS): Question[] {
  return (domaineId ? QUESTIONNAIRES[domaineId] ?? [] : [])
    .filter((q) => !q.si || q.si.parmi.includes(valeurs[q.si.id] ?? ""))
    .slice(0, Math.max(0, max));
}

export const questionnaireComplet = (domaineId: string | null | undefined, valeurs: Record<string, string>, max = MAX_QUESTIONS) =>
  questionsVisibles(domaineId, valeurs, max).every((q) => !q.requis || !!valeurs[q.id]);

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Date saisie → « 3 octobre 2026 (il y a 2 mois) » ou « (dans 12 jours) » : c'est le délai qui intéresse le pro. */
function dateLisible(iso: string, maintenant = new Date()) {
  const [a, m, j] = iso.split("-").map(Number);
  const jour = Date.UTC(a, m - 1, j);
  const auj = Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate());
  const jours = Math.round((jour - auj) / 86400000);
  let ecart: string;
  if (jours === 0) ecart = "aujourd'hui";
  else if (jours > 0) ecart = jours < 60 ? `dans ${jours} jour${jours > 1 ? "s" : ""}` : `dans ${Math.round(jours / 30)} mois`;
  else {
    const mois = (maintenant.getUTCFullYear() - a) * 12 + (maintenant.getUTCMonth() - (m - 1)) - (maintenant.getUTCDate() < j ? 1 : 0);
    ecart = mois < 1 ? `il y a ${-jours} jour${jours < -1 ? "s" : ""}` : mois < 24 ? `il y a ${mois} mois` : `il y a ${Math.floor(mois / 12)} ans`;
  }
  return `${j} ${MOIS[m - 1]} ${a} (${ecart})`;
}

/** Côté serveur : ne garde que les réponses valides aux questions visibles, dans l'ordre du questionnaire. */
export function figerReponses(domaineId: string | null | undefined, brut: unknown, max = MAX_QUESTIONS): Reponse[] | null {
  if (!aUnQuestionnaire(domaineId) || !brut || typeof brut !== "object") return null;
  const valeurs: Record<string, string> = {};
  for (const [k, v] of Object.entries(brut as Record<string, unknown>)) if (typeof v === "string") valeurs[k] = v.slice(0, 200);
  const res: Reponse[] = [];
  for (const q of questionsVisibles(domaineId, valeurs, max)) {
    const v = valeurs[q.id];
    if (!v) continue;
    if (q.type === "choix" && q.options?.includes(v)) res.push({ question: q.label, reponse: v });
    if (q.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))) res.push({ question: q.label, reponse: dateLisible(v) });
  }
  return res.length ? res : null;
}
