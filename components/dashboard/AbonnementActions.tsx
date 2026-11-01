"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export function BoutonStripe({ action, children, className }: { action: "checkout" | "portal"; children: React.ReactNode; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button type="button" disabled={busy} className={className ?? "btn-solid disabled:opacity-50"}
        onClick={async () => {
          setBusy(true); setError("");
          const res = await fetch(`/api/stripe/${action}`, { method: "POST" });
          const j = await res.json().catch(() => ({}));
          if (j.url) { window.location.href = j.url; return; }
          setBusy(false); setError(j.error || "Une erreur est survenue.");
        }}>
        {busy ? "Redirection…" : children}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/** Masque le contenu de l'espace quand l'essai est terminé, sauf la page Abonnement. */
export function GardeAbonnement({ bloque, children, paywall }: { bloque: boolean; children: React.ReactNode; paywall: React.ReactNode }) {
  const path = usePathname();
  if (!bloque || path.startsWith("/dashboard/abonnement")) return <>{children}</>;
  return <>{paywall}</>;
}
