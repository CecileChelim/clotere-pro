"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { AdresseAutocomplete, type LieuDetail } from "@/components/pro/AdresseAutocomplete";
import { Apercu } from "@/components/mon-site/Apercu";
import { Logo } from "@/components/landing/SiteNav";
import { landingFonts } from "@/components/landing/fonts";
import { btnMd, btnPrimary, eyebrow } from "@/components/landing/styles";
import { PROFESSIONS, type Profession } from "@/lib/professions-config";
import { contenuParDefaut } from "@/lib/site/contenu";
import { PALETTES, palette } from "@/lib/site/palettes";
import { slugSite } from "@/lib/site/slug";
import { PRIX } from "@/lib/tarifs";
import { FLAG_SITE_CREE, pushEvent } from "@/lib/analytics";
import { SECTIONS, SECTIONS_PAR_DEFAUT, TEMPLATES, type Formule, type SectionId, type SiteRendu, type Taille, type TemplateId } from "@/lib/site/types";
import type { Brouillon } from "@/lib/site/serveur";

/* Créateur de site en libre-service (sur le modèle de Gatsia) :
   1. Votre cabinet → 2. Style → 3. Pages → 4. Contact ou rendez-vous → 5. Couleurs → 6. Inscription.
   Rien n'est enregistré en base avant l'inscription : le brouillon vit dans le navigateur (localStorage). */

type Etape = "cabinet" | "template" | "pages" | "offre" | "couleurs" | "inscription";
const ETAPES: { id: Etape; label: string }[] = [
  { id: "cabinet", label: "Cabinet" }, { id: "template", label: "Style" }, { id: "pages", label: "Pages" },
  { id: "offre", label: "Contact" }, { id: "couleurs", label: "Couleurs" }, { id: "inscription", label: "Enregistrer" },
];
export const CLE_BROUILLON = "clotere-site-brouillon";
const NOM_ETAPE: Record<Etape, string> = { cabinet: "cabinet", template: "style", pages: "pages", offre: "contact", couleurs: "couleurs", inscription: "enregistrer" };

const input = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-nuit outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/15";
const label = "mb-1.5 block text-sm font-semibold text-nuit";
const aide = "mt-1.5 text-sm text-gray-500";
const btnNoir = `${btnPrimary} ${btnMd} w-full gap-2 disabled:opacity-40 disabled:drop-shadow-none`;
/** Carte sélectionnable (taille, style, offre, couleurs). */
const carte = (on: boolean) => `ring-1 transition ${on ? "bg-brand-soft ring-2 ring-brand" : "bg-white ring-gray-200 hover:ring-gray-400"}`;
const emailValide = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim());

type Prefill = { prenom: string; nom: string; cabinet: Brouillon["cabinet"]; domaines: string[] } | null;

