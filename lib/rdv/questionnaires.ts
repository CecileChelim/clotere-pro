// Questions posées au client pendant la prise de rendez-vous, selon le domaine du motif.
// Écrites par Clotere (pas par le pro) : le pro choisit seulement le domaine de chaque motif
// et peut couper le questionnaire. Partagé client / serveur.
//
// Règles : 4 questions affichées au maximum sur un parcours, les 2 premières obligatoires,
// les suivantes facultatives (et souvent conditionnées par les 2 premières).

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

/** Règle produit : jamais plus de 4 questions affichées au client, quel que soit le parcours. */
export const MAX_QUESTIONS = 4;

/* ---------- Listes réutilisées ---------- */
const FORMES = ["Micro-entreprise", "Entreprise individuelle (au réel)", "EURL ou SARL", "SASU ou SAS", "SCI", "Association", "Autre"];
const CA = ["Moins de 100 000 €", "100 000 à 500 000 €", "500 000 € à 2 M€", "Plus de 2 M€"];
const DEMARCHES = ["Aucune pour l'instant", "Courrier ou mise en demeure envoyé", "Médiation ou expertise en cours", "Procédure en justice en cours"];

const AVOCAT: Record<string, Question[]> = {
  // Salarié : profil, sujet, ancienneté, date de rupture. Employeur / représentant : profil, sujet, effectif, prud'hommes.
  "avocat-travail": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Salarié(e)", "Employeur", "Représentant(e) du personnel"] },
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Licenciement", "Rupture conventionnelle", "Démission ou abandon de poste", "Harcèlement ou discrimination",
      "Salaire, heures supplémentaires, primes", "Contrat de travail (rédaction, modification)", "Accident du travail ou inaptitude", "Autre",
    ] },
    { id: "anciennete", label: "Ancienneté dans l'entreprise", type: "choix", si: { id: "profil", parmi: ["Salarié(e)"] }, options: [
      "Moins d'1 an", "1 à 2 ans", "2 à 5 ans", "5 à 10 ans", "Plus de 10 ans",
    ] },
    { id: "date_rupture", label: "Date de la rupture du contrat ou de sa notification", type: "date", si: { id: "profil", parmi: ["Salarié(e)"] },
      aide: "Laissez vide si vous êtes toujours en poste. Certains recours doivent être engagés dans un délai limité." },
    { id: "effectif", label: "Effectif de l'entreprise", type: "choix", si: { id: "profil", parmi: ["Employeur", "Représentant(e) du personnel"] }, options: [
      "Moins de 11 salariés", "11 à 49 salariés", "50 à 249 salariés", "250 salariés et plus",
    ] },
    { id: "prudhommes", label: "Le conseil de prud'hommes est-il déjà saisi ?", type: "choix", si: { id: "profil", parmi: ["Employeur", "Représentant(e) du personnel"] },
      options: ["Non", "Oui", "Je ne sais pas"] },
  ],

  "avocat-divorce": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Divorce à l'amiable", "Divorce sans accord", "Garde des enfants", "Pension alimentaire", "Prestation compensatoire", "Autre",
    ] },
    { id: "avancement", label: "Votre situation actuelle", type: "choix", requis: true, options: [
      "Je réfléchis à me séparer", "Nous sommes d'accord pour divorcer", "Une procédure est déjà engagée", "Le divorce est prononcé (modification)",
    ] },
    { id: "enfants", label: "Avez-vous des enfants mineurs ?", type: "choix", options: ["Non", "1 enfant", "2 enfants", "3 enfants ou plus"] },
    { id: "bien", label: "Êtes-vous propriétaires d'un bien immobilier ensemble ?", type: "choix", options: ["Oui", "Non"] },
  ],

  "avocat-famille": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Mariage, PACS, contrat de mariage", "Succession, héritage", "Donation, transmission de patrimoine", "Filiation, reconnaissance, adoption",
      "Protection d'un enfant", "Protection d'un majeur (tutelle, curatelle)", "Autre",
    ] },
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Directement concerné(e)", "Un membre de la famille", "Autre"] },
    { id: "date_deces", label: "Date du décès", type: "date", si: { id: "sujet", parmi: ["Succession, héritage"] } },
    { id: "saisi", label: "Un notaire ou un juge est-il déjà intervenu ?", type: "choix", options: ["Non", "Un notaire", "Un juge", "Je ne sais pas"] },
  ],

  "avocat-penal": [
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Victime", "Mis(e) en cause", "Proche d'une personne concernée"] },
    { id: "sujet", label: "Les faits concernent…", type: "choix", requis: true, options: [
      "Violences ou agression", "Violences conjugales", "Harcèlement", "Vol, escroquerie, abus de confiance", "Stupéfiants", "Faits commis par un mineur", "Autre",
    ] },
    { id: "stade", label: "Où en est l'affaire ?", type: "choix", options: [
      "Pas encore de plainte", "Plainte déposée", "Garde à vue ou convocation par la police", "Convocation au tribunal", "Jugement rendu",
    ] },
    { id: "date_audience", label: "Date de la convocation ou de l'audience", type: "date", futur: true,
      si: { id: "stade", parmi: ["Garde à vue ou convocation par la police", "Convocation au tribunal"] } },
  ],

  "avocat-routier": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Suspension ou retrait de permis", "Perte de points", "Excès de vitesse, alcool ou stupéfiants", "Accident (je suis victime)", "Accident (je suis mis en cause)", "Autre",
    ] },
    { id: "stade", label: "Où en est le dossier ?", type: "choix", requis: true, options: [
      "J'ai reçu un avis de contravention", "Mon permis a été retenu ou suspendu", "Je suis convoqué(e) au tribunal", "Je suis en discussion avec l'assurance", "Autre",
    ] },
    { id: "points", label: "Combien de points reste-t-il sur votre permis ?", type: "choix",
      si: { id: "sujet", parmi: ["Suspension ou retrait de permis", "Perte de points", "Excès de vitesse, alcool ou stupéfiants"] },
      options: ["0", "1 à 3", "4 à 6", "7 à 12", "Je ne sais pas"] },
    { id: "date_faits", label: "Date de l'infraction ou de l'accident", type: "date" },
  ],

  "avocat-etrangers": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Titre de séjour (demande, renouvellement)", "Naturalisation", "Regroupement familial", "OQTF ou refus de séjour", "Autre",
    ] },
    { id: "titre", label: "Votre situation actuelle", type: "choix", requis: true, options: [
      "J'ai un titre de séjour valide", "Mon titre expire bientôt ou a expiré", "J'ai un récépissé", "Je n'ai pas de titre de séjour",
    ] },
    { id: "date_decision", label: "Date de notification de la décision", type: "date", si: { id: "sujet", parmi: ["OQTF ou refus de séjour"] },
      aide: "Les délais de recours sont très courts, parfois 48 heures." },
    { id: "anciennete", label: "Depuis combien de temps vivez-vous en France ?", type: "choix", options: ["Moins d'1 an", "1 à 5 ans", "5 à 10 ans", "Plus de 10 ans"] },
  ],

  "avocat-entreprises": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Création, statuts, pacte d'associés", "Conflit entre associés", "Cession ou rachat d'entreprise", "Gestion des salariés",
      "Impayés, recouvrement", "Entreprise en difficulté", "Contrat commercial", "Autre",
    ] },
    { id: "forme", label: "Forme de l'entreprise", type: "choix", requis: true, options: [...FORMES.filter((f) => f !== "SCI"), "En cours de création"] },
    { id: "effectif", label: "Nombre de salariés", type: "choix", options: ["Aucun", "1 à 10", "11 à 49", "50 et plus"] },
    { id: "montant", label: "Montant en jeu", type: "choix", si: { id: "sujet", parmi: ["Impayés, recouvrement", "Conflit entre associés", "Cession ou rachat d'entreprise"] },
      options: ["Moins de 10 000 €", "10 000 à 100 000 €", "Plus de 100 000 €"] },
  ],

  "avocat-immobilier": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Loyers impayés, expulsion", "Litige de location (habitation)", "Bail commercial", "Copropriété", "Achat ou vente d'un bien", "Travaux, malfaçons", "Autre",
    ] },
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: [
      "Propriétaire bailleur", "Locataire", "Copropriétaire ou syndic", "Acheteur", "Vendeur", "Maître d'ouvrage (travaux)",
    ] },
    { id: "montant", label: "Montant en jeu", type: "choix", options: ["Moins de 5 000 €", "5 000 à 30 000 €", "30 000 à 100 000 €", "Plus de 100 000 €", "Je ne sais pas"] },
    { id: "demarches", label: "Démarches déjà engagées", type: "choix", options: DEMARCHES },
  ],

  "avocat-sante": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Erreur ou faute médicale", "Infection contractée à l'hôpital", "Accident de la route avec blessures", "Autre accident avec blessures", "Agression avec blessures", "Autre",
    ] },
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["La victime", "Un proche de la victime", "Un proche d'une personne décédée"] },
    { id: "date_faits", label: "Date des faits", type: "date", aide: "Les délais pour agir dépendent de cette date." },
    { id: "demarches", label: "Démarches déjà engagées", type: "choix", options: [
      "Aucune pour l'instant", "Réclamation à l'établissement ou à l'assureur", "Expertise médicale en cours", "Procédure en cours (CCI, tribunal)",
    ] },
  ],

  "avocat-consommation": [
    { id: "sujet", label: "Votre litige concerne…", type: "choix", requis: true, options: [
      "Produit défectueux ou non livré", "Service ou travaux mal exécutés", "Banque ou assurance", "Opérateur, abonnement", "Arnaque en ligne", "Surendettement", "Autre",
    ] },
    { id: "montant", label: "Montant en jeu (ou total des dettes)", type: "choix", requis: true, options: ["Moins de 1 000 €", "1 000 à 5 000 €", "5 000 à 20 000 €", "Plus de 20 000 €"] },
    { id: "demarches", label: "Démarches déjà engagées", type: "choix", options: [
      "Aucune pour l'instant", "Réclamation écrite au professionnel", "Médiateur ou commission saisi", "Procédure en justice en cours",
    ] },
    { id: "date_faits", label: "Date de l'achat ou du litige", type: "date" },
  ],

  "avocat-numerique": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "RGPD, données personnelles", "Contrat informatique, logiciel, SaaS", "E-réputation, contenu en ligne", "Marque, droits d'auteur, logiciel", "Piratage, cybersécurité", "Autre",
    ] },
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Une entreprise", "Un particulier", "Une association ou un organisme public"] },
    { id: "urgence", label: "Y a-t-il une urgence ?", type: "choix", options: [
      "Non", "Oui, un contenu en ligne à faire retirer", "Oui, mise en demeure ou contrôle CNIL reçu", "Oui, procédure en cours",
    ] },
    { id: "effectif", label: "Taille de l'entreprise", type: "choix", si: { id: "profil", parmi: ["Une entreprise"] },
      options: ["Moins de 10 salariés", "10 à 49 salariés", "50 à 249 salariés", "250 salariés et plus"] },
  ],

  "avocat-autres": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Droit civil (contrat, responsabilité, voisinage)", "Propriété intellectuelle", "Droit fiscal", "Droit international", "Droit du sport", "Droit rural", "Droit des animaux", "Autre",
    ] },
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Un particulier", "Une entreprise", "Une association"] },
    { id: "stade", label: "Où en est votre dossier ?", type: "choix", options: [
      "J'ai besoin d'un conseil", "Litige à l'amiable en cours", "Procédure en justice en cours", "Décision rendue (recours)",
    ] },
    { id: "montant", label: "Montant en jeu", type: "choix", options: ["Moins de 5 000 €", "5 000 à 50 000 €", "Plus de 50 000 €", "Pas d'enjeu financier"] },
  ],
};

