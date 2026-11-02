"use client";

import { useEffect, useMemo, useState } from "react";
import { PROFESSIONS, type Profession } from "@/lib/professions-config";
import type { Horaires } from "@/lib/horaires";

export type BookingPro = {
  id: string; nomAffiche: string; initiales: string; photo: string | null; bio: string | null;
  cabinet: string | null; adresse: string | null; profession: Profession;
  telephone: string | null; siteWeb: string | null; rating: number | null; reviews: number | null; reviewsUrl: string | null;
  linkedin: string | null; googleFiche: string | null;
  avis: { auteur: string; photo: string | null; note: number; quand: string; texte: string }[];
  expertise: { domaine: string; specialites: string[] }[];
  honoraires: { modes: string[]; paiement: string[]; services: string[] };
};
type Motif = { id: string; libelle: string; description: string | null; duree_min: number; modes: string[] | null };
type Mode = "cabinet" | "visio" | "telephone";

/* ---------- Icônes (traits fins, style Heroicons) ---------- */
const P = {
  visio: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  telephone: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  cabinet: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
  pin: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  globe: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  lock: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  folder: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  chevR: "M8.25 4.5l7.5 7.5-7.5 7.5",
  chevL: "M15.75 19.5L8.25 12l7.5-7.5",
  check: "M4.5 12.75l6 6 9-13.5",
  shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
};
function I({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {d.split(" M").map((seg, i) => <path key={i} d={i ? "M" + seg : seg} />)}
    </svg>
  );
}

const SUIVI: Motif = { id: "suivi", libelle: "Suivi de dossier existant", description: "Vous êtes déjà client du cabinet", duree_min: 30, modes: ["visio", "telephone", "cabinet"] };
const MODE_INFO: Record<Mode, { label: string; sub: (p: string) => string }> = {
  visio: { label: "Visio", sub: () => "Lien envoyé par email" },
  telephone: { label: "Téléphone", sub: (p) => `${p} vous appelle` },
  cabinet: { label: "Au cabinet", sub: () => "Rendez-vous sur place" },
};
const JOURS_COURTS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const JOURS_LONGS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function creneaux(horaires: Horaires, duree: number) {
  const pas = Math.max(duree, 30);
  const jours: { date: Date; slots: string[] }[] = [];
  const d = new Date(); d.setHours(0, 0, 0, 0);
  for (let i = 1; i <= 28; i++) {
    const day = new Date(d); day.setDate(d.getDate() + i);
    const slots: string[] = [];
    for (const p of horaires[day.getDay()] ?? []) {
      for (let m = toMin(p.debut); m + duree <= toMin(p.fin); m += pas) {
        const t = toHHMM(m);
        slots.push(t);
      }
    }
    jours.push({ date: day, slots });
  }
  return jours;
}
const labelJour = (d: Date) => {
  const demain = new Date(); demain.setHours(0, 0, 0, 0); demain.setDate(demain.getDate() + 1);
  return d.getTime() === demain.getTime() ? "demain" : `${JOURS_LONGS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
};


const input = "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15";
const btn = "inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300";

function IconBox({ d, on }: { d: string; on?: boolean }) {
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${on ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"}`}>
      <I d={d} className="h-[18px] w-[18px]" />
    </span>
  );
}
function Radio({ on }: { on: boolean }) {
  return on
    ? <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white"><I d={P.check} className="h-3 w-3" /></span>
    : <span className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300" />;
}
const choice = (on: boolean) =>
  `flex w-full items-center gap-4 rounded-xl border-2 px-3.5 py-3 text-left transition ${on ? "border-violet-600 bg-violet-50/60" : "border-gray-200 bg-white hover:border-gray-300"}`;

