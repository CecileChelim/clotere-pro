const TZ = "Europe/Paris";

export const fmtJour = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ }).format(new Date(iso));
export const fmtHeure = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso)).replace(":", "h");
export const fmtDateHeure = (iso: string) => `${fmtJour(iso)} à ${fmtHeure(iso)}`;

export const MODE_LABEL: Record<string, string> = { visio: "En visio", telephone: "Par téléphone", tel: "Par téléphone", cabinet: "Au cabinet" };

export const STATUT_LABEL: Record<string, string> = {
  "demandé": "En attente de validation",
  "confirmé": "Confirmé",
  "refusé": "Créneau indisponible",
  "proposé": "Nouveaux créneaux proposés",
  "annulé": "Annulé",
};

/** Fichier .ics (invitation agenda) pour un rendez-vous. */
export function ics({ uid, debut, fin, titre, lieu, description }: { uid: string; debut: string; fin: string; titre: string; lieu?: string; description?: string }) {
  const d = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s = "") => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Clotere//RDV//FR", "METHOD:PUBLISH",
    // SEQUENCE croissante : un rendez-vous déplacé (même UID) remplace l'ancien dans les agendas qui le gèrent
    "BEGIN:VEVENT", `UID:${uid}@clotere.fr`, `SEQUENCE:${Math.floor(Date.now() / 1000)}`, `DTSTAMP:${d(new Date().toISOString())}`,
    `DTSTART:${d(debut)}`, `DTEND:${d(fin)}`, `SUMMARY:${esc(titre)}`,
    lieu ? `LOCATION:${esc(lieu)}` : "", description ? `DESCRIPTION:${esc(description)}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

/** Éléments de la « carte date » (NOV / 05 / 15:00), heure de Paris. */
export function dateTile(iso: string) {
  const d = new Date(iso);
  const mois = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: TZ }).format(d).replace(".", "").slice(0, 4).toUpperCase();
  const jour = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", timeZone: TZ }).format(d);
  const heure = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(d);
  const semaine = new Intl.DateTimeFormat("fr-FR", { weekday: "long", timeZone: TZ }).format(d);
  return { mois, jour, heure, semaine };
}
