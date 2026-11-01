"use client";

import { useState } from "react";

export function SuiviActions({ token, statut, propositions, peutAnnuler, telephone, reserver }: {
  token: string; statut: string; propositions: string[] | null; peutAnnuler: boolean; telephone: string | null; reserver: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmAnnul, setConfirmAnnul] = useState(false);
  const [raison, setRaison] = useState("");

  async function agir(body: Record<string, unknown>) {
    setBusy(true); setError("");
    const res = await fetch(`/api/rdv/suivi/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !json.ok) { setError(json.error || "Une erreur est survenue"); return; }
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {statut === "proposé" && propositions && (
        <div>
          <p className="text-sm font-semibold text-gray-900">Choisissez le créneau qui vous convient :</p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {propositions.map((p, i) => (
              <button key={p} disabled={busy} onClick={() => agir({ action: "choisir", index: i })}
                className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:border-violet-600 hover:bg-violet-50 disabled:opacity-50">
                <span className="first-letter:uppercase">{p}</span><span className="text-violet-600">Choisir ›</span>
              </button>
            ))}
          </div>
          <a href={reserver} className="mt-3 inline-block text-sm text-gray-500 underline hover:text-gray-900">Aucun ne me convient : choisir un autre créneau</a>
        </div>
      )}

      {statut === "confirmé" && (
        <a href={`/api/rdv/ics/${token}`} className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
          Ajouter à mon agenda
        </a>
      )}

      {(statut === "refusé" || statut === "annulé") && (
        <a href={reserver} className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
          Reprendre rendez-vous
        </a>
      )}

      {["demandé", "proposé", "confirmé"].includes(statut) && (
        <div className="border-t border-gray-100 pt-4">
          {peutAnnuler ? (
            confirmAnnul ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900">Pourquoi souhaitez-vous annuler ?</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[["plus_besoin", "Je n'en ai plus besoin"], ["imprevu", "J'ai un imprévu"], ["autre_pro", "J'ai trouvé quelqu'un d'autre"], ["autre", "Autre raison"]].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setRaison(v)}
                      className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${raison === v ? "border-violet-600 bg-violet-50 text-gray-900" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}>
                      <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${raison === v ? "border-violet-600 bg-violet-600 shadow-[inset_0_0_0_2px_white]" : "border-gray-300"}`} />
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button disabled={busy || !raison} onClick={() => agir({ action: "annuler", raison })}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40">Confirmer l&apos;annulation</button>
                  <button onClick={() => { setConfirmAnnul(false); setRaison(""); }} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">Garder mon rendez-vous</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmAnnul(true)} className="text-sm text-gray-500 underline hover:text-gray-900">Annuler mon rendez-vous</button>
            )
          ) : (
            <p className="text-sm text-gray-500">Moins de 24 h avant le rendez-vous : pour annuler, contactez directement le cabinet{telephone ? ` au ${telephone}` : ""}.</p>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
