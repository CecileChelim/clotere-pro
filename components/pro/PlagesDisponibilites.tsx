"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { JOURS, rowsDepuisHoraires, type Horaires, type Plage } from "@/lib/horaires";

/* Plages de disponibilités (comme sur Clotere notaire) : un interrupteur par jour, des plages en pastilles,
   un panneau pour ajouter ou modifier une plage, enregistrement automatique à chaque modification. */

const PRESETS = [
  { label: "Matin", debut: "09:00", fin: "12:00" },
  { label: "Après-midi", debut: "14:00", fin: "18:00" },
  { label: "Journée", debut: "09:00", fin: "18:00" },
];
const HEURES = Array.from({ length: 31 }, (_, i) => {
  const m = 7 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});
const SEMAINE = [1, 2, 3, 4, 5];
const heure = (t: string) => t.replace(/^0/, "").replace(":", "h").replace("h00", "h");
const fmt = (p: Plage) => `${heure(p.debut)} – ${heure(p.fin)}`;
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function fusionner(plages: Plage[]): Plage[] {
  const tri = plages.map((p) => ({ s: toMin(p.debut), e: toMin(p.fin) })).filter((p) => p.e > p.s).sort((a, b) => a.s - b.s);
  const out: { s: number; e: number }[] = [];
  for (const p of tri) {
    const der = out[out.length - 1];
    if (der && p.s <= der.e) der.e = Math.max(der.e, p.e);
    else out.push({ ...p });
  }
  return out.map((p) => ({ debut: toHHMM(p.s), fin: toHHMM(p.e) }));
}

