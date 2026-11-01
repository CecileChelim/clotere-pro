"use client";

import { useEffect, useState } from "react";

/** Lien « Clotere Avocat » qui ouvre le panneau « À propos » (même contenu que sur la page de prise de rdv). */
export function AboutDrawer({ profession, label, className }: { profession: "avocat" | "comptable"; label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const avocat = profession === "avocat";
  const nom = avocat ? "Clotere" : "Clotere";
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className ?? "font-semibold text-violet-600 hover:underline"}>{label}</button>
      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-gray-900/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        <aside role="dialog" aria-modal="true" aria-label={`À propos de ${nom}`}
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white text-left shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4"><path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <p className="text-lg font-semibold text-gray-900">À propos de {nom}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50" aria-label="Fermer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <p className="text-[15px] leading-relaxed text-gray-600">
              {avocat ? "Votre avocat" : "Votre cabinet"} utilise {nom} pour vous permettre de prendre rendez-vous en ligne, à toute heure et sans appel téléphonique.
            </p>
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">Vos données sont protégées</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Conforme au RGPD. Vos coordonnées sont transmises uniquement {avocat ? "à votre avocat" : "à votre cabinet"}, jamais revendues, et tous les échanges sont chiffrés (HTTPS).
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-violet-600">24h/24</p><p className="text-sm text-gray-500">réservation en ligne</p></div>
              <div className="rounded-xl border border-gray-200 p-4"><p className="text-2xl font-bold text-violet-600">Gratuit</p><p className="text-sm text-gray-500">pour les clients</p></div>
            </div>
            <ul className="mt-6 space-y-5">
              {[
                ["FR", "Une société française", "Basée à Paris, Clotere travaille exclusivement avec des professionnels du droit et du chiffre réglementés."],
                ["?", "Comment ça fonctionne ?", `Vous envoyez une demande, ${avocat ? "l'avocat" : "le cabinet"} la confirme par email.`],
              ].map(([ic, t, d]) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs font-bold text-violet-700">{ic}</span>
                  <div><p className="font-semibold text-gray-900">{t}</p><p className="mt-0.5 text-sm leading-relaxed text-gray-500">{d}</p></div>
                </li>
              ))}
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs font-bold text-violet-700">@</span>
                <div><p className="font-semibold text-gray-900">Une question ?</p><p className="mt-0.5 text-sm text-gray-500">Notre équipe vous répond par email :</p>
                  <a href="mailto:contact@clotere.fr" className="mt-1 inline-block text-sm font-semibold text-violet-600 hover:underline">contact@clotere.fr</a></div>
              </li>
            </ul>
          </div>
          <div className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
            <a href={avocat ? "https://avocat.clotere.fr" : "https://comptable.clotere.fr"} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">{avocat ? "avocat.clotere.fr" : "comptable.clotere.fr"}</a>
            {" · "}<a href="https://notaire.clotere.fr/mentions-legales" className="hover:text-gray-900">Mentions légales</a>
            {" · "}<a href="https://notaire.clotere.fr/politique-confidentialite" className="hover:text-gray-900">Confidentialité</a>
          </div>
        </aside>
      </div>
    </>
  );
}