const COMPTABLE: Record<string, Question[]> = {
  "comptable-creation": [
    { id: "avancement", label: "Où en est votre projet ?", type: "choix", requis: true, options: [
      "Idée en réflexion", "Création prévue dans les 3 mois", "Entreprise immatriculée récemment",
    ] },
    { id: "statut", label: "Statut envisagé", type: "choix", requis: true, options: [
      "Micro-entreprise", "Entreprise individuelle (au réel)", "EURL ou SARL", "SASU ou SAS", "Je ne sais pas encore",
    ] },
    { id: "activite", label: "Type d'activité", type: "choix", options: [
      "Commerce", "Artisanat, BTP", "Services, conseil", "Profession libérale", "Restauration", "Immobilier (location, SCI)", "Autre",
    ] },
    { id: "ca", label: "Chiffre d'affaires prévu la première année", type: "choix", options: [
      "Moins de 50 000 €", "50 000 à 150 000 €", "150 000 à 500 000 €", "Plus de 500 000 €", "Je ne sais pas encore",
    ] },
  ],

  "comptable-changement": [
    { id: "raison", label: "Pourquoi souhaitez-vous changer ?", type: "choix", requis: true, options: [
      "Manque de disponibilité ou de conseil", "Honoraires trop élevés", "Besoin d'outils plus modernes", "Mon comptable arrête son activité", "Autre",
    ] },
    { id: "forme", label: "Forme de l'entreprise", type: "choix", requis: true, options: FORMES },
    { id: "ca", label: "Chiffre d'affaires annuel", type: "choix", options: CA },
    { id: "cloture", label: "Date de clôture de l'exercice", type: "choix", options: ["31 décembre", "Une autre date", "Je ne sais pas"] },
  ],

  "comptable-bilan": [
    { id: "besoin", label: "Votre besoin", type: "choix", requis: true, options: [
      "Tenue de la comptabilité", "Bilan annuel", "Liasse fiscale", "Rattrapage d'une comptabilité en retard", "Autre",
    ] },
    { id: "forme", label: "Forme de l'entreprise", type: "choix", requis: true, options: FORMES },
    { id: "ca", label: "Chiffre d'affaires annuel", type: "choix", options: CA },
    { id: "date_cloture", label: "Date de clôture du prochain exercice", type: "date", futur: true },
  ],

  "comptable-fiscalite": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "TVA", "Impôt sur les sociétés", "Optimisation fiscale", "Contrôle fiscal", "Autre",
    ] },
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Une entreprise", "Un indépendant ou une profession libérale", "Un particulier"] },
    { id: "date_controle", label: "Date de l'avis de vérification ou de la proposition de rectification", type: "date",
      si: { id: "sujet", parmi: ["Contrôle fiscal"] }, aide: "Le délai pour répondre est souvent de 30 jours." },
    { id: "ca", label: "Chiffre d'affaires annuel", type: "choix", si: { id: "profil", parmi: ["Une entreprise", "Un indépendant ou une profession libérale"] }, options: CA },
  ],

  "comptable-social": [
    { id: "besoin", label: "Votre besoin", type: "choix", requis: true, options: [
      "Bulletins de paie", "Embauche d'un premier salarié", "Embauche (déjà employeur)", "Charges sociales, URSSAF", "Fin d'un contrat de travail", "Autre",
    ] },
    { id: "effectif", label: "Nombre de salariés", type: "choix", requis: true, options: ["Aucun pour l'instant", "1 à 5", "6 à 20", "21 à 50", "Plus de 50"] },
    { id: "paie_actuelle", label: "Aujourd'hui, la paie est faite par…", type: "choix", options: ["Moi-même", "Un autre cabinet", "Un logiciel ou un prestataire", "Personne pour l'instant"] },
  ],

  "comptable-gestion": [
    { id: "besoin", label: "Votre besoin", type: "choix", requis: true, options: [
      "Tableaux de bord, suivi d'activité", "Trésorerie", "Financement (prêt, levée de fonds)", "Prévisionnel", "Rentabilité, prix", "Autre",
    ] },
    { id: "forme", label: "Forme de l'entreprise", type: "choix", requis: true, options: FORMES },
    { id: "ca", label: "Chiffre d'affaires annuel", type: "choix", options: CA },
    { id: "echeance", label: "Y a-t-il une échéance ?", type: "choix", options: ["Non", "Oui, dans le mois", "Oui, dans les 3 mois"] },
  ],

  "comptable-particulier": [
    { id: "sujet", label: "Votre demande concerne…", type: "choix", requis: true, options: [
      "Déclaration de revenus", "Location meublée (LMNP)", "Revenus fonciers, SCI", "Patrimoine, transmission", "Revenus de l'étranger", "Autre",
    ] },
    { id: "profil", label: "Vous êtes…", type: "choix", requis: true, options: ["Salarié(e)", "Retraité(e)", "Indépendant(e)", "Dirigeant(e) d'entreprise", "Autre"] },
    { id: "nb_biens", label: "Nombre de biens en location", type: "choix", si: { id: "sujet", parmi: ["Location meublée (LMNP)", "Revenus fonciers, SCI"] },
      options: ["1", "2 ou 3", "4 ou plus"] },
    { id: "premiere", label: "Est-ce la première année pour cette situation ?", type: "choix", options: ["Oui", "Non"] },
  ],
};

