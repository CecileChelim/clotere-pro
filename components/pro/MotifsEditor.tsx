"use client";

import type { MotifDraft } from "@/lib/professions-config";
import { aUnQuestionnaire, MAX_QUESTIONS, QUESTIONNAIRES } from "@/lib/rdv/questionnaires";
import { descriptionSujets, type Domaine } from "@/lib/taxonomie";

const DUREES = [15, 20, 30, 45, 60, 90];
const MODES: { id: MotifDraft["modes"][number]; label: string }[] = [
  { id: "visio", label: "Visio" },
  { id: "telephone", label: "Téléphone" },
  { id: "cabinet", label: "Au cabinet" },
];
const lbl = "mb-1.5 text-xs font-medium text-gray-500";
const champ = "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-950 outline-none focus:border-gray-950";

export const NOUVEAU_MOTIF: MotifDraft = {
  libelle: "", description: "", duree_min: 30, modes: ["visio", "telephone"], prix_type: "gratuit", prix_euros: null, actif: true,
};

/**
 * domaines : taxonomie complète (avec les sous-domaines) ; specsPro : spécialités cochées par le pro.
 * Le select ne propose que les domaines du pro (plus celui déjà choisi), et les sujets cochés sous le motif
 * sont proposés au client à la prise de rendez-vous (« Votre demande concerne… »).
 */
