import type { Profession } from "@/lib/professions-config";

/* Offre « Site internet » : types partagés par le créateur, le rendu public et l'éditeur du dashboard. */

export type TemplateId = "light" | "moderne" | "performance";
export type Formule = "contact" | "rdv"; // 69 € HT (formulaire de contact) | 99 € HT (prise de rdv + actualités)
export type Taille = "seul" | "petit" | "cabinet";

/** Sections de la page d'accueil (l'en-tête / hero est toujours affiché). */
export type SectionId = "apropos" | "domaines" | "approche" | "methode" | "honoraires" | "avis" | "faq" | "actualites" | "contact";

export const SECTIONS: { id: SectionId; label: string; description: string; formule?: Formule }[] = [
  { id: "apropos", label: "À propos", description: "Votre portrait et présentation" },
  { id: "domaines", label: "Domaines d'intervention", description: "La grille de vos domaines" },
  { id: "approche", label: "Notre approche", description: "Votre vision et votre manière de travailler" },
  { id: "methode", label: "Méthode", description: "Les étapes de votre accompagnement" },
  { id: "honoraires", label: "Honoraires", description: "Facturation, moyens de paiement et services (repris de votre Profil)" },
  { id: "avis", label: "Avis Google", description: "Votre note et vos derniers avis Google" },
  { id: "faq", label: "FAQ", description: "Questions fréquentes de vos visiteurs" },
  { id: "actualites", label: "Actualités", description: "Vos derniers articles", formule: "rdv" },
  { id: "contact", label: "Contact", description: "Formulaire ou prise de rendez-vous, et coordonnées" },
];
export const SECTIONS_PAR_DEFAUT: SectionId[] = ["apropos", "domaines", "approche", "methode", "honoraires", "avis", "faq", "contact"];

export const TEMPLATES: { id: TemplateId; nom: string; accroche: string; description: string; paletteParDefaut: string }[] = [
  { id: "light", nom: "Light", accroche: "Clair et rassurant", description: "Beaucoup d'air, des tons doux, une lecture posée.", paletteParDefaut: "sauge" },
  { id: "moderne", nom: "Moderne", accroche: "Éditorial et affirmé", description: "Grands titres, contrastes forts, style startup.", paletteParDefaut: "acide" },
  { id: "performance", nom: "Performance", accroche: "Pensé pour convertir", description: "Prise de contact dès le haut de page, avis mis en avant.", paletteParDefaut: "nuit-orange" },
];

export type Contenu = {
  hero: { surtitre: string; titre: string; accroche: string };
  apropos: { titre: string; texte: string; texte2: string; signature: string };
  domaines: { titre: string; intro: string; items: { titre: string; texte: string }[] };
  approche: { titre: string; texte: string; points: string[] };
  methode: { titre: string; etapes: { titre: string; texte: string }[] };
  honoraires: { titre: string; texte: string };
  avis: { titre: string };
  faq: { titre: string; items: { q: string; r: string }[] };
  actualites: { titre: string; items: { titre: string; date: string; texte: string }[] };
  contact: { titre: string; texte: string; horaires: string };
  chiffres: { valeur: string; label: string }[];
};

/** Tout ce qu'il faut pour afficher un site (aperçu du créateur, page publique, éditeur). */
export type SiteRendu = {
  profession: Profession;
  template: TemplateId;
  palette: string;
  sections: SectionId[];
  contenu: Contenu;
  formule: Formule;
  slug: string | null;
  siteId: string | null;                // null dans l'aperçu (formulaire inactif)
  apercu?: boolean;
  cabinet: { nom: string; adresse: string; complement: string | null; codePostal: string; ville: string; telephone: string | null; email: string | null; barreau?: string | null; siret?: string | null };
  /** Repris de Profil → Honoraires (libellés). */
  honoraires: { modes: string[]; paiement: string[]; services: string[] };
  pro: { prenom: string; nom: string; titre: string; photo: string | null };
  couverture: string | null;
  lienRdv: string | null;               // page de prise de rdv (/rdv/<slug du pro>)
  motifs: { id: string; libelle: string }[];
  avis: { note: number | null; nb: number | null; url: string | null; liste: { auteur: string; note: number; texte: string; quand?: string }[] };
};
