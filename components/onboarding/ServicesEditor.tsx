"use client";

import { IconCross } from "@/components/ui/icons";
import { DEFAULT_SERVICE_PRICE } from "@/lib/constants";

export type ServiceDraft = { id?: string; titre: string; description: string; prix: string };

export function ServicesEditor({
  value,
  onChange,
}: {
  value: ServiceDraft[];
  onChange: (next: ServiceDraft[]) => void;
}) {
  function update(index: number, patch: Partial<ServiceDraft>) {
    onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...value, { titre: "", description: "", prix: DEFAULT_SERVICE_PRICE }]);
  }

  return (
    <div className="space-y-3">
      {value.map((service, i) => (
        <div key={service.id ?? i} className="card space-y-2 p-4">
          <div className="flex items-center gap-2">
            <input
              value={service.titre}
              onChange={(e) => update(i, { titre: e.target.value })}
              placeholder="Ex. Bilan patrimonial"
              className="flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-ink-2 outline-none focus:border-ink-2"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Retirer ce service"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-card-alt hover:text-ink-2"
            >
              <IconCross className="h-4 w-4" />
            </button>
          </div>
          <div>
            <textarea
              value={service.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder={
                "Présentez ce service en quelques phrases.\nPour une liste à puces, commencez une ligne par \"- \" :\n- Premier point\n- Second point"
              }
              rows={7}
              className="w-full rounded-md border border-line bg-white px-3 py-2 font-mono text-sm text-ink-2 outline-none focus:border-ink-2"
            />
            <p className="mt-1 text-xs text-muted">
              Astuce : une ligne commençant par « - » s&rsquo;affiche comme un point de liste sur
              votre fiche.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="shrink-0 text-xs text-muted">Tarif</label>
            <input
              value={service.prix}
              onChange={(e) => update(i, { prix: e.target.value })}
              placeholder={DEFAULT_SERVICE_PRICE}
              className="flex-1 rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink-2 outline-none focus:border-ink-2"
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="text-sm text-gold underline underline-offset-2">
        + Ajouter un service
      </button>
    </div>
  );
}
