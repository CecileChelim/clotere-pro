import type { ReactNode } from "react";

/**
 * Aperçus d'interface des blocs « fonctionnalité » des pages produit / solution
 * (composants Figma « Aperçu/… » du kit landing), en couleur de la profession.
 * Purement décoratifs : aria-hidden.
 */

const muted = "text-[#6b6a7b]";
const line = "border border-[#ecebf2]";

/** Carte blanche posée dans le panneau du visuel. */
export function Apercu({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex w-full max-w-[440px] flex-col overflow-hidden rounded-[20px] border border-black/[0.06] bg-white leading-[1.3] text-nuit shadow-[0px_16px_40px_-8px_rgba(20,18,31,0.1)] ${padded ? "gap-[14px] p-5" : ""}`}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "soft" | "grey" | "green" }) {
  const tones = {
    brand: "bg-brand text-white",
    soft: "bg-brand-soft text-brand",
    grey: "bg-[#f1f0f6] text-nuit",
    green: "bg-[#e6f6ec] text-[#1e7a3c]",
  };
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-[10px] py-1 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function Avatar({ initials, size = 32, square = false }: { initials: string; size?: number; square?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-brand-soft font-semibold text-brand ${square ? "rounded-xl text-[16px] font-bold" : "rounded-full text-[11.5px]"}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

function Spacer() {
  return <span className="min-w-0 flex-1" />;
}

/* ── Éditeur de site ───────────────────────────────────────────────────────── */

export function ApercuEditeurSite() {
  const pages = ["Accueil", "Expertises", "Honoraires", "Contact"];
  return (
    <Apercu padded={false}>
      <div className="flex w-full items-center gap-1.5 bg-[#f7f7fa] px-4 py-3">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="size-2 rounded-full" style={{ backgroundColor: c }} />
        ))}
        <span className={`ml-1 truncate rounded-md bg-white px-3 py-1 text-[11px] ${muted}`}>cabinet-martin.fr</span>
        <Spacer />
        <Pill>Publier</Pill>
      </div>
      <div className="flex w-full">
        <div className="flex w-[130px] shrink-0 flex-col gap-1.5 py-4 pl-4 pr-3">
          <p className={`font-geistmono text-[10px] font-semibold ${muted}`}>PAGES</p>
          {pages.map((p, i) => (
            <span key={p} className={`rounded-md px-2 py-1.5 text-[12px] ${i === 0 ? "bg-brand-soft font-semibold text-brand" : "bg-white"}`}>
              {p}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[10px] bg-[#f7f7fa] p-4">
          <div className="flex w-full flex-col items-start gap-2 rounded-xl border border-dashed border-brand bg-brand-soft p-4">
            <p className="font-geistmono text-[9px] font-semibold text-brand">VOTRE CABINET</p>
            <p className="text-[16px] font-bold">Cabinet Martin</p>
            <span className="h-1.5 w-[150px] max-w-full rounded-[3px] bg-nuit/[0.12]" />
            <span className="h-1.5 w-[110px] rounded-[3px] bg-nuit/[0.12]" />
            <Pill>Prendre rendez-vous</Pill>
          </div>
          <div className="flex w-full gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-1 flex-col gap-1.5 rounded-lg bg-white p-[10px]">
                <span className="size-[18px] rounded-[5px] bg-brand-soft" />
                <span className="h-[5px] w-[50px] max-w-full rounded-[3px] bg-nuit/15" />
                <span className="h-[5px] w-[36px] rounded-[3px] bg-nuit/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Apercu>
  );
}

/* ── Module de réservation ─────────────────────────────────────────────────── */

export function ApercuReservation() {
  const days = [
    ["LUN", "16"],
    ["MAR", "17"],
    ["MER", "18"],
    ["JEU", "19"],
    ["VEN", "20"],
  ];
  const slots = ["09:00", "10:30", "14:00", "16:30"];
  return (
    <Apercu>
      <div className="flex flex-col gap-0.5">
        <p className="text-[15px] font-semibold">Prendre rendez-vous</p>
        <p className={`text-[12px] ${muted}`}>Cabinet Martin</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Pill>Première consultation</Pill>
        <Pill tone="grey">Suivi de dossier</Pill>
        <Pill tone="grey">Visio</Pill>
      </div>
      <div className="flex w-full gap-1.5">
        {days.map(([d, n]) => (
          <div key={d} className={`flex flex-1 flex-col items-center gap-0.5 rounded-[10px] py-2 ${d === "MAR" ? "bg-brand text-white" : `${line} bg-white`}`}>
            <span className={`font-geistmono text-[10px] font-medium ${d === "MAR" ? "" : muted}`}>{d}</span>
            <span className="text-[15px] font-semibold">{n}</span>
          </div>
        ))}
      </div>
      <div className="flex w-full gap-1.5 text-[12px]">
        {slots.map((s) => (
          <span key={s} className={`flex flex-1 justify-center rounded-lg py-2 ${s === "14:00" ? "border border-brand bg-brand-soft font-semibold text-brand" : `${line} bg-white`}`}>
            {s}
          </span>
        ))}
      </div>
      <span className="flex w-full justify-center rounded-[10px] bg-brand py-[11px] text-[13px] font-semibold text-white">Confirmer · Mardi 17 à 14:00</span>
    </Apercu>
  );
}

/* ── Fiche Google et avis ──────────────────────────────────────────────────── */

export function ApercuFicheGoogle() {
  return (
    <Apercu>
      <div className="flex items-center gap-3">
        <Avatar initials="CM" size={48} square />
        <div className="flex flex-col gap-[3px]">
          <p className="text-[15px] font-semibold">Cabinet Martin</p>
          <p className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold">4,9</span>
            <span className="text-[13px] text-[#f5b400]">★★★★★</span>
            <span className={`text-[12px] ${muted}`}>(128 avis)</span>
          </p>
          <p className="text-[12px] text-[#1e8e3e]">Ouvert · Ferme à 19:00</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 text-[12px]">
        <span className="rounded-full bg-brand px-[14px] py-2 font-semibold text-white">Prendre rendez-vous</span>
        {["Itinéraire", "Appeler", "Site Web"].map((a) => (
          <span key={a} className={`rounded-full ${line} px-3 py-2 font-medium text-[#1a73e8]`}>
            {a}
          </span>
        ))}
      </div>
      <div className="flex w-full flex-col gap-1.5 rounded-xl bg-[#f7f7fa] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-[26px] items-center justify-center rounded-full bg-white text-[9.4px] font-semibold text-brand">SL</span>
          <span className="text-[12px] font-semibold">Sophie L.</span>
          <span className="text-[11px] text-[#f5b400]">★★★★★</span>
          <span className={`text-[11px] ${muted}`}>il y a 2 jours</span>
        </div>
        <p className="text-[12px]">« Rendez-vous pris en ligne un dimanche soir, rappelée dès le lundi. Très à l’écoute. »</p>
      </div>
    </Apercu>
  );
}