export const QUESTIONNAIRES: Record<string, Question[]> = { ...AVOCAT, ...COMPTABLE };

export const aUnQuestionnaire = (domaineId: string | null | undefined) => !!domaineId && !!QUESTIONNAIRES[domaineId]?.length;

/** Questions à afficher compte tenu des réponses déjà données (conditions « si »), 4 au maximum. */
export function questionsVisibles(domaineId: string | null | undefined, valeurs: Record<string, string>): Question[] {
  return (domaineId ? QUESTIONNAIRES[domaineId] ?? [] : [])
    .filter((q) => !q.si || q.si.parmi.includes(valeurs[q.si.id] ?? ""))
    .slice(0, MAX_QUESTIONS);
}

export const questionnaireComplet = (domaineId: string | null | undefined, valeurs: Record<string, string>) =>
  questionsVisibles(domaineId, valeurs).every((q) => !q.requis || !!valeurs[q.id]);

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
export function figerReponses(domaineId: string | null | undefined, brut: unknown): Reponse[] | null {
  if (!aUnQuestionnaire(domaineId) || !brut || typeof brut !== "object") return null;
  const valeurs: Record<string, string> = {};
  for (const [k, v] of Object.entries(brut as Record<string, unknown>)) if (typeof v === "string") valeurs[k] = v.slice(0, 200);
  const res: Reponse[] = [];
  for (const q of questionsVisibles(domaineId, valeurs)) {
    const v = valeurs[q.id];
    if (!v) continue;
    if (q.type === "choix" && q.options?.includes(v)) res.push({ question: q.label, reponse: v });
    if (q.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))) res.push({ question: q.label, reponse: dateLisible(v) });
  }
  return res.length ? res : null;
}
