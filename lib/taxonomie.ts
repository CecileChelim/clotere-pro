import type { SupabaseClient } from "@supabase/supabase-js";
import type { MotifDraft, Profession } from "./professions-config";
import { PROFESSIONS } from "./professions-config";

export type Specialite = { id: string; label: string; populaire: boolean };
/** profilSeulement : domaine affiché sur la fiche (clientèle, formes, secteurs) mais qui ne donne pas de motif. */
export type Domaine = {
  id: string; label: string; description?: string | null; profilSeulement?: boolean; specialites: Specialite[];
  /** Domaine de compétence parent (Droit de la famille…), migration 0032. Absent pour les experts-comptables. */
  competence?: { id: string; label: string; description: string | null; ordre: number } | null;
};

/** Domaine de compétence affiché au pro : il regroupe un ou plusieurs domaines, dont les spécialités sont ses motifs de rendez-vous. */
export type Competence = { id: string; label: string; description?: string | null; profilSeulement: boolean; domaines: Domaine[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function chargerTaxonomie(db: SupabaseClient<any, any, any>, profession: Profession): Promise<Domaine[]> {
  const { data, error } = await db
    .from("domaines")
    .select("id, label, description, profil_seulement, ordre, competences(id, label, description, ordre), specialites(id, label, ordre, populaire)")
    .eq("profession", profession)
    .order("ordre");
  if (error) console.error("[taxonomie]", error.message);
  type Ligne = {
    id: string; label: string; description?: string | null; profil_seulement?: boolean; specialites: (Specialite & { ordre: number })[];
    competences?: { id: string; label: string; description: string | null; ordre: number } | { id: string; label: string; description: string | null; ordre: number }[] | null;
  };
  return (data ?? []).map((d: Ligne) => ({
    id: d.id,
    label: d.label,
    description: d.description ?? null,
    profilSeulement: !!d.profil_seulement,
    competence: (Array.isArray(d.competences) ? d.competences[0] : d.competences) ?? null,
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
  const parDomaine = selectionParDomaine(taxo, ids).filter((d) => !d.profilSeulement).map<MotifGenere>((d) => ({
    libelle: `${conf.prefixeMotif} – ${d.id.endsWith("-autres") ? d.specialites.map((s) => s.label).join(", ") : d.label}`,
    description: d.id.endsWith("-autres") ? "" : descriptionSujets(d.specialites),
    duree_min: 30, modes: ["visio", "telephone"], prix_type: "gratuit", prix_euros: null, actif: true, domaine_id: d.id,
    specialite_ids: d.specialites.map((s) => s.id),
  }));
  return [{ ...conf.motifParDefaut, domaine_id: null }, ...parDomaine];
}

/** Texte affiché sous un motif côté client : la liste des sujets traités. */
export function descriptionSujets(specs: { label: string }[]) {
  return specs.map((s) => s.label).join(", ");
}

/** Spécialités (sujets) d'un domaine, dans l'ordre de la taxonomie, restreintes à une liste d'ids. */
export function sujetsDuMotif(taxo: Domaine[], domaineId: string | null | undefined, ids: string[] | null | undefined): Specialite[] {
  const d = taxo.find((x) => x.id === domaineId);
  if (!d || !ids?.length) return [];
  return d.specialites.filter((s) => ids.includes(s.id));
}

/** Regroupe les domaines par domaine de compétence (ordre des compétences, puis des domaines).
    Un domaine sans compétence (experts-comptables) forme sa propre compétence. */
export function competencesDe(taxo: Domaine[]): Competence[] {
  const groupes = new Map<string, Competence & { ordre: number; rang: number }>();
  taxo.forEach((d, rang) => {
    const c = d.competence;
    const id = c?.id ?? d.id;
    if (!groupes.has(id)) {
      groupes.set(id, { id, label: c?.label ?? d.label, description: c ? c.description : d.description, profilSeulement: !c && !!d.profilSeulement, domaines: [], ordre: c ? c.ordre : rang, rang });
    }
    groupes.get(id)!.domaines.push(d);
  });
  return [...groupes.values()].sort((a, b) => a.ordre - b.ordre || a.rang - b.rang).map((c) => ({ id: c.id, label: c.label, description: c.description, profilSeulement: c.profilSeulement, domaines: c.domaines }));
}

/** Ids des compétences ayant au moins une spécialité cochée. */
export const competencesCochees = (competences: Competence[], specs: string[]) =>
  competences.filter((c) => c.domaines.some((d) => d.specialites.some((s) => specs.includes(s.id)))).map((c) => c.id);
