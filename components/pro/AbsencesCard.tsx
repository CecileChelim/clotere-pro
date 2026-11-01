"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export type Absence = { id: string; debut: string; fin: string; motif: string | null };

const jour = (d: string, annee = false) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", ...(annee ? { year: "numeric" } : {}) });
const aujourdhui = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });

/** Absences : congés, formations… aucune prise de rendez-vous en ligne sur ces journées. */
export function AbsencesCard({ proId, init }: { proId: string; init: Absence[] }) {
  const supabase = useMemo(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), []);
  const [items, setItems] = useState(init);
  const [form, setForm] = useState<{ debut: string; fin: string; motif: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");

  async function ajouter() {
    if (!form?.debut) return;
    const fin = form.fin && form.fin >= form.debut ? form.fin : form.debut;
    setBusy(true); setErreur("");
    const { data, error } = await supabase.from("absences").insert({ professional_id: proId, debut: form.debut, fin, motif: form.motif.trim() || null }).select("id, debut, fin, motif").single();
    setBusy(false);
    if (error || !data) { setErreur("Impossible d'enregistrer l'absence."); return; }
    setItems((l) => [...l, data as Absence].sort((a, b) => a.debut.localeCompare(b.debut)));
    setForm(null);
  }
  async function supprimer(id: string) {
    const avant = items;
    setItems((l) => l.filter((a) => a.id !== id));
    const { error } = await supabase.from("absences").delete().eq("id", id);
    if (error) { setItems(avant); setErreur("Suppression impossible."); }
  }

  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-gray-950">Absences</h2>
          <p className="mt-0.5 text-sm text-gray-600">Congés, formation, séminaire : aucun rendez-vous ne pourra être pris ces jours-là.</p>
        </div>
        {!form && <button type="button" onClick={() => setForm({ debut: aujourdhui(), fin: "", motif: "" })} className="btn-outline">+ Ajouter une absence</button>}
      </div>

      {form && (
        <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 ring-1 ring-black/5 sm:grid-cols-[1fr_1fr_1.4fr_auto] sm:items-end">
          <label className="text-sm"><span className="mb-1 block font-medium text-gray-950">Du</span>
            <input type="date" min={aujourdhui()} value={form.debut} onChange={(e) => setForm({ ...form, debut: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block font-medium text-gray-950">Au (inclus)</span>
            <input type="date" min={form.debut} value={form.fin} onChange={(e) => setForm({ ...form, fin: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" /></label>
          <label className="text-sm"><span className="mb-1 block font-medium text-gray-950">Motif <span className="font-normal text-gray-400">(pour vous)</span></span>
            <input value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} placeholder="Congés" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2" /></label>
          <div className="flex gap-2">
            <button type="button" onClick={ajouter} disabled={busy || !form.debut} className="btn-solid disabled:opacity-50">{busy ? "…" : "Ajouter"}</button>
            <button type="button" onClick={() => setForm(null)} className="px-2 text-sm text-gray-500 hover:text-gray-950">Annuler</button>
          </div>
        </div>
      )}
      {erreur && <p className="mt-3 text-sm text-red-600">{erreur}</p>}

      {items.length === 0 ? (
        !form && <p className="mt-4 text-sm text-gray-400">Aucune absence prévue.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {items.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="text-gray-950">
                {a.debut === a.fin ? <>Le {jour(a.debut, true)}</> : <>Du {jour(a.debut)} au {jour(a.fin, true)}</>}
                <span className="text-gray-500"> · journée{a.debut === a.fin ? "" : "s"} entière{a.debut === a.fin ? "" : "s"}{a.motif ? ` · ${a.motif}` : ""}</span>
              </span>
              <button type="button" onClick={() => supprimer(a.id)} className="text-gray-400 hover:text-red-600" aria-label="Supprimer l'absence">✕</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