export function BookingFlow({ pro, motifs, horaires, indisponible = false }: { pro: BookingPro; motifs: Motif[]; horaires: Horaires; indisponible?: boolean }) {
  const conf = PROFESSIONS[pro.profession];
  const lePro = pro.profession === "avocat" ? "l'avocat" : "le cabinet";
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode | null>(null);
  const [page, setPage] = useState(0);
  const [jourIdx, setJourIdx] = useState<number | null>(null);
  const [heure, setHeure] = useState<string | null>(null);
  const [motif, setMotif] = useState<Motif | null>(null);
  const [deja, setDeja] = useState<"non" | "oui" | "changer" | null>(null);
  const [message, setMessage] = useState("");
  const [c, setC] = useState({ nom: "", prenom: "", email: "", telephone: "" });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [about, setAbout] = useState(false);
  const [plus, setPlus] = useState(false); // mobile : infos du pro repliées
  const [suiviUrl, setSuiviUrl] = useState<string | null>(null);
  const [hp, setHp] = useState("");

  // Modes proposés = union des modes de tous les motifs actifs.
  const modesDispo = useMemo(() => {
    const all = new Set<Mode>();
    motifs.forEach((m) => (m.modes ?? []).forEach((x) => x in MODE_INFO && all.add(x as Mode)));
    const order: Mode[] = ["cabinet", "visio", "telephone"];
    const list = order.filter((x) => all.has(x));
    return list.length ? list : (["visio", "telephone"] as Mode[]);
  }, [motifs]);

  // Créneaux déjà pris (rendez-vous en cours + agenda connecté), chargés au montage.
  const [occupe, setOccupe] = useState<{ debut: string; fin: string }[]>([]);
  useEffect(() => {
    fetch(`/api/agenda/occupe?pro=${pro.id}`).then((r) => r.json()).then((j) => setOccupe(j.occupe ?? [])).catch(() => {});
  }, [pro.id]);
  const jours = useMemo(() => {
    const busy = occupe.map((o) => [new Date(o.debut).getTime(), new Date(o.fin).getTime()]);
    return creneaux(horaires, 30)
      .map((j) => ({
        ...j,
        slots: j.slots.filter((t) => {
          const d = new Date(j.date); d.setHours(Number(t.slice(0, 2)), Number(t.slice(3, 5)), 0, 0);
          const a = d.getTime(), b = a + 30 * 60000;
          return !busy.some(([x, y]) => a < y && x < b);
        }),
      }))
      .filter((j) => j.slots.length);
  }, [horaires, occupe]);
  const pageJours = jours.slice(page * 7, page * 7 + 7);
  const jour = jourIdx !== null ? jours[jourIdx] : null;
  const motifsCompatibles = motifs.filter((m) => !mode || !(m.modes ?? []).length || (m.modes ?? []).includes(mode));
  const suivi = motif?.id === "suivi";
  const duree = motif?.duree_min ?? 30;
  const dateLabel = jour && heure ? `${JOURS_LONGS[jour.date.getDay()]} ${jour.date.getDate()} ${MOIS[jour.date.getMonth()]} à ${heure.replace(":", "h")}` : "";
  const STEPS = ["Créneau", "Motif", suivi ? "Message" : "Votre situation", "Coordonnées"];

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!jour || !heure || !mode || !motif) return;
    setSending(true); setError("");
    const [h, m] = heure.split(":").map(Number);
    const debut = new Date(jour.date); debut.setHours(h, m, 0, 0);
    const fin = new Date(debut.getTime() + duree * 60000);
    const source = new URLSearchParams(window.location.search).get("source") || "direct";
    const res = await fetch("/api/rdv", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professional_id: pro.id, motif_id: suivi ? null : motif.id, mode,
        client_nom: c.nom, client_prenom: c.prenom, client_email: c.email, client_tel: c.telephone,
        message: message || (suivi ? "Suivi de dossier existant" : null), suivi_existant: suivi, deja_avocat: suivi ? null : deja,
        creneau_debut: debut.toISOString(), creneau_fin: fin.toISOString(), source, hp: hp || undefined,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok || !json.ok) { setError(json.error || "L'envoi a échoué, merci de réessayer."); return; }
    setSuiviUrl(json.suivi ?? null);
    setStep(4);
  }

  const cabinetNom = pro.cabinet || pro.nomAffiche;
  const cabinetInit = cabinetNom.split(/\s+/).filter((w) => /^[A-Za-zÀ-ÿ]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="h-1 bg-violet-600" />
      {/* Barre du cabinet */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">{cabinetInit}</span>
            <span className="text-[15px] font-semibold text-gray-900">{cabinetNom}</span>
          </div>
          <p className="hidden items-center gap-1.5 text-[13px] text-gray-500 sm:flex">
            <I d={P.lock} className="h-4 w-4" />Prise de rendez-vous en ligne sécurisée
            <button type="button" onClick={() => setAbout(true)} className="font-semibold text-violet-600 hover:underline">{pro.profession === "avocat" ? "Clotere" : "Clotere"}</button>
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1080px] flex-1 px-3 py-4 sm:px-6 sm:py-10">
        <h1 className="px-1 text-xl font-bold tracking-tight text-gray-900 sm:px-0 sm:text-[28px]">Prendre rendez-vous</h1>
        <p className="mt-2 hidden text-[15px] text-gray-500 sm:block">Réservez un créneau en quelques minutes. Votre demande est confirmée par {lePro} sous 24 h ouvrées.</p>

        <div className="mt-3 grid grid-cols-1 overflow-hidden sm:mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm md:grid-cols-[300px_1fr]">
          {/* ---------- Colonne pro ---------- */}
          <aside className="flex flex-col border-b border-gray-200 p-4 sm:p-6 md:border-r md:border-b-0">
            <div className="flex items-center gap-3 md:block">
              {pro.photo
                ? <img src={pro.photo} alt={pro.nomAffiche} className="h-12 w-12 shrink-0 rounded-xl object-cover md:h-14 md:w-14" />
                : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-base font-bold text-violet-700 md:h-14 md:w-14">{pro.initiales}</div>}
              <div className="min-w-0">
                <h2 className="text-[17px] font-semibold text-gray-900 md:mt-4">{pro.nomAffiche}</h2>
                <p className="mt-0.5 truncate text-sm text-gray-500 md:whitespace-normal">{conf.label.charAt(0).toUpperCase() + conf.label.slice(1)}{pro.cabinet ? ` · ${pro.cabinet}` : ""}</p>
              </div>
            </div>
            {pro.rating && (
              <a href={pro.reviewsUrl || `https://www.google.com/search?q=${encodeURIComponent(`${cabinetNom} ${pro.adresse ?? ""} avis`)}`}
                target="_blank" rel="noopener noreferrer"
                className="group mt-3 inline-flex items-center gap-2 self-start rounded-xl bg-white px-3 py-2 ring-1 ring-gray-200 transition hover:ring-gray-300">
                <span className="flex" aria-label={`Note Google ${pro.rating.toFixed(1).replace(".", ",")} sur 5`}>
                  {[0, 1, 2, 3, 4].map((i) => {
                    const rempli = Math.min(1, Math.max(0, pro.rating! - i));
                    return (
                      <span key={i} className="relative h-4 w-4">
                        <svg viewBox="0 0 20 20" className="absolute inset-0 h-4 w-4 text-gray-200" fill="currentColor" aria-hidden><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" /></svg>
                        <span className="absolute inset-0 overflow-hidden" style={{ width: `${rempli * 100}%` }}>
                          <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber-400" fill="currentColor" aria-hidden><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" /></svg>
                        </span>
                      </span>
                    );
                  })}
                </span>
                <span className="text-sm font-bold text-gray-900">{pro.rating.toFixed(1).replace(".", ",")}</span>
                <span className="text-sm font-semibold text-violet-600 group-hover:underline">{pro.reviews ? `${pro.reviews} avis Google` : "Avis Google"} ›</span>
              </a>
            )}

            <button type="button" onClick={() => setPlus(!plus)} aria-expanded={plus}
              className="mt-3 flex items-center gap-1 self-start text-[13px] font-semibold text-violet-600 md:hidden">
              {plus ? "Voir moins" : "Voir plus : adresse, expertise, avis"}
              <I d={P.chevR} className={`h-3.5 w-3.5 transition ${plus ? "-rotate-90" : "rotate-90"}`} />
            </button>

            <div className={`${plus ? "flex" : "hidden"} flex-col md:contents`}>
            <ul className="mt-5 space-y-3 text-sm">
              {pro.adresse && <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><I d={P.pin} className="h-4 w-4" /></span><span className="pt-0.5 text-gray-700">{pro.adresse}</span></li>}
              {pro.telephone && <li className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><I d={P.telephone} className="h-4 w-4" /></span><a href={`tel:${pro.telephone.replace(/\s/g, "")}`} className="text-gray-700 hover:text-gray-900">{pro.telephone}</a></li>}
              {pro.siteWeb && <li className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600"><I d={P.globe} className="h-4 w-4" /></span><a href={pro.siteWeb} target="_blank" rel="noopener noreferrer" className="truncate text-violet-600 hover:underline">{pro.siteWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a></li>}
            </ul>

            {(pro.linkedin || pro.googleFiche) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {pro.linkedin && (
                  <a href={pro.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">
                    <svg viewBox="0 0 24 24" fill="#0A66C2" className="h-3.5 w-3.5"><path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4z" /></svg>
                    LinkedIn
                  </a>
                )}
                {pro.googleFiche && (
                  <a href={pro.googleFiche} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.4h5.9a5 5 0 01-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 010-4.2V7.1H2.1a11 11 0 000 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 002.1 7.1l3.6 2.8C6.6 7.4 9.1 5.4 12 5.4z"/></svg>
                    Fiche Google
                  </a>
                )}
              </div>
            )}

            {pro.avis.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Avis Google</p>
                  {pro.rating && (
                    <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <svg viewBox="0 0 20 20" className="h-4 w-4 text-amber-400" fill="currentColor" aria-hidden><path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" /></svg>
                      {pro.rating.toFixed(1).replace(".", ",")}<span className="font-normal text-gray-500">({pro.reviews})</span>
                    </span>
                  )}
                </div>
                <ul className="mt-3 space-y-3">
                  {pro.avis.map((a, i) => (
                    <li key={i} className="rounded-xl bg-gray-50 p-3.5">
                      <div className="flex items-center gap-2.5">
                        {a.photo
                          ? <img src={a.photo} alt="" referrerPolicy="no-referrer" className="h-7 w-7 rounded-full object-cover" />
                          : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{a.auteur[0]}</span>}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-gray-900">{a.auteur}</p>
                          <p className="text-[11px] text-gray-500"><span className="text-amber-400">{"★".repeat(Math.round(a.note))}</span><span className="text-gray-200">{"★".repeat(5 - Math.round(a.note))}</span> · {a.quand}</p>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-gray-700">{a.texte}</p>
                    </li>
                  ))}
                </ul>
                {pro.reviewsUrl && (
                  <a href={pro.reviewsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[13px] font-semibold text-violet-600 hover:underline">
                    Voir tous les avis sur Google ›
                  </a>
                )}
              </div>
            )}

            {pro.expertise.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Domaines d&apos;expertise</p>
                <ul className="mt-3 space-y-3">
                  {pro.expertise.map((e) => (
                    <li key={e.domaine}>
                      <p className="text-sm font-semibold text-gray-900">{e.domaine}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {e.specialites.map((x) => <span key={x} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">{x}</span>)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(pro.honoraires.modes.length > 0 || pro.honoraires.paiement.length > 0 || pro.honoraires.services.length > 0) && (
              <div className="mt-6 border-t border-gray-100 pt-5 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Honoraires</p>
                {pro.honoraires.modes.length > 0 && (
                  <>
                    <p className="mt-2 text-[13px] text-gray-500">Honoraires indicatifs. Une convention d&apos;honoraires détaillée sera établie selon votre dossier.</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">{pro.honoraires.modes.map((x) => <span key={x} className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-700">{x}</span>)}</div>
                  </>
                )}
                {pro.honoraires.paiement.length > 0 && (
                  <p className="mt-3 text-[13px] text-gray-600"><span className="font-medium text-gray-900">Paiement :</span> {pro.honoraires.paiement.join(", ")}</p>
                )}
                {pro.honoraires.services.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {pro.honoraires.services.map((x) => (
                      <li key={x} className="flex gap-2 text-[13px] text-gray-700"><I d={P.check} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />{x}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="hidden min-h-6 flex-1 md:block" />
            <div className="mt-6 flex gap-3 rounded-xl bg-gray-50 p-3.5 text-[13px] md:mt-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 ring-1 ring-gray-200"><I d={P.shield} className="h-4 w-4" /></span>
              <div>
                <p className="font-semibold text-gray-900">Vos données sont protégées</p>
                <p className="mt-1 text-gray-500">Chiffrées et transmises uniquement {pro.profession === "avocat" ? "à votre avocat" : "au cabinet"}. Jamais revendues.</p>
                <button type="button" onClick={() => setAbout(true)} className="mt-2 inline-block font-semibold text-violet-600 hover:underline">En savoir plus sur {conf.brand} ›</button>
              </div>
            </div>
            </div>
          </aside>

          {/* ---------- Module ---------- */}
          <section className="p-5 sm:p-7">
            {step < 4 && (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {STEPS.map((_, i) => <div key={i} className={`h-1 rounded-full ${i <= step ? "bg-violet-600" : "bg-gray-200"}`} />)}
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                  {step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="flex items-center gap-1 font-medium text-violet-600 hover:text-violet-700"><I d={P.chevL} className="h-4 w-4" />Retour</button>}
                  <span>Étape {step + 1} sur 4 · {STEPS[step]}</span>
                </div>
              </>
            )}

            {indisponible && (
              <div className="py-10 text-center">
                <h3 className="text-xl font-bold text-gray-900">Prise de rendez-vous en ligne indisponible</h3>
                <p className="mx-auto mt-2 max-w-sm text-gray-500">
                  La réservation en ligne est momentanément suspendue. {pro.telephone ? <>Contactez le cabinet au <a href={`tel:${pro.telephone.replace(/\s/g, "")}`} className="font-semibold text-violet-600">{pro.telephone}</a>.</> : "Merci de contacter directement le cabinet."}
                </p>
              </div>
            )}

            {/* 1. Créneau */}
            {!indisponible && step === 0 && (
              <div>
                <h3 className="mt-5 text-center text-xl font-bold text-gray-900">Choisissez votre rendez-vous</h3>
                <p className="mt-6 text-sm font-semibold text-gray-900">Comment souhaitez-vous échanger ?</p>
                <div className={`mt-3 grid grid-cols-1 gap-3 ${modesDispo.length >= 3 ? "md:grid-cols-3" : modesDispo.length === 2 ? "sm:grid-cols-2" : ""}`}>
                  {modesDispo.map((m) => (
                    <button key={m} type="button" onClick={() => setMode(m)} className={choice(mode === m)}>
                      <IconBox d={P[m]} on={mode === m} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-gray-900">{m === "telephone" ? "Par téléphone" : m === "visio" ? "En visio" : "Au cabinet"}</span>
                        <span className="block text-[13px] text-gray-500">{m === "telephone" ? `${lePro.charAt(0).toUpperCase() + lePro.slice(1)} vous appelle à l'heure choisie` : m === "visio" ? "Lien de visio envoyé par email" : "Rendez-vous sur place, au cabinet"}</span>
                      </span>
                      <Radio on={mode === m} />
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Choisissez une date</p>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="text-gray-400 hover:text-gray-900 disabled:opacity-30" aria-label="Précédent"><I d={P.chevL} className="h-5 w-5" /></button>
                    <span className="min-w-[7rem] text-center text-sm font-semibold capitalize text-gray-900">{pageJours[0] && `${MOIS[pageJours[0].date.getMonth()]} ${pageJours[0].date.getFullYear()}`}</span>
                    <button type="button" disabled={(page + 1) * 7 >= jours.length} onClick={() => setPage(page + 1)} className="text-gray-400 hover:text-gray-900 disabled:opacity-30" aria-label="Suivant"><I d={P.chevR} className="h-5 w-5" /></button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {pageJours.map((j, k) => {
                    const idx = page * 7 + k;
                    const on = jourIdx === idx;
                    return (
                      <button key={idx} type="button" onClick={() => { setJourIdx(idx); setHeure(null); }}
                        className={`rounded-lg border py-1.5 text-center transition ${on ? "border-violet-600 bg-violet-600 text-white shadow-sm" : "border-gray-200 bg-white text-gray-900 hover:border-violet-300"}`}>
                        <span className={`block text-xs ${on ? "text-white/80" : "text-gray-500"}`}>{JOURS_COURTS[j.date.getDay()]}</span>
                        <span className="block text-base font-bold">{j.date.getDate()}</span>
                      </button>
                    );
                  })}
                </div>

                {jour && (
                  <div className="mt-5 space-y-2.5">
                    {[["Matin", jour.slots.filter((x) => x < "12:00")], ["Après-midi", jour.slots.filter((x) => x >= "12:00")]].map(([lbl, slots]) =>
                      (slots as string[]).length ? (
                        <div key={lbl as string} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                          <span className="w-20 shrink-0 pt-1.5 text-sm text-gray-500">{lbl as string}</span>
                          <div className="flex flex-wrap gap-2">
                            {(slots as string[]).map((t) => (
                              <button key={t} type="button" onClick={() => setHeure(t)}
                                className={`w-[4.25rem] rounded-lg py-1.5 text-sm font-semibold transition ${heure === t ? "bg-violet-600 text-white shadow-sm" : "bg-violet-50 text-violet-700 hover:bg-violet-100"}`}>{t}</button>
                            ))}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 rounded-xl bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 first-letter:uppercase">{dateLabel || "Choisissez un créneau"}</p>
                    <p className="text-sm text-gray-500">{mode ? (mode === "telephone" ? "Par téléphone" : mode === "visio" ? "En visio" : "Au cabinet") : "Choisissez un format"}</p>
                  </div>
                  <button type="button" disabled={!mode || !heure} onClick={() => setStep(1)} className={btn}>Continuer <I d={P.chevR} className="h-4 w-4" /></button>
                </div>
              </div>
            )}

            {/* 2. Motif */}
            {step === 1 && (
              <div>
                <h3 className="mt-5 text-center text-xl font-bold text-gray-900">Pourquoi souhaitez-vous prendre rendez-vous ?</h3>
                <div className="mt-6 space-y-2.5">
                  <button type="button" onClick={() => { setMotif(SUIVI); setStep(2); }} className={choice(suivi)}>
                    <IconBox d={P.folder} on={suivi} />
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-gray-900">{SUIVI.libelle}</span><span className="block text-[13px] text-gray-500">{SUIVI.description}</span></span>
                    <I d={P.chevR} className="h-5 w-5 text-gray-300" />
                  </button>
                  <div className="flex items-center gap-3 py-1 text-sm text-gray-400"><div className="h-px flex-1 bg-gray-200" />ou<div className="h-px flex-1 bg-gray-200" /></div>
                  {motifsCompatibles.length === 0 && <p className="text-gray-500">Aucun motif disponible pour ce format.</p>}
                  {motifsCompatibles.map((m) => {
                    const on = motif?.id === m.id;
                    return (
                      <button key={m.id} type="button" onClick={() => { setMotif(m); setStep(2); }} className={choice(on)}>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-gray-900">{m.libelle}</span>
                          {m.description && <span className="block text-[13px] text-gray-500">{m.description}</span>}
                        </span>
                        <span className="shrink-0 text-sm text-gray-400">{m.duree_min} min</span>
                        <I d={P.chevR} className="h-5 w-5 text-gray-300" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Situation */}
            {step === 2 && (
              <div>
                <h3 className="mt-5 text-center text-xl font-bold text-gray-900">{suivi ? "Un message pour votre dossier ?" : "Où en êtes-vous ?"}</h3>
                {!suivi && (
                  <>
                    <p className="mt-6 text-sm font-semibold text-gray-900">Avez-vous déjà un {conf.label} pour ce dossier ?</p>
                    <div className="mt-3 space-y-2.5">
                      {([["non", "Non, pas encore"], ["oui", "Oui"], ["changer", "Oui, mais je veux en changer"]] as const).map(([v, l]) => (
                        <button key={v} type="button" onClick={() => setDeja(v)} className={choice(deja === v)}>
                          <Radio on={deja === v} /><span className="text-sm font-medium text-gray-900">{l}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <p className="mt-6 text-sm font-semibold text-gray-900">{suivi ? "Votre message (facultatif)" : "Précisez votre question ou besoin"}</p>
                <textarea rows={5} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} className={`${input} mt-3 resize-none`}
                  placeholder={suivi ? "Référence ou objet de votre dossier…" : "Décrivez brièvement votre situation…"} />
                <p className="mt-1.5 text-right text-xs text-gray-400">{message.length} / 500</p>
                <div className="mt-6 flex justify-end">
                  <button type="button" disabled={!suivi && (!deja || message.trim().length < 10)} onClick={() => setStep(3)} className={btn}>Continuer <I d={P.chevR} className="h-4 w-4" /></button>
                </div>
              </div>
            )}

            {/* 4. Coordonnées */}
            {step === 3 && (
              <form onSubmit={envoyer}>
                <h3 className="mt-5 text-center text-xl font-bold text-gray-900">Vos coordonnées</h3>
                <div className="mt-6 flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 first-letter:uppercase">{dateLabel}</p>
                    <p className="text-sm text-gray-500">{mode === "telephone" ? "Par téléphone" : mode === "visio" ? "En visio" : "Au cabinet"} · {motif?.libelle}</p>
                  </div>
                  <button type="button" onClick={() => setStep(0)} className="text-sm font-semibold text-violet-600 hover:underline">Modifier</button>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input required placeholder="Nom" className={input} value={c.nom} onChange={(e) => setC({ ...c, nom: e.target.value })} />
                  <input required placeholder="Prénom" className={input} value={c.prenom} onChange={(e) => setC({ ...c, prenom: e.target.value })} />
                  <input required type="email" placeholder="Email" className={`${input} sm:col-span-2`} value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
                  <input required type="tel" inputMode="tel" autoComplete="tel" placeholder="Téléphone (obligatoire)" pattern="^\+?[0-9\s.\-]{10,20}$" title="Indiquez un numéro de téléphone valide, par exemple 06 12 34 56 78" className={`${input} sm:col-span-2`} value={c.telephone} onChange={(e) => setC({ ...c, telephone: e.target.value })} />
                </div>
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" name="site_web_hp" />
                <label className="mt-5 flex items-start gap-3 text-sm text-gray-500">
                  <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-violet-600" />
                  J&apos;accepte que mes informations soient transmises à {pro.nomAffiche} pour traiter ma demande.
                </label>
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                <button disabled={sending} className={`${btn} mt-6 w-full`}><I d={P.check} className="h-4 w-4" />{sending ? "Envoi…" : "Confirmer le rendez-vous"}</button>
              </form>
            )}

            {/* 5. Confirmation */}
            {step === 4 && (
              <div className="mx-auto max-w-md py-6 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />En attente de confirmation</span>
                <h3 className="mt-4 text-2xl font-bold text-gray-900">Votre demande a bien été envoyée</h3>
                <p className="mt-3 text-gray-500">Le rendez-vous n&apos;est pas encore confirmé : {pro.nomAffiche} doit valider votre demande. Vous recevrez un email dès sa confirmation (pensez à vérifier vos spams).</p>
                {suiviUrl && (
                  <a href={suiviUrl} className="mt-6 inline-flex items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Suivre mon rendez-vous</a>
                )}
                <div className="mt-8 rounded-2xl border border-gray-200 p-5 text-left">
                  <p className="text-sm font-semibold text-gray-900 first-letter:uppercase">{dateLabel}</p>
                  <p className="text-sm text-gray-500">{mode === "telephone" ? "Par téléphone" : mode === "visio" ? "En visio" : "Au cabinet"} · {motif?.libelle}</p>
                  <ol className="mt-5 space-y-3 text-sm">
                    <li className="flex items-center gap-3 text-gray-900"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"><I d={P.check} className="h-3 w-3" /></span>Demande envoyée</li>
                    <li className="flex items-center gap-3 font-medium text-amber-700"><span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-500"><span className="h-2 w-2 rounded-full bg-amber-500" /></span>Validation par {lePro}<span className="text-xs font-normal">en cours</span></li>
                    <li className="flex items-center gap-3 text-gray-400"><span className="h-5 w-5 rounded-full border-2 border-gray-200" />Rendez-vous confirmé</li>
                  </ol>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[1080px] flex-col justify-between gap-2 px-6 pb-8 text-[13px] text-gray-400 sm:flex-row">
        <span>Prise de rendez-vous propulsée par {conf.brand}</span>
        <span><a href="https://notaire.clotere.fr/mentions-legales" className="hover:text-gray-600">Mentions légales</a> · <a href="https://notaire.clotere.fr/politique-confidentialite" className="hover:text-gray-600">Confidentialité</a></span>
      </footer>
      {/* Drawer « À propos » */}
      <div className={`fixed inset-0 z-50 ${about ? "" : "pointer-events-none"}`} aria-hidden={!about}>
        <div onClick={() => setAbout(false)} className={`absolute inset-0 bg-gray-900/40 transition-opacity ${about ? "opacity-100" : "opacity-0"}`} />
        <aside role="dialog" aria-modal="true" aria-label={`À propos de ${pro.profession === "avocat" ? "Clotere" : "Clotere"}`}
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${about ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white"><I d={P.check} className="h-4 w-4" /></span>
              <p className="text-lg font-semibold text-gray-900">À propos de {pro.profession === "avocat" ? "Clotere" : "Clotere"}</p>
            </div>
            <button type="button" onClick={() => setAbout(false)} className="rounded-lg p-2 text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50" aria-label="Fermer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <p className="text-[15px] leading-relaxed text-gray-600">
              {pro.profession === "avocat" ? "Votre avocat" : "Votre cabinet"} utilise {pro.profession === "avocat" ? "Clotere" : "Clotere"} pour vous permettre de prendre rendez-vous en ligne, à toute heure et sans appel téléphonique.
            </p>
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-violet-600 ring-1 ring-gray-200"><I d={P.shield} className="h-4 w-4" /></span>
                <p className="font-semibold text-gray-900">Vos données sont protégées</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Conforme au RGPD. Vos coordonnées sont transmises uniquement {pro.profession === "avocat" ? "à votre avocat" : "à votre cabinet"}, jamais revendues, et tous les échanges sont chiffrés (HTTPS).
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-violet-600">24h/24</p><p className="text-sm text-gray-500">réservation en ligne</p></div>
              <div className="rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-violet-600">Gratuit</p><p className="text-sm text-gray-500">pour les clients</p></div>
            </div>
            <ul className="mt-6 space-y-5">
              {[
                ["FR", "Une société française", "Basée à Paris, Clotere travaille exclusivement avec des professionnels du droit et du chiffre réglementés."],
                ["?", "Comment ça fonctionne ?", `Vous envoyez une demande, ${lePro} la confirme par email.`],
              ].map(([ic, t, d]) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs font-bold text-violet-700">{ic}</span>
                  <div><p className="font-semibold text-gray-900">{t}</p><p className="mt-0.5 text-sm leading-relaxed text-gray-500">{d}</p></div>
                </li>
              ))}
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs font-bold text-violet-700">@</span>
                <div><p className="font-semibold text-gray-900">Une question ?</p><p className="mt-0.5 text-sm text-gray-500">Notre équipe vous répond par email :</p>
                  <a href="mailto:contact@clotere.fr" className="mt-1 inline-block text-sm font-semibold text-violet-600 hover:underline">contact@clotere.fr</a></div>
              </li>
            </ul>
          </div>
          <div className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
            <a href={pro.profession === "avocat" ? "https://avocat.clotere.fr" : "https://comptable.clotere.fr"} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">{pro.profession === "avocat" ? "avocat.clotere.fr" : "comptable.clotere.fr"}</a>
            {" · "}<a href="https://notaire.clotere.fr/mentions-legales" className="hover:text-gray-900">Mentions légales</a>
            {" · "}<a href="https://notaire.clotere.fr/politique-confidentialite" className="hover:text-gray-900">Confidentialité</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
