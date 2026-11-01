import type { SupabaseClient } from "@supabase/supabase-js";
import type { MotifDraft, Profession } from "./professions-config";
import { PROFESSIONS } from "./professions-config";

export type Specialite = { id: string; label: string; populaire: boolean };
export type Domaine = { id: string; label: string; specialites: Specialite[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function chargerTaxonomie(db: SupabaseClient<any, any, any>, profession: Profession): Promise<Domaine[]> {
  const { data, error } = await db
    .from("domaines")
    .select("id, label, ordre, specialites(id, label, ordre, populaire)")
    .eq("profession", profession)
    .order("ordre");
  if (error) console.error("[taxonomie]", error.message);
  return (data ?? []).map((d: { id: string; label: string; specialites: (Specialite & { ordre: number })[] }) => ({
    id: d.id,
    label: d.label,
    specialites: [...(d.specialites ?? [])].sort((a, b) => a.ordre - b.ordre).map(({ id, label, populaire }) => ({ id, label, populaire })),
  }));
}

/** Domaines ayant au moins une spécialité cochée, avec les spécialités cochées. */
export function selectionParDomaine(taxo: Domaine[], ids: string[]) {
  return taxo
    .map((d) => ({ ...d, specialites: d.specialites.filter((s) => ids.includes(s.id)) }))
    .filter((d) => d.specialites.length);
}

export type MotifGenere = MotifDraft & { domaine_id: string | null };

export function motifsDepuisSpecialites(profession: Profession, taxo: Domaine[], ids: string[]): MotifGenere[] {
  const conf = PROFESSIONS[profession];
  const parDomaine = selectionParDomaine(taxo, ids).map<MotifGenere>((d) => ({
    libelle: `${conf.prefixeMotif} – ${d.id.endsWith("-autres") ? d.specialites.map((s) => s.label).join(", ") : d.label}`,
    description: d.id.endsWith("-autres") ? "" : d.specialites.map((s) => s.label).join(", "),
    duree_min: 30, modes: ["visio", "telephone"], prix_type: "gratuit", prix_euros: null, actif: true, domaine_id: d.id,
  }));
  return [{ ...conf.motifParDefaut, domaine_id: null }, ...parDomaine];
}
