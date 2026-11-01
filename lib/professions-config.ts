export type Profession = "avocat" | "comptable";

export function professionFromHost(host: string | null | undefined): Profession {
  const h = (host ?? "").split(":")[0];
  if (h.startsWith("comptable.") || h.includes("comptelio")) return "comptable";
  if (h.startsWith("avocat.")) return "avocat";
  return (process.env.DEFAULT_PROFESSION as Profession) || "avocat";
}

export type MotifDraft = {
  libelle: string;
  description: string;
  duree_min: number;
  modes: ("cabinet" | "visio" | "telephone")[];
  prix_type: "gratuit" | "payant" | "non_affiche";
  prix_euros: number | null;
  actif: boolean;
};

type Domaine = { id: string; label: string; description: string };

export const PROFESSIONS: Record<Profession, {
  label: string; labelPluriel: string; brand: string; titre: string;
  domaines: Domaine[]; motifParDefaut: MotifDraft; prefixeMotif: string;
}> = {
  avocat: {
    label: "avocat", labelPluriel: "avocats", brand: "Clotere Avocat", titre: "Maître",
    prefixeMotif: "1ère consultation",
    domaines: [
      { id: "famille", label: "Droit de la famille", description: "Divorce, garde d'enfants, pension alimentaire" },
      { id: "travail", label: "Droit du travail", description: "Licenciement, rupture conventionnelle, prud'hommes" },
      { id: "immobilier", label: "Immobilier & baux", description: "Bail d'habitation ou commercial, loyers impayés, copropriété" },
      { id: "societes", label: "Sociétés", description: "Création, statuts, pacte d'associés, conflit entre associés" },
      { id: "contrats", label: "Contrats commerciaux", description: "Rédaction, relecture, impayés, rupture" },
      { id: "penal", label: "Droit pénal", description: "Garde à vue, plainte, audience" },
      { id: "numerique", label: "Numérique & RGPD", description: "RGPD, contrats informatiques, e-commerce" },
      { id: "pi", label: "Propriété intellectuelle", description: "Dépôt de marque, droits d'auteur, contrefaçon" },
      { id: "fiscal", label: "Droit fiscal", description: "Contrôle fiscal, optimisation, contentieux" },
      { id: "successions", label: "Successions & patrimoine", description: "Héritage, donation, testament" },
      { id: "consommation", label: "Consommation", description: "Litige avec un professionnel, garanties" },
      { id: "dommage", label: "Dommage corporel", description: "Accident, indemnisation" },
    ],
    motifParDefaut: {
      libelle: "Premier échange téléphonique – gratuit", description: "15 minutes pour présenter votre situation",
      duree_min: 15, modes: ["visio", "telephone"], prix_type: "gratuit", prix_euros: null, actif: true,
    },
  },
  comptable: {
    label: "expert-comptable", labelPluriel: "experts-comptables", brand: "Clotere Expert-comptable", titre: "",
    prefixeMotif: "Premier rendez-vous",
    domaines: [
      { id: "creation", label: "Création d'entreprise", description: "Choix du statut, prévisionnel, immatriculation" },
      { id: "changement", label: "Changer d'expert-comptable", description: "Reprise du dossier, lettre de mission" },
      { id: "bilan", label: "Bilan & comptabilité", description: "Tenue, bilan annuel, liasse fiscale" },
      { id: "fiscalite", label: "Fiscalité", description: "TVA, IS, optimisation, contrôle fiscal" },
      { id: "social", label: "Social & paie", description: "Bulletins de paie, embauche, charges sociales" },
      { id: "gestion", label: "Conseil de gestion", description: "Tableaux de bord, trésorerie, financement" },
      { id: "particulier", label: "Particuliers", description: "Déclaration de revenus, LMNP, patrimoine" },
    ],
    motifParDefaut: {
      libelle: "Premier échange – gratuit", description: "20 minutes pour faire le point sur vos besoins",
      duree_min: 20, modes: ["telephone", "visio"], prix_type: "gratuit", prix_euros: null, actif: true,
    },
  },
};

export function motifsDepuisDomaines(p: Profession, ids: string[]): MotifDraft[] {
  const conf = PROFESSIONS[p];
  const parDomaine = conf.domaines.filter((d) => ids.includes(d.id)).map<MotifDraft>((d) => ({
    libelle: `${conf.prefixeMotif} – ${d.label}`, description: d.description,
    duree_min: 30, modes: ["visio", "telephone"], prix_type: "gratuit", prix_euros: null, actif: true,
  }));
  return [{ ...conf.motifParDefaut }, ...parDomaine];
}