function Interrupteur({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition ${on ? "bg-violet-600" : "bg-gray-200"}`}>
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}

type Edition = { jour: number; index: number } | null;

export function PlagesDisponibilites({ proId, init, synchro }: { proId: string; init: Horaires; synchro: boolean }) {
  const supabase = useMemo(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), []);
  const [h, setH] = useState<Horaires>(init);
  const [statut, setStatut] = useState<"" | "saving" | "saved" | "error">("");
  const dernier = useRef(init);
  const minuteur = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Panneau d'ajout / modification
  const [panneau, setPanneau] = useState<{ jours: number[]; debut: string; fin: string; remplacer: boolean; edition: Edition } | null>(null);

  useEffect(() => () => clearTimeout(minuteur.current), []);

  async function enregistrer(next: Horaires) {
    setH(next); setStatut("saving");
    const { error: e1 } = await supabase.from("availability").delete().eq("professional_id", proId).is("date", null);
    const rows = rowsDepuisHoraires(proId, next);
    const { error: e2 } = rows.length ? await supabase.from("availability").insert(rows) : { error: null };
    if (e1 || e2) { setH(dernier.current); setStatut("error"); return false; }
    dernier.current = next; setStatut("saved");
    clearTimeout(minuteur.current); minuteur.current = setTimeout(() => setStatut(""), 2500);
    return true;
  }

  const basculer = (jour: number, on: boolean) => enregistrer({ ...h, [jour]: on ? (h[jour]?.length ? h[jour] : [{ debut: "09:00", fin: "18:00" }]) : [] });
  const retirer = (jour: number, i: number) => enregistrer({ ...h, [jour]: h[jour].filter((_, j) => j !== i) });
  const semaineType = () => enregistrer({ ...h, ...Object.fromEntries(SEMAINE.map((j) => [j, [{ debut: "09:00", fin: "18:00" }]])) });

  async function valider() {
    if (!panneau || !panneau.jours.length || panneau.debut >= panneau.fin) return;
    const next = { ...h };
    for (const j of panneau.jours) {
      let base = next[j] ?? [];
      if (panneau.edition && j === panneau.edition.jour) base = base.filter((_, i) => i !== panneau.edition!.index);
      if (panneau.remplacer) base = [];
      next[j] = fusionner([...base, { debut: panneau.debut, fin: panneau.fin }]);
    }
    if (await enregistrer(next)) setPanneau(null);
  }
  async function supprimerDepuisPanneau() {
    if (!panneau?.edition) return;
    const { jour, index } = panneau.edition;
    if (await enregistrer({ ...h, [jour]: h[jour].filter((_, i) => i !== index) })) setPanneau(null);
  }

  return (
    <section className="card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-gray-950">Plages de disponibilités</h2>
            {statut === "saving" && <span className="text-xs text-gray-400">Enregistrement…</span>}
            {statut === "saved" && <span className="text-xs font-medium text-emerald-600">✓ Enregistré</span>}
            {statut === "error" && <span className="text-xs font-medium text-red-600">Erreur, réessayez</span>}
          </div>
          <p className="mt-0.5 text-sm text-gray-600">Choisissez quand vos clients peuvent réserver en ligne. Ex : uniquement le matin.</p>
        </div>
        <button type="button" onClick={semaineType}
          className="shrink-0 rounded-lg bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 ring-1 ring-violet-200 hover:bg-violet-100">
          ⚡ 9h – 18h du lundi au vendredi
        </button>
      </div>

      {synchro && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3.5 text-sm ring-1 ring-emerald-200">
          <p className="font-medium text-emerald-900">Vos clients ne voient que les moments libres de votre agenda synchronisé, et uniquement à l&apos;intérieur de ces plages.</p>
          <p className="mt-0.5 text-emerald-800/80">Ex : lundi 9h–12h avec un rendez-vous de 10h à 11h → seuls 9h–10h et 11h–12h sont proposés.</p>
        </div>
      )}

      <div className="mt-4 divide-y divide-gray-100">
        {JOURS.map(({ id, label }) => {
          const plages = h[id] ?? [];
          const ouvert = plages.length > 0;
          return (
            <div key={id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="flex w-36 shrink-0 items-center gap-3">
                <Interrupteur on={ouvert} onChange={(v) => basculer(id, v)} label={`Ouvrir le ${label}`} />
                <span className={`text-sm font-medium ${ouvert ? "text-gray-950" : "text-gray-400"}`}>{label}</span>
              </div>
              {ouvert ? (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex flex-1 flex-wrap gap-2">
                    {plages.map((p, i) => (
                      <span key={`${p.debut}-${p.fin}`} className="inline-flex items-center rounded-lg bg-gray-50 pr-1.5 text-sm font-medium tabular-nums text-gray-950 ring-1 ring-gray-200 hover:ring-violet-300">
                        <button type="button" title="Modifier cette plage" className="py-1.5 pr-1 pl-3 hover:text-violet-700"
                          onClick={() => setPanneau({ jours: [id], debut: p.debut, fin: p.fin, remplacer: false, edition: { jour: id, index: i } })}>
                          {fmt(p)}
                        </button>
                        <button type="button" onClick={() => retirer(id, i)} aria-label={`Supprimer ${fmt(p)}`} className="rounded px-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700">✕</button>
                      </span>
                    ))}
                  </div>
                  <button type="button" aria-label={`Ajouter une plage le ${label}`}
                    onClick={() => setPanneau({ jours: [id], debut: "14:00", fin: "18:00", remplacer: false, edition: null })}
                    className="shrink-0 rounded-lg px-2 py-1 text-lg leading-none text-violet-600 hover:bg-violet-50">+</button>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Pas de rendez-vous en ligne</span>
              )}
            </div>
          );
        })}
      </div>

      {panneau && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setPanneau(null)}>
          <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-950">{panneau.edition ? "Modifier la plage" : "Ajouter une plage"}</h3>
              <button type="button" onClick={() => setPanneau(null)} className="text-gray-400 hover:text-gray-700" aria-label="Fermer">✕</button>
            </div>

            {!panneau.edition && (
              <>
                <p className="mt-6 text-sm font-medium text-gray-950">Jours</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {JOURS.map(({ id, label }) => {
                    const on = panneau.jours.includes(id);
                    return (
                      <button key={id} type="button" onClick={() => setPanneau({ ...panneau, jours: on ? panneau.jours.filter((j) => j !== id) : [...panneau.jours, id] })}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ${on ? "bg-violet-600 text-white ring-violet-600" : "bg-white text-gray-700 ring-gray-200 hover:ring-gray-300"}`}>
                        {label.slice(0, 3)}.
                      </button>
                    );
                  })}
                </div>
                <button type="button" onClick={() => setPanneau({ ...panneau, jours: SEMAINE })} className="mt-2 self-start text-xs text-gray-500 underline hover:text-gray-950">Du lundi au vendredi</button>
              </>
            )}

            <p className="mt-6 text-sm font-medium text-gray-950">Horaires</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => setPanneau({ ...panneau, debut: p.debut, fin: p.fin })}
                  className={`rounded-lg px-3 py-1.5 text-sm ring-1 ${panneau.debut === p.debut && panneau.fin === p.fin ? "bg-violet-50 font-semibold text-violet-700 ring-violet-300" : "text-gray-700 ring-gray-200 hover:ring-gray-300"}`}>
                  {p.label} <span className="text-gray-400">{fmt(p)}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <select value={panneau.debut} onChange={(e) => setPanneau({ ...panneau, debut: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2">
                {HEURES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <span className="text-gray-400">→</span>
              <select value={panneau.fin} onChange={(e) => setPanneau({ ...panneau, fin: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2">
                {HEURES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            {panneau.debut >= panneau.fin && <p className="mt-2 text-sm text-red-600">L&apos;heure de fin doit être après l&apos;heure de début.</p>}

            {!panneau.edition && (
              <label className="mt-6 flex items-start gap-2 text-sm text-gray-700">
                <input type="checkbox" className="mt-0.5" checked={panneau.remplacer} onChange={(e) => setPanneau({ ...panneau, remplacer: e.target.checked })} />
                Remplacer les plages existantes de ces jours
              </label>
            )}

            <div className="mt-auto flex items-center gap-3 pt-8">
              <button type="button" onClick={valider} disabled={!panneau.jours.length || panneau.debut >= panneau.fin || statut === "saving"} className="btn-solid disabled:opacity-50">
                {panneau.edition ? "Enregistrer" : "Ajouter"}
              </button>
              {panneau.edition && <button type="button" onClick={supprimerDepuisPanneau} className="text-sm text-red-600 hover:underline">Supprimer la plage</button>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
