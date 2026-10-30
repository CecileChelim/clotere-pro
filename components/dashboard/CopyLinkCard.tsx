"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@/components/ui/icons";

export function CopyLinkCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible (permissions navigateur) : on ignore
      // silencieusement, le lien reste sélectionnable manuellement.
    }
  }

  return (
    <div className="card p-6">
      <p className="eyebrow">Votre lien de réservation</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 truncate rounded-md border border-line bg-card-alt px-4 py-3 font-mono text-sm text-ink-2">
          {url}
        </div>
        <button type="button" onClick={handleCopy} className="btn-solid shrink-0">
          {copied ? (
            <>
              <IconCheck className="h-4 w-4" /> Copié
            </>
          ) : (
            <>
              <IconCopy className="h-4 w-4" /> Copier le lien
            </>
          )}
        </button>
      </div>
    </div>
  );
}
