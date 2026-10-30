"use client";

import { IconCheck } from "@/components/ui/icons";
import { SERVICE_PRESETS } from "@/lib/constants";
import type { ServiceDraft } from "./ServicesEditor";

export function ServicePresetsPicker({
  value,
  onChange,
}: {
  value: ServiceDraft[];
  onChange: (next: ServiceDraft[]) => void;
}) {
  // Cliquer sur un service déjà présent remet sa description et son tarif à
  // jour depuis le modèle (utile après une mise à jour des textes par
  // Moneago) au lieu de le retirer — le retrait se fait via le "×" dans la
  // liste ci-dessous, pour éviter de perdre du contenu par erreur.
  function apply(preset: (typeof SERVICE_PRESETS)[number]) {
    const exists = value.some((s) => s.titre === preset.titre);
    if (exists) {
      onChange(
        value.map((s) =>
          s.titre === preset.titre
            ? { ...s, description: preset.description, prix: preset.prix }
            : s
        )
      );
    } else {
      onChange([...value, { titre: preset.titre, description: preset.description, prix: preset.prix }]);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-2">Services courants</p>
      <p className="mb-3 text-xs text-muted">
        Cliquez pour ajouter un service — leur description est pré-remplie, vous pouvez la
        modifier juste en dessous. Un service déjà ajouté (en foncé) : recliquez dessus pour
        remettre sa description à jour depuis le modèle ; pour le retirer, utilisez le « × » dans
        la liste ci-dessous.
      </p>
      <div className="flex flex-wrap gap-2">
        {SERVICE_PRESETS.map((preset) => {
          const active = value.some((s) => s.titre === preset.titre);
          return (
            <button
              key={preset.titre}
              type="button"
              onClick={() => apply(preset)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                active
                  ? "border-ink-2 bg-ink-2 text-cream"
                  : "border-chip-line bg-white text-body hover:border-ink-2"
              }`}
            >
              {active && <IconCheck className="h-3.5 w-3.5" />}
              {preset.titre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
