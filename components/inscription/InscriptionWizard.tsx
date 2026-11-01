"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AvatarUploader } from "@/components/onboarding/AvatarUploader";
import { MotifsEditor } from "@/components/pro/MotifsEditor";
import { AdresseAutocomplete, type LieuDetail } from "@/components/pro/AdresseAutocomplete";
import { SpecialitesPicker } from "@/components/pro/SpecialitesPicker";
import { avecPrefixe, LINKEDIN_PREFIX, LINKEDIN_STRIP, PrefixInput } from "@/components/pro/PrefixInput";
import { PROFESSIONS, type MotifDraft, type Profession } from "@/lib/professions-config";
import { motifsDepuisSpecialites, selectionParDomaine, type Domaine } from "@/lib/taxonomie";

export type Etape = "vous" | "cabinet" | "presence" | "expertise" | "motifs";
const ETAPES: { id: Etape; label: string }[] = [
  { id: "vous", label: "Vous" },
  { id: "cabinet", label: "Cabinet" },
  { id: "presence", label: "En ligne" },
  { id: "expertise", label: "Spécialités" },
  { id: "motifs", label: "Motifs de rdv" },
];

const input = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-950";
const label = "mb-1.5 block text-sm font-medium text-gray-950";
const btn = "rounded-full bg-gray-950 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40";
const url = (v: string) => (v.trim() ? (/^https?:\/\//.test(v.trim()) ? v.trim() : `https://${v.trim()}`) : null);
const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type Props = {
  profession: Profession; userId: string; userEmail: string; taxo: Domaine[];
  initialStep: Etape; proId: string | null; cabinetId: string | null;
};

export function InscriptionWizard({ profession, userId, userEmail, taxo, initialStep, proId: proInit, cabinetId: cabInit }: Props) {
  const conf = PROFESSIONS[profession];
  const supabase = useMemo(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), []);
  const [step, setStep] = useState<Etape>(initialStep);
  const [proId, setProId] = useState(proInit);
  const [cabinetId, setCabinetId] = useState(cabInit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Vous
  const [vous, setVous] = useState({ prenom: "", nom: "", telephone: "", bio: "" });
  const [photo, setPhoto] = useState<string | null>(null);
  // Cabinet
  const [siret, setSiret] = useState("");
  const [siretStatus, setSiretStatus] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const [cab, setCab] = useState({ nom: "", adresse: "", code_postal: "", ville: "", telephone: "", barreau: "" });
  // En ligne
  const [web, setWeb] = useState({ site: "", google: "", linkedin: "" });
  // Spécialités & motifs
  const [specs, setSpecs] = useState<string[]>([]);
  const [motifs, setMotifs] = useState<MotifDraft[]>([]);

  const idx = ETAPES.findIndex((e) => e.id === step);
  const fail = (m: string) => { setError(m); setSaving(false); };

  function remplirDepuisGoogle(l: LieuDetail) {
    const sansProto = (u: string | null) => (u ?? "").replace(/^https?:\/\//, "");
    setCab((c) => ({
      ...c,
      nom: c.nom || l.nom || "",
      adresse: l.adresse || c.adresse,
      code_postal: l.code_postal || c.code_postal,
      ville: l.ville || c.ville,
      telephone: c.telephone || l.telephone || "",
    }));
    setWeb((w) => ({ ...w, site: w.site || sansProto(l.site), google: w.google || sansProto(l.google_url) }));
  }

  async function chercherSiret() {
    const clean = siret.replace(/\s/g, "");
    if (!/^\d{14}$/.test(clean)) { setSiretStatus("notfound"); return; }
    setSiretStatus("loading");
    try {
      const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${clean}&page=1&per_page=1`);
      const r = (await res.json()).results?.[0];
      if (!r) { setSiretStatus("notfound"); return; }
      const etab = r.matching_etablissements?.find((e: { siret: string }) => e.siret === clean) ?? r.siege;
      setCab((c) => ({
        ...c,
        nom: r.nom_raison_sociale || r.nom_complet || c.nom,
        adresse: [etab?.numero_voie, etab?.type_voie, etab?.libelle_voie].filter(Boolean).join(" ") || etab?.adresse || c.adresse,
        code_postal: etab?.code_postal ?? c.code_postal,
        ville: etab?.libelle_commune ?? c.ville,
      }));
      setSiretStatus("found");
    } catch { setSiretStatus("notfound"); }
  }

  /* --- Enregistrements à chaque étape --- */
  async function suivant(e?: React.FormEvent) {
    e?.preventDefault();
    setError(""); setSaving(true);

    if (step === "vous") { setSaving(false); setStep("cabinet"); return; }

    if (step === "cabinet") {
      const { data: c, error: e1 } = await supabase.from("cabinets").insert({
        profession, siret: siret.replace(/\s/g, "") || null, nom: cab.nom, adresse: cab.adresse, code_postal: cab.code_postal,
        ville: cab.ville, telephone: cab.telephone || vous.telephone || null, barreau: profession === "avocat" ? cab.barreau || null : null,
        owner_auth_user_id: userId,
      }).select("id").single();
      if (e1 || !c) return fail("Impossible d'enregistrer le cabinet.");
      const { data: p, error: e2 } = await supabase.from("professionals").insert({
        auth_user_id: userId, prenom: vous.prenom, nom: vous.nom, email: userEmail, telephone: vous.telephone || null,
        bio: vous.bio || null, photo_url: photo, slug: `${slugify(`${vous.prenom}-${vous.nom}`)}-${Math.random().toString(36).slice(2, 6)}`,
        ville: cab.ville, cabinet: cab.nom, cabinet_id: c.id, role: "titulaire", profession, onboarding_step: "presence",
      }).select("id").single();
      if (e2 || !p) return fail("Impossible de créer votre profil.");
      setCabinetId(c.id); setProId(p.id); setSaving(false); setStep("presence"); return;
    }

    if (step === "presence") {
      if (cabinetId) await supabase.from("cabinets").update({ site_web: url(web.site), google_business_url: url(web.google), google_reviews_url: url(web.google) }).eq("id", cabinetId);
      await supabase.from("professionals").update({ linkedin_url: avecPrefixe(LINKEDIN_PREFIX, web.linkedin), onboarding_step: "expertise" }).eq("id", proId);
      fetch("/api/google/sync", { method: "POST" }).catch(() => {}); // note + avis Google, en arrière-plan
      setSaving(false); setStep("expertise"); return;
    }

    if (step === "expertise") {
      await supabase.from("pro_specialites").delete().eq("professional_id", proId);
      if (specs.length) await supabase.from("pro_specialites").insert(specs.map((id) => ({ professional_id: proId, specialite_id: id })));
      await supabase.from("professionals").update({ domaines: selectionParDomaine(taxo, specs).map((d) => d.id), onboarding_step: "motifs" }).eq("id", proId);
      setMotifs(motifsDepuisSpecialites(profession, taxo, specs));
      setSaving(false); setStep("motifs"); return;
    }

    if (step === "motifs") {
      const valides = motifs.filter((m) => m.libelle.trim());
      if (!valides.some((m) => m.actif)) return fail("Gardez au moins un motif actif.");
      await supabase.from("motifs").delete().eq("professional_id", proId);
      const { error: e1 } = await supabase.from("motifs").insert(valides.map((m, i) => ({
        professional_id: proId, libelle: m.libelle.trim(), description: m.description.trim() || null, duree_min: m.duree_min,
        modes: m.modes, prix_type: "gratuit", prix_euros: null, actif: m.actif, ordre: i,
        domaine_id: (m as MotifDraft & { domaine_id?: string | null }).domaine_id ?? null,
      })));
      if (e1) return fail("Impossible d'enregistrer les motifs.");
      await supabase.from("professionals").update({ onboarding_step: "horaires" }).eq("id", proId);
      await fetch("/api/notif/inscription", { method: "POST" }).catch(() => {});
      window.location.href = "/dashboard";
    }
  }

  const Titre = ({ t, s }: { t: string; s: string }) => (
    <div><h1 className="text-3xl font-medium tracking-tight text-gray-950">{t}</h1><p className="mt-2 text-sm text-gray-600">{s}</p></div>
  );
  const Suivant = ({ disabled = false, children = "Continuer" }: { disabled?: boolean; children?: React.ReactNode }) => (
    <div className="flex items-center gap-4 pt-2">
      <button type="submit" disabled={saving || disabled} className={btn}>{saving ? "Enregistrement…" : children}</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-white">
      <div className="bg-brand-gradient absolute inset-x-2 top-2 h-56 rounded-[2rem] opacity-70" />
      <div className="relative mx-auto max-w-2xl px-6 py-10">
        <p className="text-lg font-bold tracking-tight text-gray-950">{conf.brand}</p>

        <ol className="mt-8 grid grid-cols-5 gap-2">
          {ETAPES.map((e, i) => (
            <li key={e.id}>
              <div className={`h-1 rounded-full ${i <= idx ? "bg-gray-950" : "bg-gray-950/15"}`} />
              <p className={`mt-2 hidden text-xs sm:block ${i === idx ? "font-semibold text-gray-950" : "text-gray-950/50"}`}>{i + 1}. {e.label}</p>
            </li>
          ))}
        </ol>

        <form onSubmit={suivant} className="mt-10 space-y-6 rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-8">
          {step === "vous" && (
            <>
              <Titre t="Vous" s="Ces informations s'affichent sur votre page de prise de rendez-vous." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className={label}>Prénom</label><input required className={input} value={vous.prenom} onChange={(e) => setVous({ ...vous, prenom: e.target.value })} /></div>
                <div><label className={label}>Nom</label><input required className={input} value={vous.nom} onChange={(e) => setVous({ ...vous, nom: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className={label}>Téléphone</label><input type="tel" className={input} value={vous.telephone} onChange={(e) => setVous({ ...vous, telephone: e.target.value })} placeholder="06 12 34 56 78" /></div>
              </div>
              <div><label className={label}>Photo</label><AvatarUploader userId={userId} value={photo} onChange={setPhoto} /></div>
              <div>
                <label className={label}>Présentation <span className="font-normal text-gray-400">(facultatif)</span></label>
                <textarea rows={4} className={input} value={vous.bio} onChange={(e) => setVous({ ...vous, bio: e.target.value })}
                  placeholder={profession === "avocat" ? "Avocat au barreau de… depuis…, j'accompagne particuliers et entreprises en…" : "Expert-comptable depuis…, j'accompagne…"} />
              </div>
              <Suivant />
            </>
          )}

          {step === "cabinet" && (
            <>
              <Titre t="Votre cabinet" s="Saisissez votre SIRET : on remplit le reste pour vous." />
              <div className="rounded-2xl bg-gray-50 p-5 ring-1 ring-black/5">
                <label className={label}>SIRET du cabinet</label>
                <div className="flex gap-2">
                  <input className={input} value={siret} onChange={(e) => { setSiret(e.target.value); setSiretStatus("idle"); }} placeholder="14 chiffres" inputMode="numeric" />
                  <button type="button" onClick={chercherSiret} className="shrink-0 rounded-full bg-gray-950 px-5 text-sm font-medium text-white hover:bg-gray-800">
                    {siretStatus === "loading" ? "…" : "Rechercher"}
                  </button>
                </div>
                {siretStatus === "found" && <p className="mt-2 text-sm text-green-700">✓ Cabinet trouvé : vérifiez les informations ci-dessous.</p>}
                {siretStatus === "notfound" && <p className="mt-2 text-sm text-gray-600">SIRET introuvable : remplissez les champs à la main.</p>}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                <div className="sm:col-span-6"><label className={label}>Nom du cabinet</label><input required className={input} value={cab.nom} onChange={(e) => setCab({ ...cab, nom: e.target.value })} /></div>
                <div className="sm:col-span-6"><label className={label}>Adresse du cabinet</label>
                  <AdresseAutocomplete required className={input} value={cab.adresse} onChange={(v) => setCab((c) => ({ ...c, adresse: v }))} onSelect={remplirDepuisGoogle} />
                  <p className="mt-1.5 text-xs text-gray-500">Tapez le nom de votre cabinet ou son adresse : on récupère l&apos;adresse, le téléphone et votre fiche Google.</p></div>
                <div className="sm:col-span-2"><label className={label}>Code postal</label><input required className={input} value={cab.code_postal} onChange={(e) => setCab({ ...cab, code_postal: e.target.value })} /></div>
                <div className="sm:col-span-4"><label className={label}>Ville</label><input required className={input} value={cab.ville} onChange={(e) => setCab({ ...cab, ville: e.target.value })} /></div>
                <div className="sm:col-span-3"><label className={label}>Téléphone du cabinet</label><input type="tel" className={input} value={cab.telephone} onChange={(e) => setCab({ ...cab, telephone: e.target.value })} placeholder={vous.telephone || "01 23 45 67 89"} /></div>
                {profession === "avocat" && (
                  <div className="sm:col-span-3"><label className={label}>Barreau</label><input className={input} value={cab.barreau} onChange={(e) => setCab({ ...cab, barreau: e.target.value })} placeholder="Paris, Lyon…" /></div>
                )}
              </div>
              <Suivant />
            </>
          )}

          {step === "presence" && (
            <>
              <Titre t="Votre présence en ligne" s="Affichée sur votre page de rendez-vous. Tout est facultatif et modifiable plus tard." />
              <div className="space-y-4">
                <div><label className={label}>Site internet</label><PrefixInput prefix="https://" value={web.site} onChange={(v) => setWeb({ ...web, site: v })} placeholder="www.votre-cabinet.fr" /></div>
                <div>
                  <label className={label}>Lien de votre fiche Google</label>
                  <PrefixInput prefix="https://" value={web.google} onChange={(v) => setWeb({ ...web, google: v })} placeholder="share.google/… ou maps.app.goo.gl/…" />
                  <p className="mt-1.5 text-xs text-gray-500">Sur Google Maps, ouvrez votre fiche puis « Partager » → « Copier le lien ». Votre note et vos avis Google s&apos;afficheront automatiquement sur votre page.</p>
                </div>
                <div><label className={label}>Profil LinkedIn</label><PrefixInput prefix={LINKEDIN_PREFIX} strip={LINKEDIN_STRIP} value={web.linkedin} onChange={(v) => setWeb({ ...web, linkedin: v })} placeholder="votre-profil" /></div>
              </div>
              <Suivant />
            </>
          )}

          {step === "expertise" && (
            <>
              <Titre t="Vos spécialités" s="Ouvrez chaque domaine et cochez vos spécialités : elles s'affichent sur votre page, et on prépare vos motifs de rendez-vous à partir de vos choix." />
              <SpecialitesPicker taxo={taxo} value={specs} onChange={setSpecs} />
              <Suivant disabled={!specs.length}>Générer mes motifs</Suivant>
            </>
          )}

          {step === "motifs" && (
            <>
              <Titre t="Vos motifs de rendez-vous" s="Préparés à partir de vos spécialités. Ajustez librement le libellé, la durée et le format." />
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600 ring-1 ring-black/5">
                « <strong className="text-gray-950">Suivi de dossier existant</strong> » est toujours proposé en premier à vos clients : inutile de le créer.
              </div>
              <MotifsEditor motifs={motifs} onChange={setMotifs} />
              <Suivant>Terminer</Suivant>
            </>
          )}
        </form>

        {idx > 2 && (
          <button type="button" onClick={() => setStep(ETAPES[idx - 1].id)} className="mt-4 text-sm text-gray-500 underline hover:text-gray-950">← Étape précédente</button>
        )}
      </div>
    </div>
  );
}
