"use client";

import { useState } from "react";
import type { OptionPayante } from "@/lib/options";

/** Bouton « Activer » d'une option payante : ouvre le paiement Stripe (upsell). */
export function ActiverOption({ option, label = "Activer ce service", className, clair = false }: {
  option: OptionPayante; label?: string; className?: string; clair?: boolean;
}) {
  const [etat, setEtat] = useState<"idle" | "envoi" | "erreur">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function activer() {
    setEtat("envoi");
    setMessage(null);
    const r = await fetch("/api/options/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ option }) }).catch(() => null);
    const json = (await r?.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
    if (json?.ok && json.url) { window.location.href = json.url; return; }
    setEtat("erreur");
    setMessage(json?.error ?? "Une erreur est survenue, réessayez.");
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <button type="button" onClick={activer} disabled={etat === "envoi"}
        className={className ?? `rounded-full px-5 py-3 text-sm font-medium text-gray-950 ring-1 disabled:opacity-50 ${clair ? "bg-white/40 ring-black/10 backdrop-blur hover:bg-white/60" : "bg-white ring-gray-300 hover:ring-gray-400"}`}>
        {etat === "envoi" ? "Ouverture du paiement…" : label}
      </button>
      {message && <span className="text-sm text-red-600">{message}</span>}
    </span>
  );
}