export function MotifsEditor({ motifs, domaines, specsPro = [], onChange }: {
  motifs: MotifDraft[]; domaines: Domaine[]; specsPro?: string[]; onChange: (m: MotifDraft[]) => void;
}) {
  const maj = (i: number, patch: Partial<MotifDraft>) => onChange(motifs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const motivables = domaines.filter((d) => !d.profilSeulement);
  const duPro = motivables.filter((d) => d.specialites.some((s) => specsPro.includes(s.id)));
  const proposes = (courant: string | null | undefined) => {
    const base = duPro.length ? duPro : motivables;
    const extra = courant && !base.some((d) => d.id === courant) ? domaines.filter((d) => d.id === courant) : [];
    return [...base, ...extra];
  };
  /** Changement de domaine : sujets = ceux du pro dans ce domaine (à défaut, tous), description régénérée. */
  const choisirDomaine = (i: number, domaineId: string | null) => {
    const d = domaines.find((x) => x.id === domaineId);
    if (!d) return maj(i, { domaine_id: null, specialite_ids: [] });
    const duProIci = d.specialites.filter((s) => specsPro.includes(s.id));
    const sujets = duProIci.length ? duProIci : d.specialites;
    maj(i, { domaine_id: d.id, specialite_ids: sujets.map((s) => s.id), description: descriptionSujets(sujets) });
  };
  const toggleSujet = (i: number, d: Domaine, id: string) => {
    const cur = motifs[i].specialite_ids ?? [];
    const ids = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    maj(i, { specialite_ids: ids, description: descriptionSujets(d.specialites.filter((s) => ids.includes(s.id))) });
  };
  const deplacer = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= motifs.length) return;
    const copy = [...motifs];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {motifs.map((m, i) => {
        const d = domaines.find((x) => x.id === m.domaine_id);
        const ids = m.specialite_ids ?? [];
        return (
          <div key={i} className={`overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 transition ${m.actif ? "" : "opacity-60"}`}>
            {/* En-tête : libellé, description, actions */}
            <div className="flex items-start gap-3 p-5 pb-4">
              <div className="flex shrink-0 flex-col pt-1 text-[10px] leading-3 text-gray-300">
                <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0} className="hover:text-gray-950 disabled:opacity-30" aria-label="Monter">▲</button>
                <button type="button" onClick={() => deplacer(i, 1)} disabled={i === motifs.length - 1} className="hover:text-gray-950 disabled:opacity-30" aria-label="Descendre">▼</button>
              </div>
              <div className="min-w-0 flex-1">
                <input className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 -mx-2 text-base font-semibold text-gray-950 outline-none hover:border-gray-200 focus:border-gray-950"
                  value={m.libelle} onChange={(e) => maj(i, { libelle: e.target.value })} placeholder="Libellé du motif" />
                {d ? (
                  <p className="mt-0.5 text-sm text-gray-500">{m.description || <span className="italic text-gray-400">Cochez les sujets ci-dessous</span>}</p>
                ) : (
                  <input className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 -mx-2 text-sm text-gray-500 outline-none hover:border-gray-200 focus:border-gray-950"
                    value={m.description} onChange={(e) => maj(i, { description: e.target.value })} placeholder="Ajouter une précision affichée sous le motif (facultatif)" />
                )}
              </div>
              <label className="flex shrink-0 cursor-pointer items-center gap-2 pt-1.5 text-sm text-gray-600">
                <span className="hidden sm:inline">{m.actif ? "Actif" : "Inactif"}</span>
                <input type="checkbox" className="peer sr-only" checked={m.actif} onChange={(e) => maj(i, { actif: e.target.checked })} />
                <span className="relative h-5 w-9 rounded-full bg-gray-300 transition peer-checked:bg-gray-950 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
              </label>
              <button type="button" onClick={() => onChange(motifs.filter((_, j) => j !== i))} className="shrink-0 rounded-full p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer le motif">✕</button>
            </div>

            {/* Réglages */}
            <div className="grid gap-4 border-t border-gray-100 px-5 py-4 sm:grid-cols-[minmax(0,1.4fr)_auto_auto_auto] sm:items-end">
              <div className="min-w-0">
                <p className={lbl}>Domaine</p>
                <select className={champ} value={m.domaine_id ?? ""} onChange={(e) => choisirDomaine(i, e.target.value || null)} aria-label="Domaine du motif">
                  <option value="">Aucun (motif général)</option>
                  {proposes(m.domaine_id).map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                </select>
              </div>
              <div>
                <p className={lbl}>Durée</p>
                <select className={`${champ} sm:w-28`} value={m.duree_min} onChange={(e) => maj(i, { duree_min: Number(e.target.value) })} aria-label="Durée">
                  {DUREES.map((x) => <option key={x} value={x}>{x} min</option>)}
                </select>
              </div>
              <div>
                <p className={lbl}>Format</p>
                <div className="inline-flex h-10 rounded-lg bg-gray-100 p-1">
                  {MODES.map((mo) => {
                    const on = m.modes.includes(mo.id);
                    return (
                      <button key={mo.id} type="button" aria-pressed={on}
                        onClick={() => { const modes = on ? m.modes.filter((x) => x !== mo.id) : [...m.modes, mo.id]; if (modes.length) maj(i, { modes }); }}
                        className={`rounded-md px-3 text-sm transition ${on ? "bg-white font-medium text-gray-950 shadow-sm" : "text-gray-500 hover:text-gray-950"}`}>
                        {mo.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className={lbl}>Tarif</p>
                <p className="flex h-10 items-center text-sm text-gray-700">Gratuit</p>
              </div>
            </div>

            {/* Sujets proposés au client (motif rattaché à un domaine) */}
            {d && (
              <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-gray-950">Sujets proposés au client <span className="font-normal text-gray-400">({ids.length}/{d.specialites.length})</span></p>
                  <button type="button" className="text-xs text-gray-500 underline hover:text-gray-950"
                    onClick={() => { const all = ids.length === d.specialites.length ? [] : d.specialites.map((x) => x.id); maj(i, { specialite_ids: all, description: descriptionSujets(d.specialites.filter((x) => all.includes(x.id))) }); }}>
                    {ids.length === d.specialites.length ? "Tout décocher" : "Tout cocher"}
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">Après avoir choisi ce motif, le client précise son sujet parmi ceux cochés (ou « Autre »).</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.specialites.map((sp) => {
                    const on = ids.includes(sp.id);
                    return (
                      <button key={sp.id} type="button" onClick={() => toggleSujet(i, d, sp.id)} aria-pressed={on}
                        className={`rounded-full px-3 py-1 text-xs transition ${on ? "bg-gray-950 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-950"}`}>
                        {on ? "✓ " : ""}{sp.label}
                      </button>
                    );
                  })}
                </div>
                {!ids.length && <p className="mt-2 text-xs text-amber-700">Aucun sujet coché : le client ne pourra pas préciser sa demande.</p>}
                {aUnQuestionnaire(m.domaine_id) && (
                  <p className="mt-4 text-xs text-gray-500" title={QUESTIONNAIRES[m.domaine_id!].map((q) => `• ${q.label}`).join("\n")}>
                    Le client répond aussi à quelques questions sur sa situation ({MAX_QUESTIONS} questions max. au total).
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
      <button type="button" onClick={() => onChange([...motifs, { ...NOUVEAU_MOTIF }])}
        className="rounded-full px-5 py-3 text-sm font-medium text-gray-950 ring-1 ring-black/15 hover:bg-gray-50">
        + Ajouter un motif
      </button>
    </div>
  );
}
