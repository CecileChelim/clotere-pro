"use client";

import type { MotifDraft } from "@/lib/professions-config";

const DUREES = [15, 20, 30, 45, 60, 90];
const MODES: { id: MotifDraft["modes"][number]; label: string }[] = [
  { id: "visio", label: "Visio" },
  { id: "telephone", label: "Téléphone" },
  { id: "cabinet", label: "Au cabinet" },
];
const input = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-950";

export const NOUVEAU_MOTIF: MotifDraft = {
  libelle: "", description: "", duree_min: 30, modes: ["visio", "telephone"], prix_type: "gratuit", prix_euros: null, actif: true,
};

export function MotifsEditor({ motifs, onChange }: { motifs: MotifDraft[]; onChange: (m: MotifDraft[]) => void }) {
  const maj = (i: number, patch: Partial<MotifDraft>) => onChange(motifs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const deplacer = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= motifs.length) return;
    const copy = [...motifs];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {motifs.map((m, i) => (
        <div key={i} className={`rounded-2xl p-5 ring-1 ring-black/10 ${m.actif ? "bg-white" : "bg-gray-50 opacity-60"}`}>
          <div className="flex gap-2">
            <input className={`${input} font-medium`} value={m.libelle} onChange={(e) => maj(i, { libelle: e.target.value })} placeholder="Libellé du motif" />
            <div className="flex shrink-0 flex-col justify-center text-xs text-gray-400">
              <button type="button" onClick={() => deplacer(i, -1)} className="hover:text-gray-950" aria-label="Monter">▲</button>
              <button type="button" onClick={() => deplacer(i, 1)} className="hover:text-gray-950" aria-label="Descendre">▼</button>
            </div>
            <button type="button" onClick={() => onChange(motifs.filter((_, j) => j !== i))} className="shrink-0 rounded-full px-3 text-gray-400 hover:text-red-600" aria-label="Supprimer">✕</button>
          </div>
          <input className={`${input} mt-2`} value={m.description} onChange={(e) => maj(i, { description: e.target.value })} placeholder="Précision (facultatif) : sous-sujets traités" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm" value={m.duree_min} onChange={(e) => maj(i, { duree_min: Number(e.target.value) })}>
              {DUREES.map((d) => <option key={d} value={d}>{d} min</option>)}
            </select>
            {MODES.map((mo) => {
              const on = m.modes.includes(mo.id);
              return (
                <button key={mo.id} type="button"
                  onClick={() => { const modes = on ? m.modes.filter((x) => x !== mo.id) : [...m.modes, mo.id]; if (modes.length) maj(i, { modes }); }}
                  className={`rounded-full px-3 py-1.5 text-sm ${on ? "bg-gray-950 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}>
                  {mo.label}
                </button>
              );
            })}
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600">Gratuit</span>
            <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={m.actif} onChange={(e) => maj(i, { actif: e.target.checked })} /> Actif
            </label>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...motifs, { ...NOUVEAU_MOTIF }])}
        className="rounded-full px-5 py-3 text-sm font-medium text-gray-950 ring-1 ring-black/15 hover:bg-gray-50">
        + Ajouter un motif
      </button>
    </div>
  );
}
