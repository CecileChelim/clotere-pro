export const HONORAIRES_MODES = [
  { id: "forfait", label: "Forfait" },
  { id: "horaire", label: "Taux horaire" },
  { id: "convention", label: "Selon convention d'honoraires" },
  { id: "resultat", label: "Honoraire de résultat (en complément)" },
];
export const PAIEMENT_MOYENS = [
  { id: "cb", label: "Carte bancaire" },
  { id: "cheque", label: "Chèque" },
  { id: "virement", label: "Virement" },
  { id: "especes", label: "Espèces" },
];
export const SERVICES = [
  { id: "aide_juridictionnelle", label: "Accepte l'aide juridictionnelle" },
  { id: "rdv_offert", label: "Premier rendez-vous offert si ouverture de dossier" },
  { id: "paiement_plusieurs_fois", label: "Paiement en plusieurs fois" },
  { id: "protection_juridique", label: "Accepte les protections juridiques (assurance)" },
];
export const labels = (list: { id: string; label: string }[], ids: string[] | null | undefined) =>
  list.filter((x) => (ids ?? []).includes(x.id)).map((x) => x.label);
