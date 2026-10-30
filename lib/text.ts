// Casse d'affichage "Prénom Nom" — les CGP peuvent avoir saisi leur nom en
// minuscules ; on ne corrige que l'affichage, jamais la donnée stockée
// (certains noms composés/à particule seraient mal gérés par un titlecase
// naïf, donc on préfère ne pas réécrire la source).
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join("-")
    )
    .join(" ");
}
