"use client";

import { useState } from "react";

export function LienResa({ url, compact = false }: { url: string; compact?: boolean }) {
  const [copie, setCopie] = useState(false);
  const copier = async () => { try { await navigator.clipboard.writeText(url); setCopie(true); setTimeout(() => setCopie(false), 2000); } catch {} };
  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-1 rounded-full bg-white/60 py-1 pr-1 pl-4 ring-1 ring-black/10 backdrop-blur">
        <span className="hidden shrink-0 text-xs text-gray-950/60 xl:inline">Ma page de rdv</span>
        <span className="min-w-0 truncate font-mono text-xs text-gray-950 xl:ml-2">{url.replace(/^https?:\/\//, "")}</span>
        <button type="button" onClick={copier} className="ml-2 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-gray-950 hover:bg-white">
          {copie ? "✓ Copié" : "Copier"}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full bg-gray-950 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800">
          Ouvrir ↗
        </a>
      </div>
    );
  }
  return (
    <div className="mb-8 flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500">Votre page de prise de rendez-vous</p>
        <p className="truncate font-mono text-sm text-gray-950">{url.replace(/^https?:\/\//, "")}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button"
          onClick={async () => { try { await navigator.clipboard.writeText(url); setCopie(true); setTimeout(() => setCopie(false), 2000); } catch {} }}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-950 ring-1 ring-black/15 hover:bg-gray-100">
          {copie ? "✓ Copié" : "Copier le lien"}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          Ouvrir
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
        </a>
      </div>
    </div>
  );
}
