"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Saisie du lien de la fiche Google, avec l'aide pour le trouver. */
export function FicheGoogleForm({ initial, compact = false }: { initial?: string | null; compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState(initial ?? "");
  const [etat, setEtat] = useState<"idle" | "envoi" | "ok" | "erreur">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [aide, setAide] = useState(!compact);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEtat("envoi");
    setMessage(null);
    const r = await fetch("/api/avis/fiche", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) }).catch(() => null);
    const json = (await r?.json().catch(() => null)) as { ok?: boolean; error?: string; total?: number; note?: number } | null;
    if (json?.ok) {
      setEtat("ok");
      setMessage(`Fiche trouvée${json.total != null ? ` : ${json.total} avis` : ""}${json.note != null ? `, note ${String(json.note).replace(".", ",")}` : ""}.`);
      router.refresh();
    } else {
      setEtat("erreur");
      setMessage(json?.error ?? "Une erreur est survenue, réessayez.");
    }
  }

  return (
    <div>
      <form onSubmit={enregistrer} className="flex flex-col gap-3 sm:flex-row">
        <input className="input flex-1" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://share.google/… ou https://maps.app.goo.gl/…" aria-label="Lien de votre fiche Google" required />
        <button type="submit" className="btn-solid shrink-0" disabled={etat === "envoi"}>{etat === "envoi" ? "Recherche de la fiche…" : "Enregistrer"}</button>
      </form>
      {message && <p className={`mt-2 text-sm ${etat === "ok" ? "text-emerald-700" : "text-red-600"}`}>{message}</p>}

      {compact && !aide && (
        <button type="button" onClick={() => setAide(true)} className="mt-3 text-sm font-medium text-gray-950 underline underline-offset-2">Où trouver ce lien ?</button>
      )}
      {aide && (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ["Sur Google", "Cherchez le nom de votre cabinet sur google.fr. Dans votre fiche (à droite sur ordinateur), cliquez sur « Partager », puis « Copier le lien »."],
            ["Sur Google Maps", "Ouvrez votre fiche dans Google Maps, cliquez sur « Partager », puis « Copier le lien ». Il commence par maps.app.goo.gl."],
            ["Dans votre profil d'établissement", "Si vous gérez la fiche : sur Google, tapez « mon entreprise », puis « Partager le profil » et copiez le lien."],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5">
              <p className="font-mono text-xs font-semibold text-gray-500">0{i + 1}</p>
              <p className="mt-1 text-sm font-medium text-gray-950">{t}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{d}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
