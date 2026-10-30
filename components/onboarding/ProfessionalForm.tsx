"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";
import {
  SPECIALITES,
  MODALITES,
  MOTIF_PRESETS,
  MOTIF_PRESETS_DEFAULT_SELECTION,
  LINKEDIN_PREFIX,
  DEFAULT_SERVICE_PRICE,
} from "@/lib/constants";
import { AvatarUploader } from "./AvatarUploader";
import { ChipToggleGroup } from "./ChipToggleGroup";
import { TagInput } from "./TagInput";
import { ServicesEditor, type ServiceDraft } from "./ServicesEditor";
import { ServicePresetsPicker } from "./ServicePresetsPicker";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import type { Motif, Professional, Service } from "@/types/database";

type Props =
  | { mode: "onboarding"; userId: string; userEmail: string; initial?: undefined }
  | {
      mode: "edit";
      userId: string;
      userEmail: string;
      initial: { professional: Professional; motifs: Motif[]; services: Service[] };
    };

function extractLinkedinHandle(url: string | null | undefined): string {
  if (!url) return "";
  const match = url.match(/linkedin\.com\/in\/(.+?)\/?$/i);
  return match ? match[1] : url;
}

async function resolveUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  base: string
): Promise<string> {
  const safeBase = base || `cgp-${Date.now()}`;
  const { data } = await supabase.from("professionals").select("slug").ilike("slug", `${safeBase}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(safeBase)) return safeBase;
  let i = 2;
  while (taken.has(`${safeBase}-${i}`)) i++;
  return `${safeBase}-${i}`;
}

export function ProfessionalForm(props: Props) {
  const { mode, userId, userEmail } = props;
  const initial = mode === "edit" ? props.initial.professional : undefined;
  const router = useRouter();

  const [prenom, setPrenom] = useState(initial?.prenom ?? "");
  const [nom, setNom] = useState(initial?.nom ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [ville, setVille] = useState(initial?.ville ?? "");
  const [cabinet, setCabinet] = useState(initial?.cabinet ?? "");
  const [groupe, setGroupe] = useState(initial?.groupe ?? "");
  const [numeroAgrement, setNumeroAgrement] = useState(initial?.numero_agrement ?? "");
  const [statutOrias, setStatutOrias] = useState(initial?.statut_orias ?? "");
  const [actifDepuis, setActifDepuis] = useState(initial?.actif_depuis ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photo_url ?? null);
  const [specialites, setSpecialites] = useState<string[]>(initial?.specialites ?? []);
  const [zonesIntervention, setZonesIntervention] = useState<string[]>(
    initial?.zones_intervention ?? []
  );
  const [modalites, setModalites] = useState<string[]>(initial?.modalites ?? []);
  const [linkedinHandle, setLinkedinHandle] = useState(extractLinkedinHandle(initial?.linkedin_url));
  const [accepteNouveauxClients, setAccepteNouveauxClients] = useState(
    initial?.accepte_nouveaux_clients ?? true
  );
  const [motifs, setMotifs] = useState<string[]>(
    mode === "edit"
      ? props.initial.motifs.map((m) => m.libelle)
      : MOTIF_PRESETS_DEFAULT_SELECTION
  );
  const [services, setServices] = useState<ServiceDraft[]>(
    mode === "edit"
      ? props.initial.services.map((s) => ({
          id: s.id,
          titre: s.titre,
          description: s.description ?? "",
          prix: s.prix ?? DEFAULT_SERVICE_PRICE,
        }))
      : []
  );

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!prenom.trim() || !nom.trim() || !numeroAgrement.trim() || !ville.trim()) {
      setError("Merci de compléter l'identité, la ville et le numéro ORIAS.");
      return;
    }
    if (specialites.length === 0) {
      setError("Sélectionnez au moins une spécialité.");
      return;
    }
    if (motifs.length === 0) {
      setError("Sélectionnez au moins un motif de rendez-vous.");
      return;
    }
    const cleanServices = services
      .map((s) => ({
        ...s,
        titre: s.titre.trim(),
        description: s.description.trim(),
        prix: s.prix.trim() || DEFAULT_SERVICE_PRICE,
      }))
      .filter((s) => s.titre);

    setSubmitting(true);
    const supabase = createClient();

    const basePayload = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      telephone: telephone.trim() || null,
      numero_agrement: numeroAgrement.trim(),
      statut_orias: statutOrias.trim() || null,
      specialites,
      bio: bio.trim() || null,
      photo_url: photoUrl,
      ville: ville.trim(),
      cabinet: cabinet.trim() || null,
      groupe: groupe.trim() || null,
      actif_depuis: actifDepuis || null,
      zones_intervention: zonesIntervention.length ? zonesIntervention : null,
      modalites: modalites.length ? modalites : null,
      linkedin_url: linkedinHandle.trim() ? `${LINKEDIN_PREFIX}${linkedinHandle.trim()}` : null,
      accepte_nouveaux_clients: accepteNouveauxClients,
    };

    if (mode === "onboarding") {
      const baseSlug = slugify(`${prenom} ${nom}`);
      const slug = await resolveUniqueSlug(supabase, baseSlug);

      const { data: inserted, error: insertError } = await supabase
        .from("professionals")
        .insert({ ...basePayload, auth_user_id: userId, email: userEmail, slug })
        .select("id")
        .single();

      if (insertError || !inserted) {
        setError("La création de votre fiche a échoué. Réessayez dans un instant.");
        setSubmitting(false);
        return;
      }

      const professionalId = inserted.id;

      if (cleanServices.length > 0) {
        await supabase.from("services").insert(
          cleanServices.map((s, i) => ({
            professional_id: professionalId,
            titre: s.titre,
            description: s.description || null,
            prix: s.prix,
            ordre: i,
          }))
        );
      }

      await supabase.from("motifs").insert(
        motifs.map((libelle, i) => ({ professional_id: professionalId, libelle, ordre: i }))
      );

      router.push("/dashboard");
      router.refresh();
      return;
    }

    // mode === "edit"
    const professionalId = props.initial.professional.id;

    const { error: updateError } = await supabase
      .from("professionals")
      .update(basePayload)
      .eq("id", professionalId);

    if (updateError) {
      setError("La mise à jour a échoué. Réessayez dans un instant.");
      setSubmitting(false);
      return;
    }

    await supabase.from("services").delete().eq("professional_id", professionalId);
    if (cleanServices.length > 0) {
      await supabase.from("services").insert(
        cleanServices.map((s, i) => ({
          professional_id: professionalId,
          titre: s.titre,
          description: s.description || null,
          prix: s.prix,
          ordre: i,
        }))
      );
    }

    await supabase.from("motifs").delete().eq("professional_id", professionalId);
    await supabase.from("motifs").insert(
      motifs.map((libelle, i) => ({ professional_id: professionalId, libelle, ordre: i }))
    );

    setSubmitting(false);
    setSavedAt(Date.now());
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6">
        <p className="eyebrow">Identité</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Prénom *">
            <input
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Nom *">
            <input value={nom} onChange={(e) => setNom(e.target.value)} className="input" required />
          </Field>
          <Field label="Téléphone">
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="input" />
          </Field>
          <Field label="Ville *">
            <input value={ville} onChange={(e) => setVille(e.target.value)} className="input" required />
          </Field>
          <Field label="Cabinet">
            <input value={cabinet} onChange={(e) => setCabinet(e.target.value)} className="input" />
          </Field>
          <Field label="Groupe (facultatif)">
            <input value={groupe} onChange={(e) => setGroupe(e.target.value)} className="input" />
          </Field>
          <Field label="Profil LinkedIn">
            <div className="flex items-stretch overflow-hidden rounded-md border border-line bg-white focus-within:border-ink-2">
              <span className="flex items-center whitespace-nowrap border-r border-line bg-card-alt px-3 text-sm text-muted">
                linkedin.com/in/
              </span>
              <input
                value={linkedinHandle}
                onChange={(e) => setLinkedinHandle(e.target.value)}
                placeholder="votre-nom"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink-2 outline-none"
              />
            </div>
          </Field>
        </div>
      </div>

      <div className="card p-6">
        <p className="eyebrow">Informations réglementaires</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Numéro ORIAS *">
            <input
              value={numeroAgrement}
              onChange={(e) => setNumeroAgrement(e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Statut ORIAS">
            <input
              value={statutOrias}
              onChange={(e) => setStatutOrias(e.target.value)}
              placeholder="Ex. Mandataire d'Intermédiaire en Assurance"
              className="input"
            />
          </Field>
          <Field label="En activité depuis">
            <input
              type="date"
              value={actifDepuis ?? ""}
              onChange={(e) => setActifDepuis(e.target.value)}
              className="input"
            />
          </Field>
        </div>
      </div>

      <div className="card p-6">
        <p className="eyebrow">Spécialités et zones d&rsquo;intervention</p>
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-ink-2">Spécialités *</p>
            <ChipToggleGroup options={SPECIALITES} value={specialites} onChange={setSpecialites} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink-2">Zones d&rsquo;intervention</p>
            <TagInput
              value={zonesIntervention}
              onChange={setZonesIntervention}
              placeholder="Ajoutez une ville et appuyez sur Entrée"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <p className="eyebrow">Présentation</p>
        <div className="mt-4 space-y-4">
          <AvatarUploader userId={userId} value={photoUrl} onChange={setPhotoUrl} />
          <Field label="Bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="input"
              placeholder="Présentez votre parcours, votre approche, vos clients types..."
            />
          </Field>
        </div>
      </div>

      <div className="card p-6">
        <p className="eyebrow">Type de rendez-vous</p>
        <div className="mt-4 space-y-4">
          <ChipToggleGroup options={MODALITES} value={modalites} onChange={setModalites} />
          <label className="flex items-center gap-2 text-sm text-body">
            <input
              type="checkbox"
              checked={accepteNouveauxClients}
              onChange={(e) => setAccepteNouveauxClients(e.target.checked)}
              className="h-4 w-4 rounded border-line"
            />
            J&rsquo;accepte de nouveaux clients actuellement
          </label>
        </div>
      </div>

      <div className="card p-6">
        <p className="eyebrow">Services proposés (facultatif)</p>
        <div className="mt-4 space-y-5">
          <ServicePresetsPicker value={services} onChange={setServices} />
          <ServicesEditor value={services} onChange={setServices} />
        </div>
      </div>

      <div className="card p-6">
        <p className="eyebrow">Motifs de rendez-vous *</p>
        <p className="mt-2 text-sm text-muted">
          Sélectionnez ce que vos clients pourront choisir au moment de réserver — la même liste
          que vos services proposés.
        </p>
        <div className="mt-3">
          <ChipToggleGroup options={MOTIF_PRESETS} value={motifs} onChange={setMotifs} />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {savedAt && !error && (
        <div className="flex items-center gap-2 rounded-md border border-success bg-success-bg px-4 py-3 text-sm text-success">
          <IconCheck className="h-4 w-4" /> Fiche mise à jour.
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-solid">
        {submitting
          ? "Enregistrement..."
          : mode === "onboarding"
            ? "Publier ma fiche"
            : "Enregistrer les modifications"}
        <IconArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>
      {children}
    </label>
  );
}
