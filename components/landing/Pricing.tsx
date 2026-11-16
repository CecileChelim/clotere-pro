"use client";

import { useState } from "react";
import Link from "next/link";
import { CTA_SITE, DEMO_LINK, SIGNUP, type LandingConfig } from "@/lib/landing-config";
import { CheckIcon, ClockIcon, CrossIcon, SectionHeading } from "./ui";
import { btnMd, btnPrimary, btnSecondary, btnSoft } from "./styles";

type Ligne = [texte: string, etat: "inclus" | "exclu" | "bientot"];

type Offre = {
  nom: string;
  accroche: string;
  prix: number;
  badge?: { label: string; plein: boolean };
  cta: { label: string; href: string; style: "primary" | "secondary" | "soft" };
  lignes: Ligne[];
  /** Carte mise en avant (bordure couleur profession). */
  vedette?: boolean;
  /** Offre pas encore ouverte (prix grisé, fond teinté). */
  bientot?: boolean;
};

const OFFRES: Offre[] = [
  {
    nom: "Vitrine",
    accroche: "Pour être vu",
    prix: 69,
    cta: { label: "Créer mon site", href: CTA_SITE.href, style: "secondary" },
    lignes: [
      ["Site créé en 10 min avec notre éditeur", "inclus"],
      ["Nom de domaine et hébergement en France", "inclus"],
      ["Formulaire de contact", "inclus"],
      ["Référencement naturel basique", "inclus"],
      ["Prise de rendez-vous qualifiée", "exclu"],
      ["Blog", "exclu"],
      ["Récolte automatique des avis Google", "exclu"],
      ["Apport d’affaires", "exclu"],
    ],
  },
  {
    nom: "Rendez-vous",
    accroche: "Pour obtenir des clients",
    prix: 99,
    badge: { label: "LA PLUS POPULAIRE", plein: true },
    vedette: true,
    cta: { label: "Créer mon site", href: CTA_SITE.href, style: "primary" },
    lignes: [
      ["Tout l’offre Vitrine", "inclus"],
      ["Module de prise de rendez-vous qualifié", "inclus"],
      ["Blog pour votre référencement", "inclus"],
      ["Récolte automatique des avis Google", "inclus"],
      ["Synchronisation Google Agenda et Outlook", "inclus"],
      ["Apport d’affaires", "exclu"],
    ],
  },
  {
    nom: "Croissance",
    accroche: "Pour recevoir des dossiers",
    prix: 169,
    badge: { label: "OUVRE BIENTÔT", plein: false },
    bientot: true,
    cta: { label: "Être prévenu", href: DEMO_LINK, style: "soft" },
    lignes: [
      ["Tout l’offre Rendez-vous", "inclus"],
      ["Apport d’affaires : des dossiers envoyés par Clotere", "bientot"],
    ],
  },
];

/** Offre « outil seul » de la page prise de rendez-vous. */
const OUTIL: Offre = {
  nom: "Widget rdv",
  accroche: "Pour remplir votre agenda",
  prix: 69,
  badge: { label: "OUTIL SEUL", plein: true },
  vedette: true,
  cta: { label: "Essayer l’outil", href: SIGNUP, style: "primary" },
  lignes: [
    ["Module de prise de rendez-vous qualifié", "inclus"],
    ["Motifs et questions personnalisés", "inclus"],
    ["Synchronisation Google Agenda et Outlook", "inclus"],
    ["Confirmation et rappels automatiques", "inclus"],
    ["Site, fiche Google, LinkedIn, signature mail", "inclus"],
    ["Tableau de bord des demandes", "inclus"],
  ],
};

const euros = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;
const annuel = (n: number) => Math.round(n * 0.9 * 100) / 100;

