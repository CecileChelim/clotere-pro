"use client";

import { useEffect, useState } from "react";

const STEPS = 4;
const MOTIFS_DEFAUT = ["Droit de la famille", "Droit du travail", "Droit immobilier", "Droit des affaires"];
const types = ["Au cabinet", "En visio"];
const jours = [["Lun", "3"], ["Mar", "4"], ["Mer", "5"], ["Jeu", "6"]];
const heures = ["09:00", "10:30", "14:00", "16:30"];

function Option({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${active ? "bg-gray-950 text-white shadow-lg" : "bg-gray-50 text-gray-700 ring-1 ring-black/5"}`}>
      {label}
    </div>
  );
}

export type BookingAnimationProps = {
  initiales?: string; nom?: string; sousTitre?: string; motifs?: string[]; situation?: string; confirmation?: string; accent?: string;
};

export function BookingAnimation({
  initiales = "MD", nom = "Maître Durand", sousTitre = "Cabinet Durand Avocats · Paris 8e", motifs = MOTIFS_DEFAUT,
  situation = "Je souhaite engager une procédure de divorce par consentement mutuel…",
  confirmation = "Bonjour, Maître Durand vous recevra mardi. Pour gagner du temps, préparez votre livret de famille et la liste de vos biens communs.",
}: BookingAnimationProps = {}) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    const pick = setTimeout(() => setPicked(true), 1100);
    const next = setTimeout(() => {
      setPicked(false);
      setStep((s) => (s + 1) % STEPS);
    }, step === STEPS - 1 ? 3600 : 2000);
    return () => { clearTimeout(pick); clearTimeout(next); };
  }, [step]);

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5">
      <div className="flex items-center gap-3 bg-gray-950 px-6 py-4 text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">{initiales}</div>
        <div>
          <p className="text-sm font-semibold">{nom}</p>
          <p className="text-xs text-white/60">{sousTitre}</p>
        </div>
      </div>
      <div className="flex gap-1.5 px-6 pt-5">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-gray-950" : "bg-gray-200"}`} />
        ))}
      </div>
      <div key={step} className="min-h-[300px] animate-[fadeIn_.4s_ease-out] px-6 pt-5 pb-7">
        {step === 0 && (
          <>
            <p className="mb-4 text-base font-semibold text-gray-950">Quel est l&apos;objet de votre demande ?</p>
            <div className="space-y-2">{motifs.map((m, i) => <Option key={m} label={m} active={picked && i === 0} />)}</div>
          </>
        )}
        {step === 1 && (
          <>
            <p className="mb-4 text-base font-semibold text-gray-950">Type de rendez-vous</p>
            <div className="grid grid-cols-2 gap-2">{types.map((t, i) => <Option key={t} label={t} active={picked && i === 1} />)}</div>
            <p className="mt-6 mb-2 text-sm font-medium text-gray-950">Décrivez brièvement votre situation</p>
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 ring-1 ring-black/5">
              {situation}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <p className="mb-4 text-base font-semibold text-gray-950">Choisissez un créneau</p>
            <div className="grid grid-cols-4 gap-2">
              {jours.map(([j, n], i) => (
                <div key={j} className={`rounded-xl py-2 text-center text-xs transition-all duration-300 ${i === 1 ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-700 ring-1 ring-black/5"}`}>
                  <p>{j}</p><p className="text-base font-semibold">{n}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">{heures.map((h, i) => <Option key={h} label={h} active={picked && i === 2} />)}</div>
          </>
        )}
        {step === 3 && (
          <div className="flex flex-col items-center pt-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-950 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6"><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p className="mt-3 text-base font-semibold text-gray-950">Rendez-vous confirmé</p>
            <p className="text-sm text-gray-500">Mardi 4 · 14:00 · En visio</p>
            <div className={`mt-5 w-full rounded-xl bg-gray-50 p-4 text-left ring-1 ring-black/5 transition-all duration-500 ${picked ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">✦ Message de votre cabinet</p>
              <p className="mt-2 text-sm text-gray-700">{confirmation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
