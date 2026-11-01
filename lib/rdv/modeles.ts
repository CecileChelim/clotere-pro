import { fmtDateHeure, MODE_LABEL } from "./format";

type Base = {
  client_prenom: string | null; client_nom: string; creneau_debut: string; mode: string | null; type_rdv: string;
  suivi_existant: boolean; motif: { domaine_id: string | null } | null; pro: { prenom: string; nom: string; profession: string };
};

// Pièces à préparer selon le domaine (clé = fin de l'id du domaine, ex. « avocat-travail » → « travail »).
const PIECES: Record<string, string[]> = {
  travail: ["votre contrat de travail et ses avenants", "vos 3 derniers bulletins de salaire", "tout courrier ou email de votre employeur (convocation, sanction, lettre de licenciement…)"],
  divorce: ["votre livret de famille", "votre contrat de mariage, le cas échéant", "un état de vos revenus et charges (avis d'imposition, bulletins de salaire)", "la liste des biens communs (logement, comptes, véhicules)"],
  famille: ["votre livret de famille", "les jugements ou actes déjà rendus, le cas échéant", "tout document utile à votre situation (acte de naissance, testament, contrat de PACS…)"],
  penal: ["la convocation, la citation ou le procès-verbal reçu", "le récépissé de plainte, le cas échéant", "tout élément de preuve (messages, certificats médicaux, témoignages)"],
  routier: ["l'avis de contravention ou la convocation", "votre relevé d'information intégral (solde de points)", "le constat amiable et les échanges avec votre assurance, en cas d'accident"],
  etrangers: ["votre passeport et votre titre de séjour (ou récépissé)", "les décisions ou courriers de la préfecture (refus, OQTF…)", "les justificatifs de présence en France et de situation familiale"],
  entreprises: ["l'extrait Kbis et les statuts de la société", "les contrats, factures ou échanges liés au litige", "les derniers comptes annuels, si pertinent"],
  immobilier: ["le bail, l'acte de vente ou le règlement de copropriété", "les échanges avec l'autre partie (courriers, mises en demeure)", "les factures, devis ou constats utiles"],
  sante: ["votre dossier médical et les comptes rendus d'hospitalisation", "les certificats médicaux", "les échanges avec l'établissement ou l'assureur"],
  consommation: ["la facture, le bon de commande ou le contrat", "les échanges avec le professionnel", "les preuves du défaut ou du litige (photos, constats)"],
  numerique: ["les contrats ou CGV concernés", "les captures d'écran et échanges utiles", "la documentation de vos traitements de données, si RGPD"],
  creation: ["votre projet en quelques lignes (activité, associés, chiffre d'affaires prévu)", "votre pièce d'identité"],
  changement: ["vos derniers bilans et liasses fiscales", "la lettre de mission de votre expert-comptable actuel"],
  bilan: ["vos relevés bancaires de l'exercice", "vos factures d'achat et de vente", "le dernier bilan"],
  fiscalite: ["vos dernières déclarations fiscales", "le courrier de l'administration, le cas échéant"],
  social: ["la liste de vos salariés et leurs contrats", "vos derniers bulletins de paie"],
};

export function messageModele(r: Base) {
  const cle = (r.motif?.domaine_id ?? "").split("-").slice(1).join("-");
  const pieces = r.suivi_existant ? [] : PIECES[cle] ?? [];
  const avocat = r.pro.profession === "avocat";
  const mode = (MODE_LABEL[r.mode ?? r.type_rdv] ?? "").toLowerCase();
  const lignes = [
    `Bonjour ${[r.client_prenom, r.client_nom].filter(Boolean).join(" ")},`,
    "",
    `Je vous confirme notre rendez-vous du ${fmtDateHeure(r.creneau_debut)}${mode ? ` (${mode})` : ""}.`,
  ];
  if (pieces.length) {
    lignes.push("", "Pour que cet échange soit le plus utile possible, merci de préparer :", ...pieces.map((p) => `• ${p}`));
  } else {
    lignes.push("", "N'hésitez pas à me transmettre d'ici là tout document utile à votre dossier.");
  }
  lignes.push(
    "",
    avocat ? "Nous ferons ensemble le point sur votre situation et les options qui s'offrent à vous." : "Nous ferons ensemble le point sur vos besoins.",
    "",
    "Bien cordialement,",
    `${avocat ? "Maître " : ""}${r.pro.prenom} ${r.pro.nom}`,
  );
  return lignes.join("\n");
}

export function messageRefusModele(r: Base) {
  return [
    `Bonjour ${[r.client_prenom, r.client_nom].filter(Boolean).join(" ")},`,
    "",
    "Je ne suis malheureusement pas disponible sur ce créneau. N'hésitez pas à en choisir un autre en ligne.",
    "",
    "Bien cordialement,",
    `${r.pro.profession === "avocat" ? "Maître " : ""}${r.pro.prenom} ${r.pro.nom}`,
  ].join("\n");
}
