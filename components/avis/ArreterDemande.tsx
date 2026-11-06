"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArreterDemande({ id }: { id: string }) {
  const router = useRouter();
  const [occupe, setOccupe] = useState(false);
  return (
    <button type="button" disabled={occupe} className="text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-gray-950 disabled:opacity-50"
      onClick={async () => {
        setOccupe(true);
        await fetch(`/api/avis/demandes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "arreter" }) }).catch(() => null);
        router.refresh();
      }}>
      {occupe ? "…" : "Arrêter les relances"}
    </button>
  );
}
