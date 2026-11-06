"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ActualiserAvis() {
  const router = useRouter();
  const [occupe, setOccupe] = useState(false);
  return (
    <button type="button" disabled={occupe} className="btn-outline"
      onClick={async () => { setOccupe(true); await fetch("/api/avis/sync", { method: "POST" }).catch(() => null); setOccupe(false); router.refresh(); }}>
      {occupe ? "Actualisation…" : "↻ Actualiser"}
    </button>
  );
}
