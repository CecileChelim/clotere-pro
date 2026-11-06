"use client";

import { useState } from "react";

export function CopierLien({ lien }: { lien: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input readOnly value={lien} className="input flex-1 text-gray-600" aria-label="Lien direct vers votre fiche pour laisser un avis" onFocus={(e) => e.currentTarget.select()} />
      <button type="button" className="btn-outline shrink-0" onClick={async () => { await navigator.clipboard.writeText(lien).catch(() => {}); setOk(true); setTimeout(() => setOk(false), 2000); }}>
        {ok ? "✓ Copié" : "Copier le lien"}
      </button>
    </div>
  );
}
