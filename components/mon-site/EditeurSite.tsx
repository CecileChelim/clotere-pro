"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Apercu } from "@/components/mon-site/Apercu";
import { Onglets } from "@/components/dashboard/EnTetePage";
import { PALETTES } from "@/lib/site/palettes";
import { PRIX } from "@/lib/tarifs";
import { SECTIONS, TEMPLATES, type Contenu, type SectionId, type SiteRendu, type TemplateId } from "@/lib/site/types";

/* Éditeur du site dans l'espace pro : textes section par section, photos, style, couleurs et sections, avec aperçu en direct. */

const champ = "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-950 outline-none focus:border-gray-950";
const lab = "mb-1 block text-xs font-medium text-gray-500";

type Etat = { template: TemplateId; palette: string; sections: SectionId[]; contenu: Contenu; couverture: string | null; portrait: string | null; complement: string; email: string };

export type OngletSite = "textes" | "design" | "messages" | "publication";

export function EditeurSite({ initial, userId, messages, publication, nbNonLus = 0, ongletInitial = "textes" }: {
  initial: SiteRendu; userId: string; messages: React.ReactNode; publication: React.ReactNode; nbNonLus?: number; ongletInitial?: OngletSite;
}) {
  const [e, setE] = useState<Etat>({
    template: initial.template, palette: initial.palette, sections: initial.sections, contenu: initial.contenu,
    couverture: initial.couverture, portrait: initial.pro.photo, complement: initial.cabinet.complement ?? "", email: initial.cabinet.email ?? "",
  });
  const [onglet, setOnglet] = useState<OngletSite>(ongletInitial);
  const [ouvert, setOuvert] = useState<string>("hero");
  const [sauve, setSauve] = useState<"ok" | "modifie" | "envoi" | "erreur">("ok");

  const maj = (p: Partial<Etat>) => { setE((x) => ({ ...x, ...p })); setSauve("modifie"); };
  const majC = <K extends keyof Contenu>(k: K, v: Contenu[K]) => maj({ contenu: { ...e.contenu, [k]: v } });

  const rendu: SiteRendu = useMemo(() => ({
    ...initial, template: e.template, palette: e.palette, sections: e.sections, contenu: e.contenu, couverture: e.couverture,
    pro: { ...initial.pro, photo: e.portrait }, cabinet: { ...initial.cabinet, complement: e.complement || null, email: e.email || null }, apercu: true,
  }), [initial, e]);

  async function enregistrer() {
    setSauve("envoi");
    const r = await fetch("/api/site", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: e.template, palette: e.palette, sections: e.sections, contenu: e.contenu, photo_couverture: e.couverture, photo_portrait: e.portrait, complement_adresse: e.complement, email_contact: e.email }),
    }).catch(() => null);
    setSauve(r?.ok ? "ok" : "erreur");
  }

  const c = e.contenu;
  const actif = (s: SectionId) => e.sections.includes(s);

  const ONGLETS: { id: OngletSite; label: React.ReactNode }[] = [
    { id: "textes", label: "Textes & photos" },
    { id: "design", label: "Style & sections" },
    { id: "messages", label: <>Messages{nbNonLus > 0 && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">{nbNonLus}</span>}</> },
    { id: "publication", label: "Publication & offre" },
  ];

  return (
    <>
    <Onglets onglets={ONGLETS} actif={onglet} onChange={setOnglet} />
    {onglet === "messages" ? <div className="mt-6">{messages}</div> : onglet === "publication" ? <div className="mt-6">{publication}</div> : (
    <div className="mt-6 grid gap-8 xl:grid-cols-[420px_1fr]">
      <div className="min-w-0">
        <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between gap-3 bg-white px-1 py-2">
          <p className="text-sm text-gray-500">{onglet === "textes" ? "Cliquez sur une section pour modifier ses textes." : "Changez de style, de couleurs et de sections."}</p>
          <button type="button" onClick={enregistrer} disabled={sauve === "ok" || sauve === "envoi"} className="btn-solid shrink-0 px-4 py-2 disabled:opacity-40">
            {sauve === "envoi" ? "Enregistrement…" : sauve === "ok" ? "Enregistré ✓" : "Enregistrer"}
          </button>
        </div>
        {sauve === "erreur" && <p className="mt-2 text-sm text-red-600">L&apos;enregistrement a échoué, réessayez.</p>}

        {onglet === "textes" ? (
          <div className="mt-2">
            <Bloc ouvert={ouvert} setOuvert={setOuvert} id="hero" titre="En-tête">
              <Champ l="Sur-titre" v={c.hero.surtitre} on={(v) => majC("hero", { ...c.hero, surtitre: v })} />
              <Champ l="Titre" v={c.hero.titre} on={(v) => majC("hero", { ...c.hero, titre: v })} long />
              <Champ l="Accroche" v={c.hero.accroche} on={(v) => majC("hero", { ...c.hero, accroche: v })} long />
              <Photo l="Image de couverture" v={e.couverture} userId={userId} on={(v) => maj({ couverture: v })} />
              {e.template !== "light" && (
                <div className="space-y-2">
                  <p className={lab}>Chiffres clés</p>
                  {c.chiffres.map((x, i) => (
                    <div key={i} className="grid grid-cols-[100px_1fr] gap-2">
                      <input className={champ} value={x.valeur} onChange={(ev) => majC("chiffres", c.chiffres.map((y, j) => (j === i ? { ...y, valeur: ev.target.value } : y)))} />
                      <input className={champ} value={x.label} onChange={(ev) => majC("chiffres", c.chiffres.map((y, j) => (j === i ? { ...y, label: ev.target.value } : y)))} />
                    </div>
                  ))}
                </div>
              )}
            </Bloc>
            {actif("apropos") && (
              <Bloc ouvert={ouvert} setOuvert={setOuvert} id="apropos" titre="À propos">
                <Champ l="Titre" v={c.apropos.titre} on={(v) => majC("apropos", { ...c.apropos, titre: v })} />
                <Champ l="Présentation" v={c.apropos.texte} on={(v) => majC("apropos", { ...c.apropos, texte: v })} long />
                <Champ l="Deuxième paragraphe" v={c.apropos.texte2} on={(v) => majC("apropos", { ...c.apropos, texte2: v })} long />
                <Champ l="Signature" v={c.apropos.signature} on={(v) => majC("apropos", { ...c.apropos, signature: v })} />
                <Photo l="Votre portrait" v={e.portrait} userId={userId} on={(v) => maj({ portrait: v })} />
              </Bloc>
            )}
            {actif("domaines") && (
              <Bloc ouvert={ouvert} setOuvert={setOuvert} id="domaines" titre={c.domaines.titre || "Domaines"}>
                <Champ l="Titre" v={c.domaines.titre} on={(v) => majC("domaines", { ...c.domaines, titre: v })} />
                <Champ l="Introduction" v={c.domaines.intro} on={(v) => majC("domaines", { ...c.domaines, intro: v })} />
                <Liste items={c.domaines.items} vide={{ titre: "", texte: "" }} max={8} libelleAjout="Ajouter un domaine"
                  on={(items) => majC("domaines", { ...c.domaines, items })}
                  rendu={(x, set) => <><input className={champ} placeholder="Titre" value={x.titre} onChange={(ev) => set({ ...x, titre: ev.target.value })} /><textarea rows={2} className={champ} placeholder="Description" value={x.texte} onChange={(ev) => set({ ...x, texte: ev.target.value })} /></>} />
              </Bloc>
            )}
            {actif("approche") && (
              <Bloc ouvert={ouvert} setOuvert={setOuvert} id="approche" titre={c.approche.titre || "Approche"}>
                <Champ l="Titre" v={c.approche.titre} on={(v) => majC("approche", { ...c.approche, titre: v })} />
                <Champ l="Texte" v={c.approche.texte} on={(v) => majC("approche", { ...c.approche, texte: v })} long />
                {c.approche.points.map((p, i) => <Champ key={i} l={`Point fort ${i + 1}`} v={p} on={(v) => majC("approche", { ...c.approche, points: c.approche.points.map((y, j) => (j === i ? v : y)) })} />)}
              </Bloc>
            )}
            {actif("methode") && (
              <Bloc ouvert={ouvert} setOuvert={setOuvert} id="methode" titre="Méthode">
                <Champ l="Titre" v={c.methode.titre} on={(v) => majC("methode", { ...c.methode, titre: v })} />
                <Liste items={c.methode.etapes} vide={{ titre: "", texte: "" }} max={6} libelleAjout="Ajouter une étape"
                  on={(etapes) => majC("methode", { ...c.methode, etapes })}
                  rendu={(x, set) => <><input className={champ} placeholder="Étape" value={x.titre} onChange={(ev) => set({ ...x, titre: ev.target.value })} /><textarea rows={2} className={champ} placeholder="Description" value={x.texte} onChange={(ev) => set({ ...x, texte: ev.target.value })} /></>} />
              </Bloc>
            )}
            {actif("honoraires") && (
              <Bloc ouvert={ouvert} setOuvert={setOuvert} id="honoraires" titre="Honoraires">
                <Champ l="Titre" v={c.honoraires.titre} on={(v) => majC("honoraires", { ...c.honoraires, titre: v })} />
                <Champ l="Texte" v={c.honoraires.texte} on={(v) => majC("honoraires", { ...c.honoraires, texte: v })} long />
                <p className="text-xs text-gray-500">Modes de facturation, moyens de paiement et services : à cocher dans <Link href="/dashboard/fiche" className="underline">Profil</Link> → Honoraires.</p>
              </Bloc>
            )}
            {actif("avis") && (
              <Bloc ouvert={ouvert} setOuvert={setOuvert} id="avis" titre="Avis Google">
                <Champ l="Titre" v={c.avis.titre} on={(v) => majC("avis", { titre: v })} />
                <p className="text-xs text-gray-500">Votre note et vos avis (4★ et plus) viennent de votre fiche Google. Renseignez le lien de votre fiche dans <Link href="/dashboard/fiche" className="underline">Profil</Link> : sans avis Google, la section est masquée.</p>
              </Bloc>
            )}
            {actif("faq") && (
              <Bloc ouvert={ouvert} setOuvert={setOuvert} id="faq" titre="FAQ">
                <Champ l="Titre" v={c.faq.titre} on={(v) => majC("faq", { ...c.faq, titre: v })} />
                <Liste items={c.faq.items} vide={{ q: "", r: "" }} max={10} libelleAjout="Ajouter une question"
                  on={(items) => majC("faq", { ...c.faq, items })}
                  rendu={(x, set) => <><input className={champ} placeholder="Question" value={x.q} onChange={(ev) => set({ ...x, q: ev.target.value })} /><textarea rows={3} className={champ} placeholder="Réponse" value={x.r} onChange={(ev) => set({ ...x, r: ev.target.value })} /></>} />
              </Bloc>
            )}
            {actif("actualites") && initial.formule === "rdv" && (
              <Bloc ouvert={ouvert} setOuvert={setOuvert} id="actualites" titre="Actualités">
                <Champ l="Titre" v={c.actualites.titre} on={(v) => majC("actualites", { ...c.actualites, titre: v })} />
                <Liste items={c.actualites.items} vide={{ titre: "", date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), texte: "" }} max={12} libelleAjout="Ajouter un article"
                  on={(items) => majC("actualites", { ...c.actualites, items })}
                  rendu={(x, set) => <><input className={champ} placeholder="Titre de l'article" value={x.titre} onChange={(ev) => set({ ...x, titre: ev.target.value })} /><input className={champ} placeholder="Date" value={x.date} onChange={(ev) => set({ ...x, date: ev.target.value })} /><textarea rows={6} className={champ} placeholder="Texte" value={x.texte} onChange={(ev) => set({ ...x, texte: ev.target.value })} /></>} />
                <p className="text-xs text-gray-500">Les 3 derniers articles s&apos;affichent sur votre page d&apos;accueil.</p>
              </Bloc>
            )}
            {actif("contact") && (
              <Bloc ouvert={ouvert} setOuvert={setOuvert} id="contact" titre={initial.formule === "rdv" ? "Rendez-vous & coordonnées" : "Contact & coordonnées"}>
                <Champ l="Titre" v={c.contact.titre} on={(v) => majC("contact", { ...c.contact, titre: v })} />
                <Champ l="Texte" v={c.contact.texte} on={(v) => majC("contact", { ...c.contact, texte: v })} long />
                <Champ l="Horaires" v={c.contact.horaires} on={(v) => majC("contact", { ...c.contact, horaires: v })} />
                <Champ l="E-mail affiché sur le site" v={e.email} on={(v) => maj({ email: v })} />
                <Champ l="Complément d'adresse" v={e.complement} on={(v) => maj({ complement: v })} />
                <p className="text-xs text-gray-500">Nom du cabinet, adresse et téléphone se modifient dans <Link href="/dashboard/fiche" className="underline">Profil</Link>.{initial.formule === "rdv" && <> Les motifs de rendez-vous et vos horaires, dans <Link href="/dashboard/agenda" className="underline">Agenda</Link>.</>}</p>
              </Bloc>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-8">
            <div>
              <p className="text-sm font-semibold text-gray-950">Style</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button key={t.id} type="button" onClick={() => maj({ template: t.id })} className={`rounded-xl p-3 text-left text-sm ring-1 ${e.template === t.id ? "bg-gray-50 ring-2 ring-gray-950" : "ring-gray-200"}`}>
                    <span className="block font-semibold text-gray-950">{t.nom}</span><span className="block text-xs text-gray-500">{t.accroche}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-950">Couleurs</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {PALETTES.map((p) => (
                  <button key={p.id} type="button" onClick={() => maj({ palette: p.id })} className={`rounded-xl p-2 text-left ring-1 ${e.palette === p.id ? "bg-gray-50 ring-2 ring-gray-950" : "ring-gray-200"}`}>
                    <span className="flex h-7 overflow-hidden rounded-md ring-1 ring-black/10">{[p.fond2, p.accent, p.sombre].map((x, i) => <span key={i} className="flex-1" style={{ background: x }} />)}</span>
                    <span className="mt-1 block truncate text-xs text-gray-600">{p.nom}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-950">Sections de la page d&apos;accueil</p>
              <div className="mt-3 space-y-1.5">
                {SECTIONS.map((s) => {
                  const bloque = s.formule === "rdv" && initial.formule === "contact";
                  return (
                    <label key={s.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ring-1 ring-gray-100 ${bloque ? "opacity-50" : ""}`}>
                      <input type="checkbox" disabled={bloque} checked={actif(s.id) && !bloque} className="h-4 w-4 accent-gray-950"
                        onChange={() => maj({ sections: actif(s.id) ? e.sections.filter((x) => x !== s.id) : [...e.sections, s.id] })} />
                      <span className="flex-1"><span className="font-medium text-gray-950">{s.label}</span> <span className="text-gray-500">· {s.description}</span></span>
                      {bloque && <span className="text-xs text-violet-700">Offre {PRIX.siteRdv} €</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="min-w-0 xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)]"><Apercu d={rendu} className="h-[70vh] xl:h-full" /></div>
    </div>
    )}
    </>
  );
}

function Bloc({ id, titre, ouvert, setOuvert, children }: { id: string; titre: string; ouvert: string; setOuvert: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100">
      <button type="button" onClick={() => setOuvert(ouvert === id ? "" : id)} className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-gray-950">
        {titre}<span className="text-gray-400">{ouvert === id ? "−" : "+"}</span>
      </button>
      {ouvert === id && <div className="space-y-3 pb-5">{children}</div>}
    </div>
  );
}

function Champ({ l, v, on, long = false }: { l: string; v: string; on: (v: string) => void; long?: boolean }) {
  return (
    <div>
      <label className={lab}>{l}</label>
      {long ? <textarea rows={3} className={champ} value={v} onChange={(ev) => on(ev.target.value)} /> : <input className={champ} value={v} onChange={(ev) => on(ev.target.value)} />}
    </div>
  );
}

function Liste<T>({ items, on, rendu, vide, max, libelleAjout }: { items: T[]; on: (x: T[]) => void; rendu: (x: T, set: (v: T) => void) => React.ReactNode; vide: T; max: number; libelleAjout: string }) {
  return (
    <div className="space-y-3">
      {items.map((x, i) => (
        <div key={i} className="space-y-2 rounded-xl bg-gray-50 p-3 ring-1 ring-black/5">
          {rendu(x, (v) => on(items.map((y, j) => (j === i ? v : y))))}
          <div className="flex justify-end gap-3 text-xs text-gray-500">
            {i > 0 && <button type="button" onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; on(n); }} className="hover:text-gray-950">↑ Monter</button>}
            <button type="button" onClick={() => on(items.filter((_, j) => j !== i))} className="hover:text-red-600">Supprimer</button>
          </div>
        </div>
      ))}
      {items.length < max && <button type="button" onClick={() => on([...items, vide])} className="text-sm font-medium text-gray-950 underline underline-offset-2">+ {libelleAjout}</button>}
    </div>
  );
}

function Photo({ l, v, on, userId }: { l: string; v: string | null; on: (v: string | null) => void; userId: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [etat, setEtat] = useState<"" | "envoi" | "erreur">("");
  async function choisir(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > 6 * 1024 * 1024) { setEtat("erreur"); return; }
    setEtat("envoi");
    const supabase = createClient();
    const chemin = `${userId}/${Date.now()}.${f.name.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("sites").upload(chemin, f, { upsert: false, contentType: f.type });
    if (error) { setEtat("erreur"); return; }
    on(supabase.storage.from("sites").getPublicUrl(chemin).data.publicUrl);
    setEtat("");
  }
  return (
    <div>
      <p className={lab}>{l}</p>
      <div className="flex items-center gap-3">
        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {v && <img src={v} alt="" className="h-full w-full object-cover" />}
        </div>
        <button type="button" onClick={() => ref.current?.click()} className="btn-outline px-3 py-2 text-xs">{etat === "envoi" ? "Envoi…" : v ? "Remplacer" : "Ajouter une photo"}</button>
        {v && <button type="button" onClick={() => on(null)} className="text-xs text-gray-500 hover:text-red-600">Retirer</button>}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={choisir} />
      </div>
      {etat === "erreur" && <p className="mt-1 text-xs text-red-600">Image refusée (6 Mo maximum) ou envoi impossible.</p>}
    </div>
  );
}
