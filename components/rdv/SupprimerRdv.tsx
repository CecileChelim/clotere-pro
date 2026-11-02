"use client";

import { useState } from "react";
import { RAISONS_SUPPRESSION, type RaisonSuppression } from "@/lib/rdv/suppression";

type Props = {
  token: string;
  clientPrenom: string;
  /** Le cabinet a une fiche Google : on peut proposer la demande d'avis. */
  avisPossible: boolean;
  /** Rendez-vous confirmé et à venir : on conseille plutôt d'annuler (le client est prévenu). */
  aVenirConfirme?: boolean;
  onDone?: (avisEnvoye: boolean) => void;
  className?: string;
};

/** Bouton « Supprimer » + panneau latéral : raison, puis demande d'avis Google si le dossier est mené à bien. */
export function SupprimerRdv({ token, clientPrenom, avisPossible, aVenirConfirme, onDone, className }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [raison, setRaison] = useState<RaisonSuppression | null>(null);
  const [detail, setDetail] = useState("");
  const [avis, setAvis] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const fermer = () => { if (!busy) { setOuvert(false); setRaison(null); setDetail(""); setAvis(true); setError(""); } };

  async function valider() {
    if (!raison) return;
    setBusy(true); setError("");
    const res = await fetch(`/api/rdv/gestion/${token}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "supprimer", raison, detail, avis: raison === "termine" && avisPossible && avis }),
    });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !j.ok) { setError(j.error || "Une erreur est survenue"); return; }
    setOuvert(false);
    if (onDone) onDone(!!j.avisEnvoye); else window.location.reload();
  }

  return (
    <>
      <button type="button" onClick={() => setOuvert(true)}
        className={className ?? "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-gray-500 hover:bg-white hover:text-red-600"}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        Supprimer
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={fermer}>
          <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-950">Supprimer ce rendez-vous</h2>
                <p className="mt-1 text-sm text-gray-500">Il disparaît de votre liste. Dites-nous pourquoi : ça nous aide à mesurer ce que vous apportent vos rendez-vous.</p>
              </div>
              <button type="button" onClick={fermer} className="text-gray-400 hover:text-gray-700" aria-label="Fermer">✕</button>
            </div>

            <div className="flex-1 space-y-6 p-6">
              {aVenirConfirme && (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                  Ce rendez-vous est confirmé et n&apos;a pas encore eu lieu. Supprimer ne prévient pas {clientPrenom} : pour l&apos;informer, utilisez plutôt « Annuler » sur la page du rendez-vous.
                </p>
              )}

              <fieldset>
                <legend className="text-sm font-semibold text-gray-950">Pourquoi supprimez-vous ce rendez-vous ?</legend>
                <div className="mt-3 space-y-2">
                  {RAISONS_SUPPRESSION.map((r) => (
                    <label key={r.id} className={`flex cursor-pointer gap-3 rounded-xl px-4 py-3 ring-1 transition ${raison === r.id ? "bg-violet-50/60 ring-2 ring-violet-600" : "ring-gray-200 hover:ring-gray-300"}`}>
                      <input type="radio" name="raison" className="mt-1 accent-violet-600" checked={raison === r.id} onChange={() => setRaison(r.id)} />
                      <span>
                        <span className="block text-sm font-medium text-gray-950">{r.label}</span>
                        {r.aide && <span className="block text-xs text-gray-500">{r.aide}</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {raison === "termine" && (
                avisPossible ? (
                  <label className="flex cursor-pointer gap-3 rounded-xl bg-gray-50 p-4 ring-1 ring-black/5">
                    <input type="checkbox" className="mt-1 accent-violet-600" checked={avis} onChange={(e) => setAvis(e.target.checked)} />
                    <span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-950">
                        <span className="text-amber-400">★</span> Demander un avis Google à {clientPrenom}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                        {clientPrenom} reçoit un e-mail de votre part, avec un bouton qui ouvre directement le formulaire d&apos;avis de votre fiche Google. C&apos;est le meilleur moment pour le demander.
                      </span>
                    </span>
                  </label>
                ) : (
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600 ring-1 ring-black/5">
                    <p className="font-semibold text-gray-950">Envie de demander un avis Google ?</p>
                    <p className="mt-1">Ajoutez d&apos;abord le lien de votre fiche Google dans votre profil : vous pourrez ensuite demander un avis à chaque dossier terminé.</p>
                    <a href="/dashboard/fiche" className="mt-2 inline-block font-semibold text-violet-600 hover:underline">Ajouter ma fiche Google ›</a>
                  </div>
                )
              )}

              {raison && (
                <label className="block">
                  <span className="text-sm font-semibold text-gray-950">Précision <span className="font-normal text-gray-400">(facultatif, visible par vous seul)</span></span>
                  <textarea rows={3} value={detail} onChange={(e) => setDetail(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-950" />
                </label>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex items-center gap-3 border-t border-gray-100 p-6">
              <button type="button" disabled={!raison || busy} onClick={valider}
                className="rounded-full bg-gray-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40">
                {busy ? "Suppression…" : raison === "termine" && avisPossible && avis ? "Supprimer et demander l'avis" : "Supprimer le rendez-vous"}
              </button>
              <button type="button" onClick={fermer} className="text-sm text-gray-500 hover:text-gray-950">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
