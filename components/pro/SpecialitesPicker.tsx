"use client";

import { useState } from "react";
import type { Domaine } from "@/lib/taxonomie";

export function SpecialitesPicker({ taxo, value, onChange }: { taxo: Domaine[]; value: string[]; onChange: (ids: string[]) => void }) {
  const [ouvert, setOuvert] = useState<string | null>(() => taxo.find((d) => d.specialites.some((s) => value.includes(s.id)))?.id ?? null);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  if (!taxo.length) return <p className="text-sm text-red-600">Liste des domaines introuvable : lancez la migration 0008 dans Supabase.</p>;

  return (
    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl ring-1 ring-black/10">
      {taxo.map((d) => {
        const n = d.specialites.filter((s) => value.includes(s.id)).length;
        const open = ouvert === d.id;
        return (
          <div key={d.id}>
            <button type="button" onClick={() => setOuvert(open ? null : d.id)}
              className={`flex w-full items-center justify-between px-5 py-3.5 text-left transition ${open ? "bg-gray-50" : "hover:bg-gray-50"}`}>
              <span className="text-sm font-medium text-gray-950">{d.label}</span>
              <span className="flex items-center gap-3">
                {n > 0 && <span className="rounded-full bg-gray-950 px-2 py-0.5 text-xs font-medium text-white">{n}</span>}
                <span className={`text-gray-400 transition ${open ? "rotate-90" : ""}`}>›</span>
              </span>
            </button>
            {open && (
              <div className="flex flex-wrap gap-2 bg-gray-50 px-5 pb-4">
                {d.specialites.map((s) => {
                  const on = value.includes(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => toggle(s.id)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition ${on ? "bg-gray-950 text-white shadow-md" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-950"}`}>
                      {on ? "✓ " : ""}{s.label}
                    </button>
                  );
                })}
                <button type="button" onClick={() => {
                  const all = d.specialites.map((s) => s.id);
                  const allOn = all.every((x) => value.includes(x));
                  onChange(allOn ? value.filter((x) => !all.includes(x)) : [...new Set([...value, ...all])]);
                }} className="px-2 text-sm text-gray-500 underline hover:text-gray-950">
                  {d.specialites.every((s) => value.includes(s.id)) ? "Tout retirer" : "Tout sélectionner"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
