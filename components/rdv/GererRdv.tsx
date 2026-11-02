"use client";

import { useState } from "react";

type Props = {
  token: string; statut: string;
  modele: string; modeleRefus: string;
  creneauxProposes: string[] | null; // libellés déjà formatés
  creneauActuel?: string; // ISO, pour pré-remplir le déplacement
};

/** "2026-11-05T14:00:00Z" → "2026-11-05T15:00" (heure de Paris, pour <input type="datetime-local">). */
function versInputParis(iso?: string) {
  if (!iso) return "";
  const p = Object.fromEntries(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

const btn = "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50";
const area = "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/15";

export function GererRdv({ token, statut, modele, modeleRefus, creneauxProposes, creneauActuel }: Props) {
  const [vue, setVue] = useState<"choix" | "valider" | "proposer" | "refuser" | "annuler" | "deplacer">("choix");
  const [nouveau, setNouveau] = useState(versInputParis(creneauActuel));
  const [noteDeplacement, setNoteDeplacement] = useState("");
  const [joindre, setJoindre] = useState(true);
  const [message, setMessage] = useState(modele);
  const [refus, setRefus] = useState(modeleRefus);
  const [creneaux, setCreneaux] = useState(["", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function agir(action: string, body: Record<string, unknown> = {}) {
    setBusy(true); setError("");
    const res = await fetch(`/api/rdv/gestion/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !json.ok) { setError(json.error || "Une erreur est survenue"); return; }
    window.location.reload();
  }

  const [minDate] = useState(() => new Date(Date.now() + 3600e3).toISOString().slice(0, 16));

  const formDeplacer = (
    <div className="w-full basis-full space-y-3">
      <p className="text-sm font-semibold text-gray-900">Déplacer le rendez-vous</p>
      <p className="text-xs leading-relaxed text-gray-500">
        À utiliser quand le client est d&apos;accord (par exemple au téléphone) : le nouveau créneau est confirmé tout de suite, sans lui demander de valider.
        Il reçoit un email avec la nouvelle date et l&apos;invitation, et votre agenda est mis à jour. Même durée qu&apos;avant.
      </p>
      <input type="datetime-local" min={minDate} step={900} value={nouveau} onChange={(e) => setNouveau(e.target.value)} className={area} aria-label="Nouvelle date et heure" />
      <textarea rows={3} className={area} placeholder="Message au client (facultatif) : « Comme convenu par téléphone… »" value={noteDeplacement} onChange={(e) => setNoteDeplacement(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button disabled={busy || !nouveau || nouveau === versInputParis(creneauActuel)}
          onClick={() => agir("deplacer", { debut: new Date(nouveau).toISOString(), message: noteDeplacement || null })}
          className={`${btn} bg-violet-600 text-white hover:bg-violet-700`}>{busy ? "Envoi…" : "Déplacer et prévenir le client"}</button>
        <button onClick={() => setVue("choix")} className={`${btn} text-gray-600 hover:bg-gray-100`}>Retour</button>
      </div>
    </div>
  );
  const boutonDeplacer = (
    <button onClick={() => { setError(""); setVue("deplacer"); }} className={`${btn} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}>Déplacer le rendez-vous</button>
  );

  if (vue === "deplacer") return formDeplacer;

  if (statut === "confirmé") {
    return vue === "annuler" ? (
      <div className="w-full basis-full space-y-3">
        <p className="text-sm font-semibold text-gray-900">Message au client (facultatif)</p>
        <textarea rows={4} className={area} value={refus} onChange={(e) => setRefus(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button disabled={busy} onClick={() => agir("annuler", { message: refus })} className={`${btn} bg-red-600 text-white hover:bg-red-700`}>Confirmer l&apos;annulation</button>
          <button onClick={() => setVue("choix")} className={`${btn} text-gray-600 hover:bg-gray-100`}>Retour</button>
        </div>
      </div>
    ) : (
      <div className="flex flex-wrap gap-2">
        {boutonDeplacer}
        <button onClick={() => setVue("annuler")} className={`${btn} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}>Annuler ce rendez-vous</button>
      </div>
    );
  }

  if (statut === "proposé") {
    return (
      <div className="rounded-xl bg-violet-50 p-4 text-sm text-violet-900">
        <p className="font-semibold">Créneaux proposés au client :</p>
        <ul className="mt-2 list-disc pl-5">{creneauxProposes?.map((c) => <li key={c} className="first-letter:uppercase">{c}</li>)}</ul>
        <p className="mt-2 text-violet-800/80">Vous serez prévenu par email dès qu&apos;il aura choisi.</p>
        <p className="mt-3 text-violet-800/80">Vous vous êtes mis d&apos;accord autrement ? <button onClick={() => { setError(""); setVue("deplacer"); }} className="font-semibold underline">Fixer le créneau directement</button></p>
      </div>
    );
  }

  if (statut !== "demandé") return null;

  return (
    <div>
      {vue === "choix" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button onClick={() => setVue("valider")} className={`${btn} bg-violet-600 py-3 text-white hover:bg-violet-700`}>✓ Valider</button>
          <button onClick={() => setVue("proposer")} className={`${btn} border border-gray-200 bg-white py-3 text-gray-900 hover:bg-gray-50`}>Proposer d&apos;autres créneaux</button>
          <button onClick={() => setVue("refuser")} className={`${btn} border border-gray-200 bg-white py-3 text-gray-700 hover:bg-gray-50`}>Refuser</button>
          <p className="text-xs text-gray-500 sm:col-span-3">
            Le client vous a appelé pour changer de créneau ?{" "}
            <button onClick={() => { setError(""); setVue("deplacer"); }} className="font-semibold text-violet-700 underline">Déplacer le rendez-vous</button>
          </p>
        </div>
      )}

      {vue === "valider" && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <input type="checkbox" checked={joindre} onChange={(e) => setJoindre(e.target.checked)} className="h-4 w-4 accent-violet-600" />
            Joindre un message au client
          </label>
          {joindre && (
            <>
              <p className="text-xs text-gray-500">Message type préparé selon le motif : modifiez-le librement avant l&apos;envoi.</p>
              <textarea rows={12} className={area} value={message} onChange={(e) => setMessage(e.target.value)} />
              <button type="button" onClick={() => setMessage(modele)} className="text-xs text-gray-500 underline hover:text-gray-900">Rétablir le message type</button>
            </>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <button disabled={busy} onClick={() => agir("valider", { message: joindre ? message : null })} className={`${btn} bg-violet-600 text-white hover:bg-violet-700`}>
              {busy ? "Envoi…" : "Valider et envoyer la confirmation"}
            </button>
            <button onClick={() => setVue("choix")} className={`${btn} text-gray-600 hover:bg-gray-100`}>Retour</button>
          </div>
        </div>
      )}

      {vue === "proposer" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">Proposez jusqu&apos;à 3 créneaux</p>
          <p className="text-xs text-gray-500">Le client confirmera en un clic celui qui lui convient. Durée identique à la demande initiale.</p>
          {creneaux.map((c, i) => (
            <input key={i} type="datetime-local" min={minDate} step={900} value={c}
              onChange={(e) => setCreneaux(creneaux.map((x, j) => (j === i ? e.target.value : x)))} className={area} />
          ))}
          <p className="pt-2 text-sm font-semibold text-gray-900">Message (facultatif)</p>
          <textarea rows={3} className={area} placeholder="Je ne suis pas disponible à cette date, voici d'autres possibilités…" value={message === modele ? "" : message} onChange={(e) => setMessage(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <button disabled={busy || !creneaux.some(Boolean)}
              onClick={() => agir("proposer", { creneaux: creneaux.filter(Boolean).map((c) => new Date(c).toISOString()), message: message === modele ? null : message })}
              className={`${btn} bg-violet-600 text-white hover:bg-violet-700`}>{busy ? "Envoi…" : "Envoyer les créneaux"}</button>
            <button onClick={() => setVue("choix")} className={`${btn} text-gray-600 hover:bg-gray-100`}>Retour</button>
          </div>
        </div>
      )}

      {vue === "refuser" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-900">Message au client</p>
          <p className="text-xs text-gray-500">Le client reçoit aussi un lien pour réserver un autre créneau.</p>
          <textarea rows={6} className={area} value={refus} onChange={(e) => setRefus(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <button disabled={busy} onClick={() => agir("refuser", { message: refus })} className={`${btn} bg-gray-900 text-white hover:bg-gray-800`}>{busy ? "Envoi…" : "Refuser la demande"}</button>
            <button onClick={() => setVue("choix")} className={`${btn} text-gray-600 hover:bg-gray-100`}>Retour</button>
          </div>
        </div>
      )}
    </div>
  );
}
