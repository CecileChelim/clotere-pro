"use client";

import { useMemo, useState } from "react";
import { competencesCochees, competencesDe, type Competence, type Domaine } from "@/lib/taxonomie";

const sansAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const sujetsDe = (c: Competence) => c.domaines.flatMap((d) => d.specialites);

/**
 * 1. Domaines de compétence (Droit de la famille, Droit du travail…).
 * La recherche porte aussi sur les motifs : « licenciement » fait remonter Droit du travail.
 */
export function DomainesPicker({ competences, value, onChange }: { competences: Competence[]; value: string[]; onChange: (ids: string[]) => void }) {
  const [recherche, setRecherche] = useState("");
  if (!competences.length) return <p className="text-sm text-red-600">Liste des domaines introuvable : lancez les migrations 0029 et 0032 dans Supabase.</p>;

  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  const r = sansAccents(recherche.trim());
  const visibles = r
    ? competences.filter((c) => sansAccents(`${c.label} ${c.description ?? ""} ${c.domaines.map((d) => d.label).join(" ")} ${sujetsDe(c).map((s) => s.label).join(" ")}`).includes(r))
    : competences;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher (divorce, licenciement, permis…)"
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-950" />
        <span className="text-sm text-gray-500">{value.length} domaine{value.length > 1 ? "s" : ""} sélectionné{value.length > 1 ? "s" : ""}</span>
      </div>
      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl ring-1 ring-black/10">
        {visibles.length === 0 && <p className="px-5 py-4 text-sm text-gray-500">Aucun domaine ne correspond.</p>}
        {visibles.map((c, k) => {
          const actif = value.includes(c.id);
          const debutProfil = c.profilSeulement && !visibles[k - 1]?.profilSeulement;
          return (
            <div key={c.id}>
              {debutProfil && (
                <p className="border-b border-gray-100 bg-gray-50 px-5 py-2 text-xs font-medium text-gray-500">Votre profil · affiché sur votre page, sans motif de rendez-vous</p>
              )}
              <button type="button" onClick={() => toggle(c.id)} aria-pressed={actif}
                className={`flex w-full items-start gap-3 px-5 py-3.5 text-left ${actif ? "bg-gray-50/80" : "hover:bg-gray-50/50"}`}>
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-xs ${actif ? "bg-gray-950 text-white" : "ring-1 ring-gray-300"}`}>{actif ? "✓" : ""}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-gray-950">{c.label}</span>
                  {c.description && <span className="mt-0.5 block text-xs text-gray-500">{c.description}</span>}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Motifs pré-cochés pour des domaines de compétence tout juste choisis : les plus demandés (tous si aucun n'est marqué). */
export function sujetsParDefaut(competences: Competence[], ids: string[]) {
  return competences.filter((c) => ids.includes(c.id)).flatMap((c) => {
    const tous = sujetsDe(c);
    const pop = tous.filter((s) => s.populaire);
    return (pop.length ? pop : tous).map((s) => s.id);
  });
}

/** Une compétence choisie sans aucun motif coché. */
export const competencesSansMotif = (competences: Competence[], ids: string[], specs: string[]) =>
  competences.filter((c) => ids.includes(c.id) && !sujetsDe(c).some((s) => specs.includes(s.id)));

/**
 * 2. Dans chaque domaine de compétence choisi, les motifs de rendez-vous (Divorce à l'amiable, Pension alimentaire…),
 * regroupés sous un intertitre quand le domaine en couvre plusieurs. Stockage : les spécialités cochées (pro_specialites).
 */
export function SujetsParDomaine({ competences, choisies, value, onChange }: { competences: Competence[]; choisies: string[]; value: string[]; onChange: (ids: string[]) => void }) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="space-y-4">
      {competences.filter((c) => choisies.includes(c.id)).map((c) => {
        const ids = sujetsDe(c).map((s) => s.id);
        const n = ids.filter((id) => value.includes(id)).length;
        const tous = n === ids.length;
        return (
          <section key={c.id} className={`rounded-2xl p-5 ring-1 ${n ? "ring-black/10" : "bg-amber-50/40 ring-amber-200"}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-medium text-gray-950">
                {c.label}
                {c.profilSeulement && <span className="ml-2 text-xs font-normal text-gray-500">affiché sur votre page, sans motif de rendez-vous</span>}
              </h2>
              <button type="button" className="text-xs text-gray-500 underline hover:text-gray-950"
                onClick={() => onChange(tous ? value.filter((x) => !ids.includes(x)) : [...new Set([...value, ...ids])])}>
                {tous ? "Tout décocher" : "Tout cocher"}
              </button>
            </div>
            {c.domaines.map((d) => (
              <div key={d.id} className="mt-3">
                {c.domaines.length > 1 && <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">{d.label}</p>}
                <div className="flex flex-wrap gap-2">
                  {d.specialites.map((s) => {
                    const on = value.includes(s.id);
                    return (
                      <button key={s.id} type="button" onClick={() => toggle(s.id)} aria-pressed={on}
                        className={`rounded-full px-3.5 py-1.5 text-sm transition ${on ? "bg-gray-950 text-white shadow-md" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-950"}`}>
                        {on ? "✓ " : ""}{s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {!n && <p className="mt-3 text-xs text-amber-800">Choisissez au moins un motif, ou retirez ce domaine.</p>}
          </section>
        );
      })}
    </div>
  );
}

/** Profil (espace pro) : les deux niveaux sur une même page — domaines de compétence, puis leurs motifs. */
export function ExpertisePicker({ taxo, value, onChange }: { taxo: Domaine[]; value: string[]; onChange: (ids: string[]) => void }) {
  const competences = useMemo(() => competencesDe(taxo), [taxo]);
  const [choisies, setChoisies] = useState<string[]>(() => competencesCochees(competences, value));
  const changerDomaines = (ids: string[]) => {
    const ajoutes = ids.filter((id) => !choisies.includes(id));
    const retires = choisies.filter((id) => !ids.includes(id));
    const aRetirer = new Set(competences.filter((c) => retires.includes(c.id)).flatMap((c) => sujetsDe(c).map((s) => s.id)));
    setChoisies(ids);
    onChange([...new Set([...value.filter((x) => !aRetirer.has(x)), ...sujetsParDefaut(competences, ajoutes)])]);
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-950">1. Vos domaines de compétence</p>
        <DomainesPicker competences={competences} value={choisies} onChange={changerDomaines} />
      </div>
      {choisies.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-950">2. Dans ces domaines, vos motifs de rendez-vous</p>
          <SujetsParDomaine competences={competences} choisies={choisies} value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
