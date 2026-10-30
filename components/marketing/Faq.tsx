"use client";

import { useState } from "react";
import { IconChevronDown } from "@/components/ui/icons";

const QUESTIONS = [
  {
    q: "Ma fiche est-elle conforme aux obligations ORIAS ?",
    a: "Oui. Votre numéro ORIAS, votre statut et votre date d'inscription sont affichés de façon permanente sur votre fiche publique, conformément aux obligations d'information des CGP/CGPI.",
  },
  {
    q: "Puis-je résilier à tout moment ?",
    a: "Oui, l'abonnement à 69 €/mois est sans engagement. Vous pouvez résilier depuis votre espace CGP à tout moment, sans préavis ni frais de sortie.",
  },
  {
    q: "Où sont hébergées mes données ?",
    a: "Toutes les données sont hébergées en France, chez un prestataire conforme RGPD. Vous restez propriétaire de vos données et pouvez demander leur export ou suppression à tout moment.",
  },
  {
    q: "Combien de temps avant que ma fiche soit publiée ?",
    a: "Quelques minutes. Une fois votre profil complété (identité, spécialités, numéro ORIAS), votre fiche est publiée immédiatement et devient indexable par Google.",
  },
  {
    q: "Puis-je personnaliser mes disponibilités ?",
    a: "Oui. Vous définissez vos créneaux récurrents par jour de semaine, ainsi que des exceptions ponctuelles (congés, jours bloqués) depuis votre espace CGP.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="max-w-xl">
        <p className="eyebrow">FAQ</p>
        <h2 className="mt-3 font-serif text-3xl text-ink-2 sm:text-4xl">Questions fréquentes</h2>
      </div>

      <div className="card mt-10 divide-y divide-line overflow-hidden">
        {QUESTIONS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base font-medium text-ink-2">{item.q}</span>
                <IconChevronDown
                  className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="px-6 pb-6 text-sm leading-relaxed text-body">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