/* ── Demande qualifiée ─────────────────────────────────────────────────────── */

export function ApercuDemandeQualifiee() {
  const rows = [
    ["Motif", "Divorce par consentement mutuel"],
    ["Urgence", "Sous 15 jours"],
    ["Documents", "3 / 4 reçus"],
    ["Créneau souhaité", "Mardi 17 · 14:00"],
  ];
  return (
    <Apercu>
      <div className="flex w-full items-center gap-[10px]">
        <Avatar initials="JM" />
        <div className="flex min-w-0 flex-col gap-px">
          <p className="text-[14px] font-semibold">Nouvelle demande · Divorce</p>
          <p className={`text-[12px] ${muted}`}>Reçue il y a 4 min · via votre site</p>
        </div>
        <Spacer />
        <Pill tone="green">✓ Qualifiée</Pill>
      </div>
      <div className={`flex w-full flex-col rounded-xl ${line} text-[12px]`}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3 py-[9px]">
            <span className={muted}>{k}</span>
            <span className="text-right font-semibold">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex w-full gap-2 text-[13px]">
        <span className="flex flex-1 justify-center rounded-[10px] bg-brand py-[10px] font-semibold text-white">Accepter</span>
        <span className={`flex flex-1 justify-center rounded-[10px] ${line} py-[10px] text-center font-medium`}>Proposer un autre créneau</span>
      </div>
    </Apercu>
  );
}

