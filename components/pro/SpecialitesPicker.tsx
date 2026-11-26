"use client";

import { useState } from "react";
import type { Domaine } from "@/lib/taxonomie";

const sansAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Choix des domaines de compétence. Cocher un domaine coche tous ses sous-domaines (spécialités) ;
 * « Affiner » permet d'en décocher. Stockage inchangé : la liste des spécialités cochées.
 */
export function SpecialitesPicker({ taxo, value, onChange }: { taxo: Domaine[]; value: string[]; onChange: (ids: string[]) => void }) {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  const toggleDomaine = (d: Domaine) => {
    const ids = d.specialites.map((s) => s.id);
    const actif = ids.some((x) => value.includes(x));
    onChange(actif ? value.filter((x) => !ids.includes(x)) : [...new Set([...value, ...ids])]);
    if (actif && ouvert === d.id) setOuvert(null);
  };

  if (!taxo.length) return <p className="text-sm text-red-600">Liste des domaines introuvable : lancez les migrations 0008 et 0029 dans Supabase.</p>;

  const r = sansAccents(recherche.trim());
  const visibles = r
    ? taxo.filter((d) => sansAccents(`${d.label} ${d.description ?? ""} ${d.specialites.map((s) => s.label).join(" ")}`).includes(r))
    : taxo;
  const nbDomaines = taxo.filter((d) => d.specialites.some((s) => value.includes(s.id))).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un domaine (divorce, licenciement, permis…)"
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-950" />
        <span className="text-sm text-gray-500">{nbDomaines} domaine{nbDomaines > 1 ? "s" : ""} sélectionné{nbDomaines > 1 ? "s" : ""}</span>
      </div>
      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl ring-1 ring-black/10">
        {visibles.length === 0 && <p className="px-5 py-4 text-sm text-gray-500">Aucun domaine ne correspond.</p>}
        {visibles.map((d, k) => {
          const n = d.specialites.filter((s) => value.includes(s.id)).length;
          const debutProfil = d.profilSeulement && !visibles[k - 1]?.profilSeulement;
          const actif = n > 0;
          const open = actif && ouvert === d.id;
          return (
            <div key={d.id} className={actif ? "bg-gray-50/60" : ""}>
              {debutProfil && (
                <p className="border-b border-gray-100 bg-gray-50 px-5 py-2 text-xs font-medium text-gray-500">Votre profil · affiché sur votre page, sans motif de rendez-vous</p>
              )}
              <div className="flex items-start gap-3 px-5 py-3.5">
                <button type="button" onClick={() => toggleDomaine(d)} className="flex min-w-0 flex-1 items-start gap-3 text-left" aria-pressed={actif}>
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs ${actif ? "bg-gray-950 text-white" : "ring-1 ring-gray-300"}`}>{actif ? "✓" : ""}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-950">{d.label}</span>
                    {d.description && <span className="mt-0.5 block text-xs text-gray-500">{d.description}</span>}
                  </span>
                </button>
                {actif && (
                  <button type="button" onClick={() => setOuvert(open ? null : d.id)} className="shrink-0 whitespace-nowrap text-xs text-gray-500 underline hover:text-gray-950">
                    {n}/{d.specialites.length} sujets · {open ? "Fermer" : "Affiner"}
                  </button>
                )}
              </div>
              {open && (
                <div className="flex flex-wrap gap-2 px-5 pb-4 sm:pl-[52px]">
                  {d.specialites.map((s) => {
                    const on = value.includes(s.id);
                    return (
                      <button key={s.id} type="button" onClick={() => toggle(s.id)}
                        className={`rounded-full px-3.5 py-1.5 text-sm transition ${on ? "bg-gray-950 text-white shadow-md" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-950"}`}>
                        {on ? "✓ " : ""}{s.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
