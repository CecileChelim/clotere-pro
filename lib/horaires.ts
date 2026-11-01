// Horaires d'ouverture : jours au format JS (0 = dimanche … 6 = samedi), jusqu'à 2 plages par jour.
export type Plage = { debut: string; fin: string };
export type Horaires = Record<number, Plage[]>;

export const JOURS = [
  { id: 1, label: "Lundi" }, { id: 2, label: "Mardi" }, { id: 3, label: "Mercredi" },
  { id: 4, label: "Jeudi" }, { id: 5, label: "Vendredi" }, { id: 6, label: "Samedi" }, { id: 0, label: "Dimanche" },
];

export const HORAIRES_DEFAUT: Horaires = Object.fromEntries(
  [0, 1, 2, 3, 4, 5, 6].map((j) => [j, j >= 1 && j <= 5 ? [{ debut: "09:00", fin: "12:30" }, { debut: "14:00", fin: "18:30" }] : []])
);

type Row = { jour_semaine: number | null; heure_debut: string; heure_fin: string; date?: string | null };

export function horairesDepuisRows(rows: Row[] | null | undefined): Horaires {
  const recurrentes = (rows ?? []).filter((r) => r.jour_semaine !== null && !r.date);
  if (!recurrentes.length) return HORAIRES_DEFAUT;
  const h: Horaires = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  recurrentes
    .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))
    .forEach((r) => h[r.jour_semaine as number].push({ debut: r.heure_debut.slice(0, 5), fin: r.heure_fin.slice(0, 5) }));
  return h;
}

export function rowsDepuisHoraires(proId: string, h: Horaires) {
  return Object.entries(h).flatMap(([jour, plages]) =>
    plages.filter((p) => p.debut < p.fin).map((p) => ({ professional_id: proId, jour_semaine: Number(jour), heure_debut: p.debut, heure_fin: p.fin }))
  );
}
