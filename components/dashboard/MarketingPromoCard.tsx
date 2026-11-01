"use client";

import { useEffect, useState } from "react";

const DEMO_LINK = "https://calendar.app.google/k2btydyaoysdvgTx6";
const KEY = "clotere_pro_promo_marketing_masquee";

/** Carte d'upsell vers l'offre marketing (site + SEO + fiche Google). */
export function MarketingPromoCard({ compact = false, profession = "avocat" }: { compact?: boolean; profession?: string }) {
  const offreUrl = profession === "comptable" ? "/#offres" : "https://avocat.clotere.fr/#offres";
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try { setHidden(!compact && localStorage.getItem(KEY) === "1"); } catch { setHidden(false); }
  }, [compact]);
  if (hidden) return null;

  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-4 ring-1 ring-black/5">
        <div className="bg-brand-gradient absolute inset-0 opacity-60" />
        <div className="relative">
          <p className="text-sm font-semibold text-gray-950">Être n°1 sur Google ?</p>
          <p className="mt-1 text-xs text-gray-950/70">Site, SEO et fiche Google gérés pour vous.</p>
          <a href={DEMO_LINK} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-full bg-gray-950 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-gray-800">
            En parler →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-8 overflow-hidden rounded-[2rem] ring-1 ring-black/5">
      <div className="bg-brand-gradient absolute inset-0" />
      <button type="button" aria-label="Masquer"
        onClick={() => { setHidden(true); try { localStorage.setItem(KEY, "1"); } catch {} }}
        className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/50 text-gray-950/60 backdrop-blur hover:bg-white/80 hover:text-gray-950">
        ✕
      </button>
      <div className="relative grid grid-cols-1 gap-6 p-8 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-950/60">Offre Croissance</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-gray-950 sm:text-4xl">
            Besoin d&apos;un site ? Envie d&apos;être le premier cabinet sur Google ?
          </h2>
          <p className="mt-3 max-w-xl text-[15px] text-gray-950/75">
            On s&apos;occupe de votre visibilité pendant que vous {profession === "comptable" ? "restez sur vos dossiers" : "plaidez"} : plus de visites, plus de demandes, directement dans votre agenda.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={DEMO_LINK} target="_blank" rel="noopener noreferrer"
              className="rounded-full bg-gray-950 px-5 py-3 text-sm font-medium text-white shadow-md hover:bg-gray-800">
              Réserver un appel de 15 min
            </a>
            <a href={offreUrl} target="_blank" rel="noopener noreferrer"
              className="rounded-full bg-white/40 px-5 py-3 text-sm font-medium text-gray-950 ring-1 ring-black/10 backdrop-blur hover:bg-white/60">
              Découvrir l&apos;offre
            </a>
          </div>
        </div>
        <ul className="space-y-3 rounded-2xl bg-white/70 p-6 text-sm text-gray-800 shadow-sm ring-1 ring-black/5 backdrop-blur">
          {[
            ["Site internet clé en main", "Moderne, rapide, conforme à la déontologie"],
            ["Articles SEO chaque mois", "Sur vos spécialités et votre ville"],
            ["Fiche Google optimisée", "Avis, photos, bouton « Prendre rendez-vous »"],
            ["Reporting mensuel", "Positions Google, visites et rendez-vous"],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-950 text-[10px] text-white">✓</span>
              <span><span className="font-medium text-gray-950">{t}</span><span className="block text-xs text-gray-500">{d}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
