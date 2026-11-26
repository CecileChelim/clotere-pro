/* Barreau déduit de l'adresse du cabinet (inscription avocat). Suggestion modifiable par l'avocat.
   - Île-de-France : un barreau par département (sauf la Seine-et-Marne, qui en compte plusieurs).
   - Ailleurs : seulement quand la ville du cabinet est elle-même le siège d'un barreau connu.
   Sinon aucune suggestion : on ne devine pas un ressort qu'on ne connaît pas. */

const PAR_DEPARTEMENT: Record<string, string> = {
  "75": "Paris",
  "78": "Versailles",
  "91": "Essonne",
  "92": "Hauts-de-Seine",
  "93": "Seine-Saint-Denis",
  "94": "Val-de-Marne",
  "95": "Val-d'Oise",
};

const SIEGES = [
  "Lyon", "Marseille", "Bordeaux", "Toulouse", "Lille", "Nantes", "Nice", "Strasbourg", "Montpellier", "Rennes",
  "Grenoble", "Toulon", "Dijon", "Angers", "Reims", "Rouen", "Tours", "Orléans", "Clermont-Ferrand", "Limoges",
  "Metz", "Nancy", "Caen", "Brest", "Amiens", "Besançon", "Poitiers", "Perpignan", "Nîmes", "Avignon",
  "Aix-en-Provence", "Pau", "Bayonne", "La Rochelle", "Le Mans", "Mulhouse", "Saint-Étienne", "Meaux", "Melun", "Fontainebleau",
];

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]+/g, " ").trim();
const parNom = new Map(SIEGES.map((v) => [norm(v), v]));

export function devinerBarreau(codePostal: string | null | undefined, ville: string | null | undefined): string | null {
  const cp = (codePostal ?? "").replace(/\s/g, "");
  const dep = PAR_DEPARTEMENT[cp.slice(0, 2)];
  if (/^\d{5}$/.test(cp) && dep) return dep;
  // « Lyon 3e Arrondissement », « Marseille 8e » : on garde le nom de la ville.
  const v = norm((ville ?? "").replace(/\s*\d.*$/, "").replace(/\s+cedex.*$/i, ""));
  return parNom.get(v) ?? null;
}

/** « paris » → « Paris » : seule la première lettre est mise en majuscule. */
export const majuscule = (s: string) => (s.trim() ? s.trim().charAt(0).toUpperCase() + s.trim().slice(1) : s.trim());
