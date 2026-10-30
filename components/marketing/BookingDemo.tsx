"use client";

import { useEffect, useState } from "react";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";

/**
 * Démo animée du parcours de prise de RDV (téléphone/visio → motif →
 * créneau → confirmation), rejouée en boucle. Remplace le GIF mentionné
 * dans le brief par un composant React léger, sans dépendance.
 */

const MOTIFS = ["Bilan patrimonial", "Succession", "Optimisation fiscale", "Premier échange"];
const SLOTS = ["09:00", "11:30", "14:00", "16:30"];

const STEPS = [
  { key: "type", label: "1. Type de RDV" },
  { key: "motif", label: "2. Motif" },
  { key: "creneau", label: "3. Créneau" },
  { key: "confirmation", label: "4. Confirmé" },
] as const;

export function BookingDemo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedType, setSelectedType] = useState<"visio" | "tel">("visio");
  const [selectedMotif, setSelectedMotif] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = (prev + 1) % STEPS.length;
        if (next === 0) setSelectedType((t) => (t === "visio" ? "tel" : "visio"));
        if (next === 1) setSelectedMotif((m) => (m + 1) % MOTIFS.length);
        if (next === 2) setSelectedSlot((s) => (s + 1) % SLOTS.length);
        return next;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const step = STEPS[stepIndex].key;

  return (
    <div className="card w-full max-w-sm overflow-hidden shadow-[0_20px_60px_-15px_rgba(23,21,18,0.25)]">
      <div className="flex items-center justify-between border-b border-line bg-card-alt px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gold-2" />
          <div>
            <p className="text-sm font-medium text-ink-2">Claire Moreau</p>
            <p className="text-xs text-muted">Conseillère en gestion de patrimoine</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-5 pt-4">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
              i <= stepIndex ? "bg-gold" : "bg-line"
            }`}
          />
        ))}
      </div>

      <div className="min-h-[220px] px-5 py-5">
        {step === "type" && (
          <div>
            <p className="eyebrow">Type de rendez-vous</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(["visio", "tel"] as const).map((type) => (
                <div
                  key={type}
                  className={`rounded-md border px-3 py-3 text-center text-sm transition-colors duration-300 ${
                    selectedType === type
                      ? "border-ink-2 bg-ink-2 text-cream"
                      : "border-line text-body"
                  }`}
                >
                  {type === "visio" ? "Visioconférence" : "Téléphone"}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "motif" && (
          <div>
            <p className="eyebrow">Motif du rendez-vous</p>
            <div className="mt-3 space-y-2">
              {MOTIFS.map((motif, i) => (
                <div
                  key={motif}
                  className={`rounded-md border px-3 py-2.5 text-sm transition-colors duration-300 ${
                    selectedMotif === i
                      ? "border-ink-2 bg-card-alt text-ink-2"
                      : "border-line text-body"
                  }`}
                >
                  {motif}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "creneau" && (
          <div>
            <p className="eyebrow">Créneaux disponibles — jeudi 12 sept.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {SLOTS.map((slot, i) => (
                <div
                  key={slot}
                  className={`rounded-md border px-3 py-2.5 text-center text-sm transition-colors duration-300 ${
                    selectedSlot === i
                      ? "border-ink-2 bg-ink-2 text-cream"
                      : "border-line text-body"
                  }`}
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "confirmation" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-success">
              <IconCheck className="h-5 w-5" />
            </div>
            <p className="font-serif text-lg text-ink-2">Rendez-vous confirmé</p>
            <p className="text-sm text-muted">
              Jeudi 12 sept. · {SLOTS[selectedSlot]} · {selectedType === "visio" ? "Visio" : "Téléphone"}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-line px-5 py-4">
        <div className="btn-solid w-full">
          {step === "confirmation" ? "Ajouté à votre agenda" : "Continuer"}
          {step !== "confirmation" && <IconArrowRight className="h-4 w-4" />}
        </div>
      </div>
    </div>
  );
}
