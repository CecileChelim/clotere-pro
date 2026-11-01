"use client";

import { HONORAIRES_MODES, PAIEMENT_MOYENS, SERVICES } from "@/lib/honoraires";

export type HonorairesValue = { honoraires_modes: string[]; paiement_moyens: string[]; services: string[] };

function Chips({ items, value, onChange }: { items: { id: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x) => {
        const on = value.includes(x.id);
        return (
          <button key={x.id} type="button" onClick={() => onChange(on ? value.filter((v) => v !== x.id) : [...value, x.id])}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${on ? "bg-gray-950 text-white shadow-md" : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-950"}`}>
            {on ? "✓ " : ""}{x.label}
          </button>
        );
      })}
    </div>
  );
}

export function HonorairesEditor({ value, onChange }: { value: HonorairesValue; onChange: (v: HonorairesValue) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-950">Mode de facturation</p>
        <Chips items={HONORAIRES_MODES} value={value.honoraires_modes} onChange={(v) => onChange({ ...value, honoraires_modes: v })} />
        <p className="mt-2 text-xs text-gray-500">Affiché avec la mention : « Une convention d&apos;honoraires détaillée sera établie selon votre dossier. »</p>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-950">Moyens de paiement</p>
        <Chips items={PAIEMENT_MOYENS} value={value.paiement_moyens} onChange={(v) => onChange({ ...value, paiement_moyens: v })} />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-950">Services proposés</p>
        <Chips items={SERVICES} value={value.services} onChange={(v) => onChange({ ...value, services: v })} />
      </div>
    </div>
  );
}
