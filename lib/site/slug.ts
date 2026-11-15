import { slugify } from "@/lib/slug";

/* URL du site : <métier>.clotere.fr/<prenom>-<nom>-<domaine principal>-<ville>, avec l'arrondissement pour Paris, Lyon et Marseille.
   ex. alain-sergito-droit-de-la-famille-houilles, cecile-chelim-droit-du-travail-paris-7e */

/** Chemins déjà pris par les pages de clotere-pro : un site ne peut pas les utiliser. */
export const SLUGS_RESERVES = new Set([
  "avocat", "comptable", "blog", "login", "signup", "inscription", "onboarding", "dashboard", "api", "auth", "gestion", "suivi",
  "produit", "solution", "rdv", "reset-password", "creer-mon-site", "sitemap.xml", "robots.txt", "mentions-legales", "cgv", "cgu",
]);

export function lieuSlug(ville: string, codePostal: string) {
  const v = slugify(ville).replace(/-(\d+)(e|er|eme)?-?arrondissement$/, "");
  const cp = (codePostal || "").replace(/\s/g, "");
  const arr = (prefixe: string, nom: string) => {
    if (!cp.startsWith(prefixe) || cp.length !== 5) return null;
    const n = Number(cp.slice(3));
    if (!n || n > 20) return null;
    return `${nom}-${n}${n === 1 ? "er" : "e"}`;
  };
  return arr("750", "paris") ?? arr("6900", "lyon") ?? arr("130", "marseille") ?? v;
}

/** Mot-clé d'URL du domaine principal (la requête Google visée), ex. famille → droit-de-la-famille. */
export const MOTS_CLES: Record<string, string> = {
  // avocats
  famille: "droit-de-la-famille", travail: "droit-du-travail", immobilier: "droit-immobilier", societes: "droit-des-societes",
  contrats: "droit-commercial", penal: "droit-penal", numerique: "droit-du-numerique", pi: "propriete-intellectuelle",
  fiscal: "droit-fiscal", successions: "droit-des-successions", consommation: "droit-de-la-consommation", dommage: "dommage-corporel",
  // experts-comptables
  creation: "creation-entreprise", changer: "changement-expert-comptable", bilan: "comptabilite", fiscalite: "fiscalite",
  social: "paie", gestion: "conseil-gestion", particulier: "particuliers",
};

/** prenom-nom-<domaine principal>-<ville>, ex. alain-sergito-droit-de-la-famille-houilles. */
export function slugSite(prenom: string, nom: string, ville: string, codePostal: string, domainePrincipal?: string | null) {
  const base = slugify(`${prenom} ${nom}`) || "cabinet";
  const mot = domainePrincipal ? MOTS_CLES[domainePrincipal] : null;
  const lieu = lieuSlug(ville, codePostal);
  return [base, mot, lieu].filter(Boolean).join("-");
}