function Carte({ o, annuelActif, sansAnnuel = false }: { o: Offre; annuelActif: boolean; sansAnnuel?: boolean }) {
  const prix = annuelActif ? annuel(o.prix) : o.prix;
  const ctaCls = o.cta.style === "primary" ? btnPrimary : o.cta.style === "soft" ? btnSoft : btnSecondary;
  const external = o.cta.href.startsWith("http");
  return (
    <article
      className={`flex flex-col gap-5 rounded-[32px] px-7 py-9 sm:px-8 ${
        o.vedette
          ? "border-2 border-brand bg-white drop-shadow-[0px_24px_28px_rgba(20,18,31,0.16)]"
          : o.bientot
            ? "border border-black/[0.07] bg-brand-section"
            : "border border-black/[0.07] bg-white drop-shadow-[0px_8px_12px_rgba(20,18,31,0.06)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[26px] font-semibold tracking-[-0.65px] text-nuit">{o.nom}</h3>
        {o.badge && (
          <span
            className={`whitespace-nowrap rounded-full px-3 py-[5px] font-geistmono text-[11px] font-semibold tracking-[0.66px] ${o.badge.plein ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}
          >
            {o.badge.label}
          </span>
        )}
      </div>
      <p className="text-[18px] font-medium italic text-brand">{o.accroche}</p>
      <p className="flex items-baseline gap-2">
        <span className={`font-manrope text-[52px] font-semibold tracking-[-1.3px] ${o.bientot ? "text-nuit/55" : "text-nuit"}`}>{euros(prix)}</span>
        <span className="text-[15px] text-nuit/60">HT / mois</span>
      </p>
      {!sansAnnuel && (
      <p className="-mt-2 text-[13px] text-nuit/60">
        {annuelActif ? `facturé annuellement, au lieu de ${euros(o.prix)} HT / mois` : `soit ${euros(annuel(o.prix))} HT / mois en annuel (-10 %)`}
      </p>
      )}
      {external ? (
        <a href={o.cta.href} target="_blank" rel="noopener noreferrer" className={`${ctaCls} ${btnMd} w-full`}>
          {o.cta.label}
        </a>
      ) : (
        <Link href={o.cta.href} className={`${ctaCls} ${btnMd} w-full`}>
          {o.cta.label}
        </Link>
      )}
      <div className="h-px w-full bg-black/[0.08]" />
      <ul className="flex flex-col gap-[14px]">
        {o.lignes.map(([texte, etat]) => (
          <li key={texte} className={`flex items-start gap-3 text-[15px] leading-[1.45] ${etat === "exclu" ? "text-[#9ca3af]" : "text-nuit"}`}>
            {etat === "inclus" ? <CheckIcon /> : etat === "exclu" ? <CrossIcon /> : <ClockIcon />}
            <span>{texte}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Section tarifs (maquette Figma « Tarifs ») : bascule mensuel / annuel (-10 %)
 * et cartes d'offres. `variant="outil"` : l'offre widget seule (page prise de rdv).
 */
export default function Pricing({ conf, variant = "offres" }: { conf: LandingConfig; variant?: "offres" | "outil" }) {
  const [annuelActif, setAnnuelActif] = useState(false);
  const outil = variant === "outil";
  const offres = outil ? [OUTIL] : OFFRES;

  return (
    <section id="tarifs" className="flex w-full scroll-mt-6 flex-col items-center gap-12 rounded-[40px] bg-brand-section px-4 py-20 sm:px-8 lg:gap-14 lg:px-[112px] lg:py-[120px]">
      <SectionHeading
        eyebrow={outil ? "Tarif" : "Tarifs"}
        title={outil ? "Un prix simple." : "Une offre pour chaque ambition."}
        subtitle={outil ? "L’outil seul, sans site, sans engagement. Paiement mensuel." : "Choisissez votre offre, changez quand vous voulez."}
      />

      {!outil && (
      <div role="group" aria-label="Période de facturation" className="flex gap-1 rounded-full border border-black/[0.08] bg-white p-1.5">
        {[
          [false, "Mensuel"],
          [true, "Annuel · -10 %"],
        ].map(([val, label]) => (
          <button
            key={String(val)}
            type="button"
            aria-pressed={annuelActif === val}
            onClick={() => setAnnuelActif(val as boolean)}
            className={`rounded-full px-[22px] py-[11px] text-[15px] font-semibold transition ${annuelActif === val ? "bg-brand text-white drop-shadow-[0px_6px_8px_rgba(20,18,31,0.18)]" : "text-nuit hover:bg-brand-soft"}`}
          >
            {label as string}
          </button>
        ))}
      </div>
      )}

      <div className={`grid w-full items-start gap-6 ${outil ? "max-w-[420px]" : "max-w-[1200px] grid-cols-1 md:grid-cols-3"}`}>
        {offres.map((o) => (
          <Carte key={o.nom} o={o} annuelActif={annuelActif} sansAnnuel={outil} />
        ))}
      </div>

      <p className="text-center text-[14px] text-nuit/60">
        {outil ? (
          <>
            Vous voulez aussi un site ? L’offre « Rendez-vous » à 99 € HT / mois inclut le module.{" "}
            <Link href={`${conf.pages.site}#tarifs`} className="font-semibold text-brand hover:brightness-110">
              Voir les offres site →
            </Link>
          </>
        ) : (
          "Prix HT. Offres sans engagement. Paiement annuel : -10 %."
        )}
      </p>
    </section>
  );
}