export function Createur({ profession, connecte, prefill }: { profession: Profession; connecte: boolean; prefill: Prefill }) {
  const conf = PROFESSIONS[profession];
  const supabase = useMemo(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), []);

  const [etape, setEtape] = useState<Etape>("cabinet");
  const [b, setB] = useState<Brouillon>(() => ({
    profession,
    cabinet: prefill?.cabinet ?? { nom: "", adresse: "", code_postal: "", ville: "", complement: "", telephone: "", email: "" },
    prenom: prefill?.prenom ?? "", nom: prefill?.nom ?? "", taille: "seul", domaines: prefill?.domaines ?? [],
    template: "light", sections: SECTIONS_PAR_DEFAUT, formule: "rdv", palette: "sauge",
  }));
  const [charge, setCharge] = useState(false);
  const [voirApercu, setVoirApercu] = useState(false);

  // Reprise d'un brouillon (même navigateur), puis sauvegarde à chaque modification.
  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE_BROUILLON);
      const x = brut ? (JSON.parse(brut) as Brouillon) : null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reprise du brouillon stocké dans le navigateur, au montage
      if (x && x.profession === profession) setB((cur) => ({ ...cur, ...x, cabinet: { ...cur.cabinet, ...x.cabinet } }));
    } catch { /* stockage indisponible */ }
    setCharge(true);
  }, [profession]);
  useEffect(() => {
    if (!charge) return;
    try { localStorage.setItem(CLE_BROUILLON, JSON.stringify(b)); } catch { /* stockage indisponible */ }
  }, [b, charge]);

  const maj = (p: Partial<Brouillon>) => setB((x) => ({ ...x, ...p }));
  const majCab = (p: Partial<Brouillon["cabinet"]>) => setB((x) => ({ ...x, cabinet: { ...x.cabinet, ...p } }));
  const idx = ETAPES.findIndex((e) => e.id === etape);
  const aller = (e: Etape) => { setEtape(e); window.scrollTo({ top: 0 }); };
  const suivant = () => aller(ETAPES[Math.min(idx + 1, ETAPES.length - 1)].id);
  // Tracking : un push à l'affichage de chaque étape (l'URL ne change pas). Aucune donnée saisie dans les paramètres.
  useEffect(() => {
    pushEvent({ event: "inscription_etape", etape: idx + 1, etape_nom: NOM_ETAPE[etape] });
  }, [etape, idx]);
  const precedent = () => (idx > 0 ? aller(ETAPES[idx - 1].id) : history.back());

  const nomCabinet = b.cabinet.nom || (b.nom ? `Cabinet ${b.nom}` : profession === "avocat" ? "Cabinet Dupont" : "Cabinet Martin");
  const rendu: SiteRendu = useMemo(() => {
    const prenom = b.prenom || (profession === "avocat" ? "Sophie" : "Thomas");
    const nom = b.nom || (profession === "avocat" ? "Laurent" : "Martin");
    const ville = b.cabinet.ville || "Bordeaux";
    return {
      profession, template: b.template, palette: b.palette, formule: b.formule, apercu: true, siteId: null,
      sections: b.formule === "contact" ? b.sections.filter((s) => s !== "actualites") : b.sections,
      slug: slugSite(prenom, nom, ville, b.cabinet.code_postal, b.domaines[0]),
      contenu: contenuParDefaut({ profession, prenom, nom, cabinet: nomCabinet, ville, taille: b.taille, domaines: b.domaines, formule: b.formule }),
      cabinet: { nom: nomCabinet, adresse: b.cabinet.adresse || "18 rue Marceau", complement: b.cabinet.complement || null, codePostal: b.cabinet.code_postal || "33000", ville, telephone: b.cabinet.telephone || "05 56 00 00 00", email: b.cabinet.email || null },
      pro: { prenom, nom, titre: conf.titre, photo: null }, couverture: null, lienRdv: null,
      motifs: conf.domaines.filter((d) => b.domaines.includes(d.id)).slice(0, 4).map((d) => ({ id: d.id, libelle: `${conf.prefixeMotif} – ${d.label}` })),
      avis: { note: null, nb: null, url: null, liste: [] },
      honoraires: { modes: [], paiement: [], services: [] },
    };
  }, [b, profession, conf, nomCabinet]);

  const cabinetOk = !!(b.cabinet.nom.trim() && b.prenom.trim() && b.nom.trim() && b.cabinet.ville.trim() && b.cabinet.telephone.trim() && emailValide(b.cabinet.email ?? ""));

  return (
    <div data-profession={profession} className={`${landingFonts} lp min-h-screen bg-brand-section font-sans text-nuit antialiased lg:flex`}>
      {/* ---------- Panneau des étapes ---------- */}
      <div className="bg-white lg:sticky lg:top-0 lg:h-screen lg:w-[480px] lg:shrink-0 lg:overflow-y-auto lg:shadow-xl">
        <div className="mx-auto max-w-lg px-6 pb-32 pt-6 lg:pb-10">
          <div className="flex items-center justify-between">
            <Logo badge={profession === "comptable" ? "EXPERTS-COMPTABLES" : "AVOCATS"} />
            <button type="button" onClick={precedent} className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-nuit">← Retour</button>
          </div>
          <ol className="mt-6 grid grid-cols-6 gap-1.5">
            {ETAPES.map((e, i) => (
              <li key={e.id}>
                <button type="button" disabled={i > idx && !cabinetOk} onClick={() => aller(e.id)} className="block w-full text-left disabled:cursor-not-allowed">
                  <span className={`block h-1.5 rounded-full ${i <= idx ? "bg-brand" : "bg-gray-200"}`} />
                  <span className={`mt-1.5 hidden text-[11px] sm:block ${i === idx ? "font-semibold text-brand" : "text-gray-400"}`}>{e.label}</span>
                </button>
              </li>
            ))}
          </ol>

          {etape === "cabinet" && (
            <section className="mt-10 space-y-9">
              <Titre t="Votre cabinet" s="Ces informations personnalisent votre site et son aperçu. Vous pourrez tout modifier ensuite." />
              <div>
                <label className={label}>Nom du cabinet</label>
                <input className={input} required value={b.cabinet.nom} onChange={(e) => majCab({ nom: e.target.value })} placeholder={profession === "avocat" ? "Cabinet Dupont" : "Cabinet Martin Expertise"} />
              </div>
              <div>
                <p className={label}>Votre nom</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="mb-1 block text-xs text-gray-500">Prénom</span><input className={input} value={b.prenom} onChange={(e) => maj({ prenom: e.target.value })} autoComplete="given-name" /></div>
                  <div><span className="mb-1 block text-xs text-gray-500">Nom</span><input className={input} value={b.nom} onChange={(e) => maj({ nom: e.target.value })} autoComplete="family-name" /></div>
                </div>
                <p className={aide}>Pour personnaliser votre aperçu{profession === "avocat" ? " (« Maître … »)" : ""}. Rien n&apos;est enregistré avant la création de votre compte.</p>
              </div>
              <div>
                <p className={label}>Combien êtes-vous ?</p>
                <p className={aide}>Adapte le ton des textes proposés.</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {([["seul", "Seul", profession === "avocat" ? "Avocat indépendant" : "Indépendant"], ["petit", "2 à 5", "Petit cabinet"], ["cabinet", "6 et +", "Cabinet"]] as [Taille, string, string][]).map(([v, t, s]) => (
                    <button key={v} type="button" onClick={() => maj({ taille: v })}
                      className={`rounded-2xl px-2 py-4 text-center ${carte(b.taille === v)}`}>
                      <span className="block text-base font-semibold text-nuit">{t}</span><span className="mt-0.5 block text-xs text-gray-500">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className={label}>Où exercez-vous ?</p>
                <p className="-mt-1 mb-2 text-sm text-gray-500">Tapez le nom de votre cabinet ou son adresse : on remplit le reste.</p>
                <div className="space-y-3">
                <AdresseAutocomplete src="createur" className={input} value={b.cabinet.adresse} placeholder="Nom du cabinet ou adresse"
                  onChange={(v) => majCab({ adresse: v })}
                  onSelect={(l: LieuDetail) => majCab({ adresse: l.adresse, code_postal: l.code_postal, ville: l.ville, telephone: b.cabinet.telephone || l.telephone || "", nom: b.cabinet.nom || l.nom || "" })} />
                <input className={input} value={b.cabinet.complement} onChange={(e) => majCab({ complement: e.target.value })} placeholder="Complément (bâtiment, étage…)" />
                <div className="grid grid-cols-[130px_1fr] gap-3">
                  <input className={input} value={b.cabinet.code_postal} onChange={(e) => majCab({ code_postal: e.target.value })} placeholder="Code postal" inputMode="numeric" />
                  <input className={input} value={b.cabinet.ville} onChange={(e) => majCab({ ville: e.target.value })} placeholder="Ville" />
                </div>
                </div>
              </div>
              <div>
                <p className={label}>Coordonnées du cabinet</p>
                <p className="-mt-1 mb-2 text-sm text-gray-500">Affichées sur votre site.</p>
                <div className="space-y-3">
                  <input className={input} required value={b.cabinet.telephone} onChange={(e) => majCab({ telephone: e.target.value })} placeholder="Téléphone du cabinet" type="tel" autoComplete="tel" />
                  <input className={input} required value={b.cabinet.email ?? ""} onChange={(e) => majCab({ email: e.target.value })} placeholder="E-mail du cabinet (ex. contact@cabinet.fr)" type="email" autoComplete="email" />
                </div>
              </div>
              <div>
                <p className={label}>{profession === "avocat" ? "Domaines d'intervention" : "Vos missions"}</p>
                <p className={aide}>{b.domaines.length ? `${b.domaines.length} sélectionné${b.domaines.length > 1 ? "s" : ""}` : "Choisissez-en au moins un."} Vous pourrez en ajouter quand vous le souhaitez.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {conf.domaines.map((d) => {
                    const on = b.domaines.includes(d.id);
                    return (
                      <button key={d.id} type="button" onClick={() => maj({ domaines: on ? b.domaines.filter((x) => x !== d.id) : [...b.domaines, d.id] })}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${on ? "bg-brand text-white" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-400"}`}>
                        {d.label}{on && " ×"}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Continuer disabled={!cabinetOk || !b.domaines.length} onClick={suivant} />
            </section>
          )}

          {etape === "template" && (
            <section className="mt-10 space-y-6">
              <Titre t="Choisissez un style" s="Trois mises en page très différentes. Le contenu reste le même : vous pourrez changer de style à tout moment." />
              <div className="space-y-3">
                {TEMPLATES.map((t) => {
                  const p = palette(t.paletteParDefaut);
                  const on = b.template === t.id;
                  return (
                    <button key={t.id} type="button" onClick={() => maj({ template: t.id as TemplateId, palette: t.paletteParDefaut })}
                      className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left ${carte(on)}`}>
                      <span className="flex h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10">
                        {[p.fond2, p.accent, p.sombre].map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}
                      </span>
                      <span>
                        <span className="block text-base font-semibold text-nuit">{t.nom} <span className="font-normal text-gray-500">· {t.accroche}</span></span>
                        <span className="mt-1 block text-sm text-gray-600">{t.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <Continuer onClick={suivant} />
            </section>
          )}

          {etape === "pages" && (
            <section className="mt-10 space-y-6">
              <Titre t="Composez votre page d'accueil" s="Choisissez les sections à afficher. L'aperçu se met à jour en temps réel." />
              <div className="space-y-2">
                <Ligne label="En-tête (Hero)" description="Image de couverture et accroche" requis />
                {SECTIONS.map((s) => {
                  const on = b.sections.includes(s.id);
                  const bloque = s.formule === "rdv" && b.formule === "contact";
                  return (
                    <Ligne key={s.id} label={s.label} description={s.description} on={on && !bloque}
                      badge={s.formule === "rdv" ? `Offre ${PRIX.siteRdv} €` : undefined}
                      onClick={() => {
                        if (bloque) maj({ formule: "rdv" });
                        maj({ sections: on && !bloque ? b.sections.filter((x) => x !== s.id) : [...b.sections.filter((x) => x !== s.id), s.id] as SectionId[] });
                      }} />
                  );
                })}
              </div>
              <p className="text-sm text-gray-500">Vous pourrez modifier la composition de votre page d&apos;accueil à tout moment.</p>
              <Continuer onClick={suivant} />
            </section>
          )}

          {etape === "offre" && (
            <section className="mt-10 space-y-6">
              <Titre t="Comment vos clients vous contactent ?" s="Un simple formulaire, ou la prise de rendez-vous en ligne directement dans votre agenda." />
              <div className="space-y-3">
                <Offre on={b.formule === "rdv"} onClick={() => maj({ formule: "rdv" as Formule })} titre="Prise de rendez-vous en ligne" prix={PRIX.siteRdv} conseille
                  points={["Vos clients réservent un créneau dans votre agenda", "Motifs de rendez-vous et questions pour qualifier chaque demande", "Rappels automatiques et synchronisation Google / Outlook", "Rubrique Actualités pour publier vos articles"]} />
                <Offre on={b.formule === "contact"} onClick={() => maj({ formule: "contact" as Formule })} titre="Formulaire de contact" prix={PRIX.siteContact}
                  points={["Vos visiteurs vous écrivent depuis le site", "Messages reçus par e-mail et dans votre espace", "Passez à la prise de rendez-vous quand vous voulez"]} />
              </div>
              <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-nuit ring-1 ring-black/5">7 jours d&apos;essai gratuit, sans carte bancaire.</p>
              <Continuer onClick={suivant} />
            </section>
          )}

          {etape === "couleurs" && (
            <section className="mt-10 space-y-6">
              <Titre t="Personnalisez le design" s="Testez différents looks : les changements s'affichent en temps réel. Aucun choix n'est définitif." />
              <div className="grid grid-cols-2 gap-3">
                {[...PALETTES].sort((x, y) => Number(y.id === TEMPLATES.find((t) => t.id === b.template)?.paletteParDefaut) - Number(x.id === TEMPLATES.find((t) => t.id === b.template)?.paletteParDefaut)).map((p) => (
                  <button key={p.id} type="button" onClick={() => maj({ palette: p.id })}
                    className={`rounded-2xl p-2.5 text-left ${carte(b.palette === p.id)}`}>
                    <span className="flex h-12 overflow-hidden rounded-lg ring-1 ring-black/10">
                      {[p.fond, p.fond2, p.accent, p.sombre].map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}
                    </span>
                    <span className="mt-2 block text-sm text-gray-700">{p.nom}{p.id === TEMPLATES.find((t) => t.id === b.template)?.paletteParDefaut && <span className="text-gray-400"> · conseillée</span>}</span>
                  </button>
                ))}
              </div>
              <Continuer onClick={suivant} />
            </section>
          )}

          {etape === "inscription" && <Inscription b={b} connecte={connecte} supabase={supabase} nomCabinet={nomCabinet} />}
        </div>
      </div>

      {/* ---------- Aperçu ---------- */}
      <div className="hidden min-w-0 flex-1 p-6 lg:flex lg:h-screen lg:flex-col"><Apercu d={rendu} className="h-full" /></div>
      <button type="button" onClick={() => setVoirApercu(true)} className={`${btnPrimary} ${btnMd} fixed bottom-5 left-1/2 z-20 -translate-x-1/2 lg:hidden`}>
        Voir l&apos;aperçu
      </button>
      {voirApercu && (
        <div className="fixed inset-0 z-30 flex flex-col bg-brand-section p-4 lg:hidden">
          <button type="button" onClick={() => setVoirApercu(false)} className="mb-3 self-start text-sm font-medium text-gray-950">← Revenir aux réglages</button>
          <Apercu d={rendu} className="min-h-0 flex-1" />
        </div>
      )}
    </div>
  );
}

function Titre({ t, s }: { t: string; s: string }) {
  return <div><h1 className="text-[30px] font-bold leading-tight tracking-[-0.03em] text-nuit">{t}</h1><p className="mt-3 text-base leading-relaxed text-gray-600">{s}</p></div>;
}
function Continuer({ onClick, disabled = false }: { onClick: () => void; disabled?: boolean }) {
  return <div className="pt-4"><button type="button" onClick={onClick} disabled={disabled} className={btnNoir}>Continuer <span aria-hidden>→</span></button></div>;
}
function Ligne({ label: l, description, on = true, requis = false, badge, onClick }: { label: string; description: string; on?: boolean; requis?: boolean; badge?: string; onClick?: () => void }) {
  return (
    <button type="button" disabled={requis} onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left ring-1 transition ${on ? "bg-brand-soft ring-brand/30" : "bg-white ring-gray-200"} ${requis ? "cursor-default" : "hover:ring-gray-400"}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${requis ? "bg-gray-200 text-gray-500" : on ? "bg-brand text-white" : "ring-1 ring-gray-300"}`}>
        {requis ? <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
          : on && <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`flex items-center gap-2 text-base font-semibold ${on || requis ? "text-nuit" : "text-gray-500"}`}>
          {l}{requis && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Requis</span>}
          {badge && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand ring-1 ring-brand/20">{badge}</span>}
        </span>
        <span className="block text-sm text-gray-500">{description}</span>
      </span>
    </button>
  );
}
function Offre({ on, onClick, titre, prix, points, conseille = false }: { on: boolean; onClick: () => void; titre: string; prix: number; points: string[]; conseille?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`relative w-full rounded-2xl p-5 text-left ${carte(on)}`}>
      {conseille && <span className={`${eyebrow} absolute -top-2.5 right-4 rounded-full bg-brand px-2.5 py-1 !text-[10px] text-white`}>Recommandé</span>}
      <span className="flex items-start justify-between gap-4">
        <span className="text-lg font-semibold text-nuit">{titre}</span>
        <span className="shrink-0 text-right"><span className="font-manrope text-2xl font-bold text-nuit">{prix} €</span><span className="block text-xs text-gray-500">HT / mois</span></span>
      </span>
      <ul className="mt-3 space-y-1.5">
        {points.map((p) => <li key={p} className="flex gap-2 text-sm text-gray-600"><span className="font-bold text-brand">✓</span>{p}</li>)}
      </ul>
    </button>
  );
}

/* ---------- Dernière étape : inscription (Google ou e-mail + code à 6 chiffres) puis création ---------- */
function Inscription({ b, connecte, supabase, nomCabinet }: { b: Brouillon; connecte: boolean; supabase: ReturnType<typeof createBrowserClient>; nomCabinet: string }) {
  const [email, setEmail] = useState(b.cabinet.email ?? "");
  const [code, setCode] = useState("");
  const [etat, setEtat] = useState<"saisie" | "envoi" | "code" | "verif" | "creation" | "erreur">("saisie");
  const [erreur, setErreur] = useState("");

  async function creer() {
    setEtat("creation"); setErreur("");
    const r = await fetch("/api/site/creer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as { ok?: boolean; error?: string; paiement?: string | null } | null;
    if (j?.ok) {
      try { localStorage.removeItem(CLE_BROUILLON); sessionStorage.setItem(FLAG_SITE_CREE, b.formule); } catch { /* */ }
      // Formule page : paiement du site avant sa mise en ligne.
      if (j.paiement === "checkout") {
        const p = await fetch("/api/options/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ option: "site" }) }).catch(() => null);
        const pj = (await p?.json().catch(() => null)) as { url?: string } | null;
        if (pj?.url) { window.location.href = pj.url; return; }
      }
      window.location.href = "/dashboard/site?nouveau=1";
      return;
    }
    setEtat("erreur"); setErreur(j?.error ?? "La création du site a échoué, réessayez.");
  }

  async function google() {
    try { localStorage.setItem(CLE_BROUILLON, JSON.stringify(b)); } catch { /* */ }
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=/creer-mon-site/finaliser` } });
    if (error) { setEtat("erreur"); setErreur("La connexion Google n'est pas disponible pour le moment : utilisez votre e-mail."); }
  }

  async function envoyerCode(e: React.FormEvent) {
    e.preventDefault();
    setEtat("envoi"); setErreur("");
    try { localStorage.setItem(CLE_BROUILLON, JSON.stringify(b)); } catch { /* */ }
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, data: { profession: b.profession }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/creer-mon-site/finaliser` },
    });
    if (error) { setEtat("erreur"); setErreur(error.message.includes("rate") ? "Trop de tentatives : patientez une minute." : "L'envoi du code a échoué, vérifiez l'adresse."); return; }
    setEtat("code");
  }

  async function verifier(e: React.FormEvent) {
    e.preventDefault();
    setEtat("verif"); setErreur("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.replace(/\s/g, ""), type: "email" });
    if (error) { setEtat("code"); setErreur("Code incorrect ou expiré."); return; }
    await creer();
  }

  if (connecte) {
    return (
      <section className="mt-10 space-y-6">
        <Titre t={`Le site de ${nomCabinet} est prêt.`} s="Il est rattaché à votre compte. Vous pourrez modifier tous les textes et ajouter vos photos dans votre espace." />
        <button type="button" onClick={creer} disabled={etat === "creation"} className={btnNoir}>{etat === "creation" ? "Création…" : "Créer mon site →"}</button>
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <p className="text-sm text-gray-500">Ce n&apos;est pas votre compte ?{" "}
          <button type="button" className="font-semibold text-brand underline" onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}>Se déconnecter</button>
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 space-y-6">
      <div className="flex gap-4">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3}><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <Titre t={`Le site de ${nomCabinet} est prêt. Gardez-le.`} s="Enregistrez-le gratuitement : 7 jours d'essai, sans carte bancaire." />
      </div>

      {etat === "code" || etat === "verif" ? (
        <form onSubmit={verifier} className="space-y-4">
          <p className="text-[15px] text-gray-700">Saisissez le code à 6 chiffres envoyé à <strong>{email}</strong>.</p>
          <input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={(e) => setCode(e.target.value)}
            className={`${input} py-4 text-center text-2xl tracking-[0.5em]`} placeholder="••••••" />
          <button type="submit" disabled={etat === "verif" || code.replace(/\s/g, "").length < 6} className={btnNoir}>{etat === "verif" ? "Vérification…" : "Enregistrer mon site →"}</button>
          <p className="text-sm text-gray-500">Vous pouvez aussi cliquer sur le lien reçu par e-mail. <button type="button" onClick={() => setEtat("saisie")} className="underline">Changer d&apos;adresse</button></p>
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        </form>
      ) : etat === "creation" ? (
        <p className="text-[15px] text-gray-700">Création de votre site…</p>
      ) : (
        <>
          <button type="button" onClick={google} className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-[15px] font-semibold text-nuit hover:border-gray-400">
            <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
            Continuer avec Google
          </button>
          <div className="flex items-center gap-4 text-sm text-gray-400"><span className="h-px flex-1 bg-gray-200" />ou<span className="h-px flex-1 bg-gray-200" /></div>
          <form onSubmit={envoyerCode} className="space-y-4">
            <label className={label}>Votre adresse e-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@cabinet.fr" className={input} autoComplete="email" />
            <p className="text-sm text-gray-500">Pour retrouver votre site, nous vous envoyons un code de confirmation à 6 chiffres.</p>
            <button type="submit" disabled={etat === "envoi"} className={btnNoir}>{etat === "envoi" ? "Envoi du code…" : "Enregistrer mon site →"}</button>
          </form>
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <p className="text-center text-sm text-gray-600">Déjà un compte ? <Link href="/login?next=/creer-mon-site" className="font-semibold text-brand underline">Se connecter</Link></p>
        </>
      )}

      <ul className="space-y-3 border-t border-gray-100 pt-6 text-sm text-gray-600">
        <li className="flex gap-3"><span>💳</span>7 jours d&apos;essai gratuit, sans carte bancaire.</li>
        <li className="flex gap-3"><span>⚖️</span>Textes et mentions légales rédigés dans le respect des règles déontologiques.</li>
        <li className="flex gap-3"><span>🔒</span>Vos données restent confidentielles et sont sauvegardées chaque jour.</li>
      </ul>
      <p className="text-center text-xs text-gray-400">En créant un compte, vous acceptez les conditions d&apos;utilisation et la politique de confidentialité.</p>
    </section>
  );
}
