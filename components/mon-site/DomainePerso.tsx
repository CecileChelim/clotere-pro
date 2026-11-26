"use client";

import { useEffect, useState } from "react";

/* Branchement d'un nom de domaine sur le site du cabinet (onglet Publication de « Mon site »).
   Écrans : présentation → (achat) → saisie → enregistrements DNS → vérification → connecté. */

type Cibles = { cname: string; ip: string };
type Verif = { www: { ok: boolean; trouve: string[] }; racine: { ok: boolean; trouve: string[] } };
type Ecran = "intro" | "achat" | "saisie" | "dns" | "verif" | "connecte";

const btn = "rounded-full bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50";
const btn2 = "rounded-full px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50";
const lien = "text-sm text-gray-500 underline underline-offset-2 hover:text-gray-900";

const HEBERGEURS: { id: string; nom: string; etapes: string[] }[] = [
  { id: "ovh", nom: "OVHcloud", etapes: ["Connectez-vous à votre espace client OVHcloud.", "Ouvrez Web Cloud › Noms de domaine, puis votre domaine.", "Onglet « Zone DNS » › « Ajouter une entrée »."] },
  { id: "gandi", nom: "Gandi", etapes: ["Connectez-vous à votre compte Gandi.", "Ouvrez Domaines, puis votre domaine.", "Onglet « Enregistrements DNS » › « Ajouter un enregistrement »."] },
  { id: "ionos", nom: "IONOS", etapes: ["Connectez-vous à votre compte IONOS.", "Ouvrez Domaines & SSL, puis la roue dentée de votre domaine › DNS.", "Cliquez sur « Ajouter un enregistrement »."] },
  { id: "godaddy", nom: "GoDaddy", etapes: ["Connectez-vous à votre compte GoDaddy.", "Ouvrez Mes produits › votre domaine › DNS.", "Cliquez sur « Ajouter un nouvel enregistrement »."] },
  { id: "autre", nom: "Autre", etapes: ["Connectez-vous chez le prestataire où vous avez acheté votre domaine.", "Cherchez la rubrique « DNS », « Zone DNS » ou « Enregistrements ».", "Ajoutez les deux enregistrements ci-dessous."] },
];