/* ── Agenda synchronisé ────────────────────────────────────────────────────── */

type Slot = { label: string; time: string; tone: "brand" | "dark" | "soft" | "blocked" } | null;

export function ApercuAgendaSemaine() {
  const week: [string, Slot[]][] = [
    ["L 16", [{ label: "Consultation", time: "9h", tone: "brand" }, null, null, null]],
    ["M 17", [null, { label: "Audience", time: "11h", tone: "dark" }, null, { label: "Visio", time: "16h", tone: "soft" }]],
    ["M 18", [null, null, { label: "Rendez-vous", time: "14h", tone: "brand" }, null]],
    ["J 19", [{ label: "Bloqué", time: "9h", tone: "blocked" }, null, { label: "Consultation", time: "14h", tone: "soft" }, null]],
    ["V 20", [null, { label: "Rendez-vous", time: "11h", tone: "brand" }, null, null]],
  ];
  const tones = {
    brand: "bg-brand text-white",
    dark: "bg-nuit text-white",
    soft: "bg-brand-soft [&>span:first-child]:text-brand [&>span:last-child]:text-[#6b6a7b]",
    blocked: "bg-[#e9e8ef] text-[#6b6a7b]",
  };
  return (
    <Apercu>
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <p className="text-[14px] font-semibold">Semaine du 16 nov.</p>
        <div className="flex gap-1.5">
          <span className="rounded-full bg-[#e8f0fe] px-[10px] py-1 text-[11px] font-semibold text-[#1a73e8]">● Google Agenda</span>
          <span className="rounded-full bg-[#e6f2fb] px-[10px] py-1 text-[11px] font-semibold text-[#0f6cbd]">● Outlook</span>
        </div>
      </div>
      <div className="flex w-full gap-1.5">
        {week.map(([day, slots]) => (
          <div key={day} className="flex min-w-0 flex-1 flex-col gap-1">
            <span className={`font-geistmono text-[10px] font-medium ${muted}`}>{day}</span>
            {slots.map((s, i) =>
              s ? (
                <span key={i} className={`flex h-[42px] flex-col gap-0.5 rounded-md p-1.5 ${tones[s.tone]}`}>
                  <span className="truncate text-[10px] font-semibold">{s.label}</span>
                  <span className="text-[9px]">{s.time}</span>
                </span>
              ) : (
                <span key={i} className={`h-[42px] rounded-md ${line}`} />
              ),
            )}
          </div>
        ))}
      </div>
    </Apercu>
  );
}

/* ── Article publié (référencement) ────────────────────────────────────────── */

export function ApercuArticle() {
  return (
    <Apercu>
      <div className="flex w-full flex-col gap-1.5 rounded-xl bg-nuit p-4">
        <p className="font-geistmono text-[9px] font-semibold text-white">GUIDE PRATIQUE</p>
        <span className="h-1.5 w-[160px] rounded-[3px] bg-white/50" />
        <span className="h-1.5 w-[110px] rounded-[3px] bg-white/30" />
      </div>
      <p className="text-[15px] font-semibold">Divorce : les 5 étapes à connaître en 2026</p>
      <div className="flex items-center gap-2">
        <Pill tone="green">Publié</Pill>
        <span className={`text-[12px] ${muted}`}>6 min de lecture · 12 nov.</span>
      </div>
      <div className="flex w-full flex-col gap-1.5 rounded-xl bg-[#f7f7fa] p-3">
        <div className="flex items-center justify-between">
          <span className={`text-[12px] ${muted}`}>Position Google</span>
          <span className="text-[13px] font-semibold text-brand">#3 ↑</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e9e8ef]">
          <div className="h-1.5 w-[72%] rounded-full bg-brand" />
        </div>
      </div>
    </Apercu>
  );
}

/* ── Rapport de suivi (référencement, Google Ads, IA) ──────────────────────── */

