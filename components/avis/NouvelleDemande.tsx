"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Envoyer une demande d'avis à un client (ancien client, dossier hors Clotere…). */
export function NouvelleDemande() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<"idle" | "envoi" | "ok" | "erreur">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setEtat("envoi");
    const r = await fetch("/api/avis/demandes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom, email }) }).catch(() => null);
    const json = (await r?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (json?.ok) {
      setEtat("ok"); setMessage(`Demande envoyée à ${email}.`); setNom(""); setEmail("");
      router.refresh();
    } else { setEtat("erreur"); setMessage(json?.error ?? "Une erreur est survenue."); }
  }

  return (
    <form onSubmit={envoyer} className="card p-5">
      <p className="font-medium text-gray-950">Demander un avis à un client</p>
      <p className="mt-1 text-sm text-gray-600">Pour un client suivi hors Clotere. Il reçoit un e-mail à votre nom avec le lien direct vers votre fiche, puis jusqu&apos;à 2 relances.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input className="input sm:w-56" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Prénom et nom" aria-label="Prénom et nom du client" />
        <input className="input flex-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail du client" aria-label="E-mail du client" required />
        <button type="submit" className="btn-solid shrink-0" disabled={etat === "envoi"}>{etat === "envoi" ? "Envoi…" : "Envoyer la demande"}</button>
      </div>
      {message && <p className={`mt-2 text-sm ${etat === "ok" ? "text-emerald-700" : "text-red-600"}`}>{message}</p>}
    </form>
  );
}