function Copier({ valeur }: { valeur: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={() => { navigator.clipboard?.writeText(valeur); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="rounded-md px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50">
      {ok ? "Copié ✓" : "Copier"}
    </button>
  );
}

function Pastille({ ok, attente = "En attente" }: { ok: boolean; attente?: string }) {
  return ok
    ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Détecté</span>
    : <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{attente}</span>;
}

function Etapes({ actuelle }: { actuelle: number }) {
  const noms = ["Votre domaine", "Réglages DNS", "Vérification"];
  return (
    <ol className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      {noms.map((n, i) => (
        <li key={n} className={`flex items-center gap-1.5 ${i === actuelle ? "font-semibold text-gray-950" : i < actuelle ? "text-gray-500" : "text-gray-400"}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${i < actuelle ? "bg-emerald-500 text-white" : i === actuelle ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-500"}`}>{i < actuelle ? "✓" : i + 1}</span>
          {n}
          {i < noms.length - 1 && <span className="ml-1.5 text-gray-300">—</span>}
        </li>
      ))}
    </ol>
  );
}

export function DomainePerso({ initial, cibles, urlClotere, apercu }: {
  initial: { domaine: string | null; statut: string | null };
  cibles: Cibles;
  urlClotere: string;
  /** Aperçu d'un écran précis (maquettes) : aucun appel réseau n'est déclenché tant qu'on n'y touche pas. */
  apercu?: { ecran: Ecran; verif?: Verif };
}) {
  const [domaine, setDomaine] = useState(initial.domaine);
  const [ecran, setEcran] = useState<Ecran>(apercu?.ecran ?? (initial.statut === "connecte" ? "connecte" : initial.domaine ? "dns" : "intro"));
  const [saisie, setSaisie] = useState(initial.domaine ?? "");
  const [hebergeur, setHebergeur] = useState("ovh");
  const [verif, setVerif] = useState<Verif | null>(apercu?.verif ?? null);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  const [derniere, setDerniere] = useState<Date | null>(null);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setCharge(true); setErreur("");
    const r = await fetch("/api/site/domaine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domaine: saisie }) });
    const j = await r.json().catch(() => ({}));
    setCharge(false);
    if (!j.ok) { setErreur(j.error || "Enregistrement impossible, réessayez."); return; }
    setDomaine(j.domaine); setSaisie(j.domaine); setEcran("dns");
  }

  async function verifier() {
    setCharge(true); setErreur("");
    const r = await fetch("/api/site/domaine");
    const j = await r.json().catch(() => ({}));
    setCharge(false); setDerniere(new Date());
    if (!j.ok) { setErreur("Vérification impossible pour le moment, réessayez."); return; }
    setVerif(j.verif ?? null);
    setEcran(j.statut === "connecte" ? "connecte" : "verif");
  }

  async function deconnecter() {
    if (!confirm(`Déconnecter ${domaine} ? Votre site restera en ligne sur ${urlClotere}.`)) return;
    setCharge(true);
    await fetch("/api/site/domaine", { method: "DELETE" });
    setCharge(false);
    setDomaine(null); setSaisie(""); setVerif(null); setEcran("intro");
  }

  // Sur l'écran de vérification, nouvelle vérification automatique toutes les 30 s (10 fois au plus).
  useEffect(() => {
    if (ecran !== "verif" || apercu) return;
    let n = 0;
    const t = setInterval(() => { if (++n > 10) clearInterval(t); else verifier(); }, 30000);
    return () => clearInterval(t);
  }, [ecran, apercu]);

  const h = HEBERGEURS.find((x) => x.id === hebergeur)!;
  const enregistrements = [
    { type: "CNAME", nom: "www", valeur: cibles.cname, role: "Affiche votre site sur www." + (domaine ?? "votre-domaine.fr") },
    { type: "A", nom: "@", valeur: cibles.ip, role: "Redirige " + (domaine ?? "votre-domaine.fr") + " (sans www) vers votre site" },
  ];

  /* ── 0. Présentation ─────────────────────────────────────────── */
  if (ecran === "intro") return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <p className="font-medium text-gray-950">Utilisez votre propre nom de domaine</p>
      <p className="mt-1 text-gray-500">
        Votre site est en ligne sur <span className="text-gray-950">{urlClotere}</span>. Avec votre nom de domaine
        (par exemple <span className="text-gray-950">www.cabinet-dupont.fr</span>), il gagne en crédibilité et vous pouvez l&apos;utiliser
        sur vos cartes de visite et votre fiche Google.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setEcran("saisie")} className={btn}>J&apos;ai déjà un nom de domaine</button>
        <button type="button" onClick={() => setEcran("achat")} className={btn2}>Je n&apos;en ai pas encore</button>
      </div>
    </div>
  );

  /* ── 0 bis. Acheter un domaine ───────────────────────────────── */
  if (ecran === "achat") return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <p className="font-medium text-gray-950">Réserver un nom de domaine</p>
      <p className="mt-1 text-gray-500">Un nom de domaine s&apos;achète en quelques minutes chez un bureau d&apos;enregistrement, pour quelques euros par an.</p>
      <ol className="mt-4 space-y-3">
        {[
          ["Choisissez un nom simple", "Le nom de votre cabinet ou votre nom, avec votre métier : cabinet-dupont.fr, dupont-avocat.fr. Évitez les accents et les tirets en série."],
          ["Réservez-le chez un prestataire", "OVHcloud, Gandi ou IONOS par exemple. Vous n'avez besoin que du nom de domaine : inutile de prendre un hébergement ou un site."],
          ["Revenez ici", "Nous vous guidons pour le relier à votre site, en deux réglages."],
        ].map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">{i + 1}</span>
            <div><p className="font-medium text-gray-950">{t}</p><p className="text-gray-500">{d}</p></div>
          </li>
        ))}
      </ol>
      <div className="mt-4 rounded-xl bg-violet-50 p-4 text-violet-900">
        <p className="font-medium">Vous préférez qu&apos;on s&apos;en occupe ?</p>
        <p className="mt-1 text-violet-800">Nous réservons le domaine à votre nom et le relions à votre site.{" "}
          <a href="mailto:contact@clotere.fr?subject=R%C3%A9server%20mon%20nom%20de%20domaine" className="font-medium underline">Écrivez-nous</a>.</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setEcran("saisie")} className={btn}>J&apos;ai mon nom de domaine</button>
        <button type="button" onClick={() => setEcran("intro")} className={lien}>Retour</button>
      </div>
    </div>
  );

  /* ── 1. Saisie ───────────────────────────────────────────────── */
  if (ecran === "saisie") return (
    <form onSubmit={enregistrer} className="rounded-2xl border border-gray-200 p-5">
      <Etapes actuelle={0} />
      <label htmlFor="domaine" className="font-medium text-gray-950">Quel est votre nom de domaine ?</label>
      <div className="mt-2 flex max-w-md items-center rounded-xl border border-gray-200 bg-white focus-within:border-gray-950">
        <span className="pl-3.5 text-gray-400">www.</span>
        <input id="domaine" value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder="cabinet-dupont.fr" autoFocus
          className="w-full rounded-xl bg-transparent py-2.5 pr-3.5 text-sm text-gray-950 outline-none" />
      </div>
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={charge || !saisie.trim()} className={btn}>{charge ? "Enregistrement…" : "Continuer"}</button>
        <button type="button" onClick={() => setEcran(domaine ? "dns" : "intro")} className={lien}>Retour</button>
      </div>
    </form>
  );

  /* ── 2. Réglages DNS ─────────────────────────────────────────── */
  if (ecran === "dns") return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <Etapes actuelle={1} />
      <p className="font-medium text-gray-950">Ajoutez 2 enregistrements chez votre hébergeur de domaine</p>
      <p className="mt-1 text-gray-500">Comptez 5 minutes. Où avez-vous acheté <span className="text-gray-950">{domaine}</span> ?</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {HEBERGEURS.map((x) => (
          <button key={x.id} type="button" onClick={() => setHebergeur(x.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${hebergeur === x.id ? "bg-gray-950 text-white ring-gray-950" : "text-gray-700 ring-gray-200 hover:bg-gray-50"}`}>
            {x.nom}
          </button>
        ))}
      </div>

      <ol className="mt-4 space-y-1.5">
        {h.etapes.map((e, i) => (
          <li key={e} className="flex gap-2.5 text-gray-700"><span className="text-gray-400">{i + 1}.</span>{e}</li>
        ))}
      </ol>

      <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-gray-200">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr><th className="px-3 py-2 font-medium">Type</th><th className="px-3 py-2 font-medium">Nom / Sous-domaine</th><th className="px-3 py-2 font-medium">Valeur / Cible</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enregistrements.map((r) => (
              <tr key={r.type}>
                <td className="px-3 py-3 font-mono text-xs font-semibold">{r.type}</td>
                <td className="px-3 py-3 font-mono text-xs">{r.nom}</td>
                <td className="px-3 py-3"><span className="font-mono text-xs">{r.valeur}</span><p className="mt-0.5 text-xs text-gray-500">{r.role}</p></td>
                <td className="px-3 py-3 text-right"><Copier valeur={r.valeur} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 rounded-xl bg-amber-50 p-3.5 text-[13px] text-amber-900">
        Un enregistrement <b>www</b> ou <b>@</b> existe déjà (ancien site, page parking) ? <b>Modifiez-le</b> plutôt que d&apos;en ajouter un second.
        Si votre hébergeur refuse le CNAME sur « www », écrivez « www.{domaine} » dans le nom.
      </div>

      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={verifier} disabled={charge} className={btn}>{charge ? "Vérification…" : "C'est fait, vérifier"}</button>
        <button type="button" onClick={() => setEcran("saisie")} className={lien}>Changer de domaine</button>
        <a href={`mailto:contact@clotere.fr?subject=${encodeURIComponent(`Aide pour relier ${domaine}`)}`} className={lien}>Besoin d&apos;aide ?</a>
      </div>
    </div>
  );

  /* ── 3. Vérification en cours ────────────────────────────────── */
  if (ecran === "verif") return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <Etapes actuelle={2} />
      <p className="font-medium text-gray-950">Nous attendons vos réglages DNS</p>
      <p className="mt-1 text-gray-500">
        Une modification DNS met en général quelques minutes à être visible, parfois jusqu&apos;à 24 h.
        Cette page revérifie toute seule toutes les 30 secondes ; vous pouvez aussi la fermer et revenir plus tard.
      </p>
      <ul className="mt-4 divide-y divide-gray-100 rounded-xl ring-1 ring-gray-200">
        {[
          { nom: `www.${domaine}`, attendu: `CNAME → ${cibles.cname}`, v: verif?.www },
          { nom: domaine ?? "", attendu: `A → ${cibles.ip}`, v: verif?.racine },
        ].map((l) => (
          <li key={l.nom} className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-3">
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold text-gray-950">{l.nom}</p>
              <p className="text-xs text-gray-500">Attendu : {l.attendu}</p>
              {l.v && !l.v.ok && <p className="text-xs text-gray-500">Trouvé : {l.v.trouve.length ? l.v.trouve.join(", ") : "aucun enregistrement pour l'instant"}</p>}
            </div>
            <Pastille ok={!!l.v?.ok} />
          </li>
        ))}
      </ul>
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={verifier} disabled={charge} className={btn}>{charge ? "Vérification…" : "Vérifier maintenant"}</button>
        <button type="button" onClick={() => setEcran("dns")} className={lien}>Revoir les réglages</button>
        {derniere && <span className="text-xs text-gray-400">Dernière vérification à {derniere.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>}
      </div>
    </div>
  );

  /* ── 4. Connecté ─────────────────────────────────────────────── */
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <a href={`https://www.${domaine}`} target="_blank" rel="noopener" className="font-medium text-gray-950 underline underline-offset-2">www.{domaine}</a>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Connecté</span>
      </div>
      <p className="mt-1 text-gray-500">
        Votre site s&apos;affiche sur votre domaine. Le cadenas HTTPS est activé automatiquement, comptez jusqu&apos;à une heure après la connexion.
        L&apos;adresse {urlClotere} continue de fonctionner.
      </p>
      {verif && !verif.racine.ok && (
        <div className="mt-3 rounded-xl bg-amber-50 p-3.5 text-[13px] text-amber-900">
          <b>{domaine}</b> (sans www) n&apos;est pas encore relié : ajoutez l&apos;enregistrement <span className="font-mono">A @ → {cibles.ip}</span> pour que vos clients
          arrivent sur le site même sans taper « www ». <button type="button" onClick={() => setEcran("dns")} className="font-medium underline">Voir les réglages</button>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setEcran("saisie")} className={btn2}>Changer de domaine</button>
        <button type="button" onClick={deconnecter} disabled={charge} className={lien}>Déconnecter</button>
      </div>
    </div>
  );
}