export function ApercuRapport({
  titre,
  tendance = "+38 % vs sept.",
  kpis = [
    ["Visites", "2 410"],
    ["Appels", "42"],
    ["Rendez-vous", "27"],
  ],
}: {
  titre: string;
  tendance?: string;
  kpis?: [string, string][];
}) {
  const bars = [38, 52, 46, 64, 58, 80, 72, 96];
  return (
    <Apercu>
      <div className="flex w-full items-center justify-between gap-2">
        <p className="text-[14px] font-semibold">{titre}</p>
        <Pill tone="green">{tendance}</Pill>
      </div>
      <div className="flex w-full gap-2">
        {kpis.map(([k, v]) => (
          <div key={k} className="flex flex-1 flex-col gap-0.5 rounded-xl bg-[#f7f7fa] p-3">
            <span className={`text-[11px] ${muted}`}>{k}</span>
            <span className="text-[20px] font-semibold">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex w-full items-end gap-[10px] px-1 pt-2">
        {bars.map((h, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className={`w-full max-w-[28px] rounded-md ${i === bars.length - 1 ? "bg-brand" : "bg-brand-soft"}`} style={{ height: h }} />
            <span className={`font-geistmono text-[9px] font-medium ${muted}`}>S{i + 1}</span>
          </div>
        ))}
      </div>
    </Apercu>
  );
}

/* ── Annonce Google (Google Ads) ───────────────────────────────────────────── */

export function ApercuAnnonceGoogle({
  recherche = "avocat divorce paris 11",
  titre = "Avocat en divorce à Paris 11 — Rendez-vous sous 48 h",
  texte = "Première consultation en cabinet ou en visio. Réservez en ligne 24h/24, réponse garantie.",
  statut = "Annonce validée par le cabinet",
  detail = "Budget 15 €/jour · 214 clics ce mois",
}: {
  recherche?: string;
  titre?: string;
  texte?: string;
  statut?: string;
  detail?: string;
}) {
  return (
    <Apercu>
      <div className={`flex w-full items-center gap-2 whitespace-nowrap rounded-full ${line} px-[14px] py-[10px]`}>
        <span className={`text-[14px] ${muted}`}>⌕</span>
        <span className="text-[13px]">{recherche}</span>
      </div>
      <div className="flex w-full flex-col gap-1">
        <p className="flex flex-wrap items-center gap-1.5 whitespace-nowrap">
          <span className="text-[11px] font-semibold">Sponsorisé</span>
          <span className={`text-[11px] ${muted}`}>·</span>
          <span className="text-[12px] font-semibold">Cabinet Martin</span>
          <span className={`text-[11px] ${muted}`}>cabinet-martin.fr</span>
        </p>
        <p className="text-[16px] text-[#1a0dab]">{titre}</p>
        <p className={`text-[12px] ${muted}`}>{texte}</p>
      </div>
      <div className="flex w-full items-center gap-2 rounded-xl bg-[#f7f7fa] p-3">
        <span className="relative h-5 w-[34px] shrink-0 rounded-full bg-brand">
          <span className="absolute right-[3px] top-[3px] size-[14px] rounded-full bg-white" />
        </span>
        <span className="flex flex-col">
          <span className="text-[12px] font-semibold">{statut}</span>
          <span className={`text-[11px] ${muted}`}>{detail}</span>
        </span>
      </div>
    </Apercu>
  );
}

/* ── Réponse d'une IA (GEO) ────────────────────────────────────────────────── */

export function ApercuReponseIA() {
  return (
    <Apercu>
      <div className="flex w-full justify-end">
        <p className="rounded-2xl bg-[#f1f0f6] px-[14px] py-[10px] text-[13px]">Quel avocat en droit de la famille à Lyon ?</p>
      </div>
      <div className="flex w-full gap-[10px]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-nuit text-[13px] text-white">✦</span>
        <div className="flex min-w-0 flex-1 flex-col gap-2 text-[13px]">
          <p>
            Je vous recommande le <span className="font-semibold text-brand">Cabinet Martin</span>, qui intervient en divorce et garde d’enfants, avec 4,9 ★ sur 128 avis et une
            prise de rendez-vous en ligne.
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Pill tone="soft">1&nbsp;&nbsp;cabinet-martin.fr</Pill>
            <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#f1f0f6] px-[10px] py-1 text-[11px] font-semibold text-[#6b6a7b]">2&nbsp;&nbsp;Google Maps</span>
          </div>
        </div>
      </div>
    </Apercu>
  );
}
