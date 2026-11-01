"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AvatarUploader } from "@/components/onboarding/AvatarUploader";
import { AdresseAutocomplete } from "./AdresseAutocomplete";
import { selectionParDomaine, type Domaine } from "@/lib/taxonomie";
import { SpecialitesPicker } from "./SpecialitesPicker";
import { HonorairesEditor } from "./HonorairesEditor";
import { avecPrefixe, LINKEDIN_PREFIX, LINKEDIN_STRIP, PrefixInput } from "./PrefixInput";

const input = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-950";
const label = "mb-1.5 block text-sm font-medium text-gray-950";

type Cabinet = {
  id: string; nom: string; adresse: string | null; code_postal: string | null; ville: string | null; telephone: string | null;
  site_web: string | null; google_rating: number | null; google_reviews_count: number | null; google_reviews_url: string | null; google_business_url?: string | null;
};
type Pro = { linkedin_url?: string | null; profession?: string; domaines?: string[] | null; honoraires_modes?: string[] | null; paiement_moyens?: string[] | null; services?: string[] | null; role?: string; id: string; auth_user_id: string; prenom: string; nom: string; telephone: string | null; email: string; photo_url: string | null; bio: string | null };

export function ProfilForm({ pro, cabinet, taxo, specsInit }: { pro: Pro; cabinet: Cabinet | null; taxo: Domaine[]; specsInit: string[] }) {
  const supabase = useMemo(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), []);
  const [f, setF] = useState({ prenom: pro.prenom, nom: pro.nom, telephone: pro.telephone ?? "", bio: pro.bio ?? "", linkedin_url: pro.linkedin_url ?? "" });
  const [photo, setPhoto] = useState<string | null>(pro.photo_url);
  const [cab, setCab] = useState({
    nom: cabinet?.nom ?? "", adresse: cabinet?.adresse ?? "", code_postal: cabinet?.code_postal ?? "", ville: cabinet?.ville ?? "",
    telephone: cabinet?.telephone ?? "", site_web: cabinet?.site_web ?? "", google_reviews_url: cabinet?.google_business_url ?? cabinet?.google_reviews_url ?? "",
  });
  const titulaire = pro.role !== "membre";
  const [specs, setSpecs] = useState<string[]>(specsInit);
  const [hono, setHono] = useState({
    honoraires_modes: pro.honoraires_modes ?? [], paiement_moyens: pro.paiement_moyens ?? [], services: pro.services ?? [],
  });
  const TABS = [
    ["profil", "Profil"], ...(cabinet ? [["cabinet", "Cabinet"]] : []), ["expertise", "Expertise"], ...(pro.profession === "comptable" ? [] : [["honoraires", "Honoraires"]]),
  ] as [string, string][];
  const [tab, setTab] = useState("profil");
  // Les onglets masqués restent montés : rien n'est perdu en passant de l'un à l'autre, tout s'enregistre d'un coup.
  const sec = (t: string) => (t === tab ? "space-y-4" : "hidden");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const { error: e1 } = await supabase.from("professionals").update({ ...f, linkedin_url: avecPrefixe(LINKEDIN_PREFIX, f.linkedin_url.replace(/^https?:\/\//, "").replace(LINKEDIN_STRIP[0], "")), ...hono, photo_url: photo, domaines: selectionParDomaine(taxo, specs).map((d) => d.id) }).eq("id", pro.id);
    await supabase.from("pro_specialites").delete().eq("professional_id", pro.id);
    if (specs.length) await supabase.from("pro_specialites").insert(specs.map((id) => ({ professional_id: pro.id, specialite_id: id })));
    let e4 = null;
    if (cabinet && titulaire) {
      const site = cab.site_web ? avecPrefixe("https://", cab.site_web.replace(/^https?:\/\//, "")) : null;
      const fiche = cab.google_reviews_url ? avecPrefixe("https://", cab.google_reviews_url.replace(/^https?:\/\//, "")) : null;
      ({ error: e4 } = await supabase.from("cabinets").update({ ...cab, site_web: site || null, google_reviews_url: fiche, google_business_url: fiche }).eq("id", cabinet.id));
    }
    await supabase.from("professionals").update({ ville: cab.ville, cabinet: cab.nom }).eq("id", pro.id);
    setStatus(e1 || e4 ? "error" : "saved");
    // Rafraîchit la note et les avis Google à partir du nom et de l'adresse du cabinet.
    if (cabinet && titulaire) fetch("/api/google/sync", { method: "POST" }).catch(() => {});
  }

  return (
    <form onSubmit={save} className="mt-8">
      <div className="-mx-1 mb-8 flex gap-1 overflow-x-auto border-b border-gray-100 px-1">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 pb-3 text-sm font-medium transition ${tab === id ? "border-gray-950 text-gray-950" : "border-transparent text-gray-500 hover:text-gray-950"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-12">
      <section className={sec("profil")}>
        <p className="eyebrow">Informations</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className={label}>Prénom</label><input required className={input} value={f.prenom} onChange={(e) => setF({ ...f, prenom: e.target.value })} /></div>
          <div><label className={label}>Nom</label><input required className={input} value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} /></div>
          <div><label className={label}>Téléphone</label><input className={input} value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} /></div>
          <div><label className={label}>Email</label><input disabled className={`${input} bg-gray-50 text-gray-500`} value={pro.email} /></div>
          <div className="sm:col-span-2"><label className={label}>Profil LinkedIn</label><PrefixInput prefix={LINKEDIN_PREFIX} strip={LINKEDIN_STRIP} value={f.linkedin_url} onChange={(v) => setF({ ...f, linkedin_url: v })} placeholder="votre-profil" /></div>
        </div>
      </section>

      {cabinet && (
        <section className={sec("cabinet")}>
          <p className="eyebrow">Cabinet</p>
          {!titulaire && <p className="text-sm text-gray-500">Seul le titulaire du compte cabinet peut modifier ces informations.</p>}
          <fieldset disabled={!titulaire} className="grid grid-cols-1 gap-4 sm:grid-cols-6 disabled:opacity-60">
            <div className="sm:col-span-6"><label className={label}>Nom du cabinet</label><input required className={input} value={cab.nom} onChange={(e) => setCab({ ...cab, nom: e.target.value })} /></div>
            <div className="sm:col-span-6"><label className={label}>Adresse</label>
              <AdresseAutocomplete className={input} value={cab.adresse} onChange={(v) => setCab((c) => ({ ...c, adresse: v }))}
                onSelect={(l) => setCab((c) => ({ ...c, adresse: l.adresse || c.adresse, code_postal: l.code_postal || c.code_postal, ville: l.ville || c.ville,
                  telephone: c.telephone || l.telephone || "", site_web: c.site_web || (l.site ?? "").replace(/^https?:\/\//, ""),
                  google_reviews_url: c.google_reviews_url || (l.google_url ?? "") }))} /></div>
            <div className="sm:col-span-2"><label className={label}>Code postal</label><input className={input} value={cab.code_postal} onChange={(e) => setCab({ ...cab, code_postal: e.target.value })} /></div>
            <div className="sm:col-span-4"><label className={label}>Ville</label><input className={input} value={cab.ville} onChange={(e) => setCab({ ...cab, ville: e.target.value })} /></div>
            <div className="sm:col-span-3"><label className={label}>Téléphone du cabinet</label><input className={input} value={cab.telephone} onChange={(e) => setCab({ ...cab, telephone: e.target.value })} /></div>
            <div className="sm:col-span-3"><label className={label}>Site internet</label><PrefixInput prefix="https://" value={cab.site_web} onChange={(v) => setCab({ ...cab, site_web: v })} placeholder="www.votre-cabinet.fr" /></div>
            <div className="sm:col-span-6"><label className={label}>Lien de votre fiche Google</label><PrefixInput prefix="https://" value={cab.google_reviews_url} onChange={(v) => setCab({ ...cab, google_reviews_url: v })} placeholder="share.google/… ou maps.app.goo.gl/…" /></div>
          </fieldset>
          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-sm ring-1 ring-black/5">
            <span className="text-amber-400">★</span>
            {cabinet.google_rating
              ? <span className="text-gray-700"><strong className="text-gray-950">{String(cabinet.google_rating).replace(".", ",")}</strong> · {cabinet.google_reviews_count ?? 0} avis Google — récupérés automatiquement depuis votre fiche</span>
              : <span className="text-gray-600">Votre note et vos avis Google sont récupérés automatiquement à partir du nom et de l'adresse du cabinet, à chaque enregistrement.</span>}
          </div>
        </section>
      )}

      <section className={sec("expertise")}>
        <p className="eyebrow">Domaines &amp; spécialités</p>
        <p className="text-sm text-gray-600">Ouvrez chaque domaine et cochez vos spécialités : elles s&apos;affichent sur votre page de prise de rendez-vous.</p>
        <SpecialitesPicker taxo={taxo} value={specs} onChange={setSpecs} />
      </section>

      <section className={sec("honoraires")}>
        <p className="eyebrow">Honoraires</p>
        <HonorairesEditor value={hono} onChange={setHono} />
      </section>

      <section className={sec("profil")}>
        <p className="eyebrow">Photo</p>
        <AvatarUploader userId={pro.auth_user_id} value={photo} onChange={setPhoto} />
      </section>

      <section className={sec("profil")}>
        <p className="eyebrow">Présentation</p>
        <textarea rows={5} className={input} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })}
          placeholder="Votre parcours, vos domaines d'intervention, votre façon de travailler…" />
      </section>


      </div>

      <div className="sticky bottom-0 -mx-6 mt-10 flex items-center gap-4 border-t border-gray-100 bg-white/90 px-6 py-4 backdrop-blur sm:-mx-10 sm:px-10">
        <button disabled={status === "saving"} className="btn-solid disabled:opacity-60">{status === "saving" ? "Enregistrement…" : "Enregistrer"}</button>
        {status === "saved" && <span className="text-sm text-green-700">Modifications enregistrées.</span>}
        {status === "error" && <span className="text-sm text-red-600">Une erreur est survenue.</span>}
      </div>
    </form>
  );
}
