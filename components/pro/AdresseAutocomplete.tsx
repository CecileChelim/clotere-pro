"use client";

import { useEffect, useRef, useState } from "react";

export type LieuDetail = {
  nom: string | null; adresse: string; code_postal: string; ville: string;
  telephone: string | null; site: string | null; google_url: string | null; etablissement: boolean;
};
type Suggestion = { id: string; principal: string; secondaire: string };

const jeton = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2));

/** Champ adresse relié à Google Maps : on tape le nom du cabinet ou l'adresse, on choisit, les champs se remplissent. */
export function AdresseAutocomplete({ value, onChange, onSelect, className, required, placeholder }: {
  value: string; onChange: (v: string) => void; onSelect: (l: LieuDetail) => void;
  className?: string; required?: boolean; placeholder?: string;
}) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [actif, setActif] = useState(-1);
  const [chargement, setChargement] = useState(false);
  const session = useRef(jeton());
  const tape = useRef(false);
  const boite = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tape.current || value.trim().length < 3) { setItems([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(value)}&s=${session.current}`, { signal: ctrl.signal });
        const j = await r.json();
        setItems(j.suggestions ?? []); setOpen(true); setActif(-1);
      } catch { /* requête annulée */ }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [value]);

  useEffect(() => {
    const fermer = (e: MouseEvent) => { if (!boite.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  async function choisir(s: Suggestion) {
    setOpen(false); setItems([]); tape.current = false; setChargement(true);
    try {
      const r = await fetch(`/api/places/details?id=${encodeURIComponent(s.id)}&s=${session.current}`);
      const { lieu } = (await r.json()) as { lieu: LieuDetail | null };
      if (lieu) { onChange(lieu.adresse || s.principal); onSelect(lieu); }
      else onChange(s.principal);
    } finally {
      setChargement(false);
      session.current = jeton(); // une session Google = une recherche + un détail
    }
  }

  return (
    <div ref={boite} className="relative">
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true">
          <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" />
        </svg>
        <input
          className={`${className ?? ""} pl-10`} value={value} required={required} autoComplete="off"
          placeholder={placeholder ?? "Nom du cabinet ou adresse"}
          onChange={(e) => { tape.current = true; onChange(e.target.value); }}
          onFocus={() => items.length && setOpen(true)}
          onKeyDown={(e) => {
            if (!open || !items.length) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setActif((a) => Math.min(a + 1, items.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActif((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && actif >= 0) { e.preventDefault(); choisir(items[actif]); }
            else if (e.key === "Escape") setOpen(false);
          }}
        />
        {chargement && <span className="absolute top-1/2 right-3.5 -translate-y-1/2 text-xs text-gray-400">…</span>}
      </div>
      {open && items.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/10">
          {items.map((s, i) => (
            <li key={s.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => choisir(s)}
                className={`flex w-full flex-col px-4 py-2.5 text-left ${i === actif ? "bg-gray-50" : "hover:bg-gray-50"}`}>
                <span className="text-sm font-medium text-gray-950">{s.principal}</span>
                {s.secondaire && <span className="text-xs text-gray-500">{s.secondaire}</span>}
              </button>
            </li>
          ))}
          <li className="px-4 pt-1.5 pb-1 text-right text-[10px] text-gray-400">Avec Google Maps</li>
        </ul>
      )}
    </div>
  );
}
