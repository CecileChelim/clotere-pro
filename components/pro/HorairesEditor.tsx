"use client";

import { JOURS, type Horaires } from "@/lib/horaires";

const time = "rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-gray-950";

export function HorairesEditor({ value, onChange }: { value: Horaires; onChange: (h: Horaires) => void }) {
  const set = (jour: number, plages: Horaires[number]) => onChange({ ...value, [jour]: plages });

  return (
    <div className="divide-y divide-gray-100 rounded-2xl ring-1 ring-black/10">
      {JOURS.map(({ id, label }) => {
        const plages = value[id] ?? [];
        const ouvert = plages.length > 0;
        return (
          <div key={id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <label className="flex w-32 items-center gap-2 text-sm font-medium text-gray-950">
              <input type="checkbox" checked={ouvert} onChange={(e) => set(id, e.target.checked ? [{ debut: "09:00", fin: "18:00" }] : [])} />
              {label}
            </label>
            {!ouvert && <span className="text-sm text-gray-400">Fermé</span>}
            {plages.map((p, i) => (
              <span key={i} className="flex items-center gap-1.5 text-sm text-gray-600">
                <input type="time" className={time} value={p.debut} onChange={(e) => set(id, plages.map((x, j) => (j === i ? { ...x, debut: e.target.value } : x)))} />
                –
                <input type="time" className={time} value={p.fin} onChange={(e) => set(id, plages.map((x, j) => (j === i ? { ...x, fin: e.target.value } : x)))} />
                {plages.length > 1 && (
                  <button type="button" onClick={() => set(id, plages.filter((_, j) => j !== i))} className="px-1 text-gray-400 hover:text-red-600" aria-label="Retirer la plage">✕</button>
                )}
              </span>
            ))}
            {ouvert && plages.length < 2 && (
              <button type="button" onClick={() => set(id, [...plages, { debut: "14:00", fin: "18:00" }])} className="text-sm text-gray-500 underline hover:text-gray-950">
                + plage
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
