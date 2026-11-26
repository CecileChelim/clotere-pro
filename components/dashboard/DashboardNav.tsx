"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* Menu de l'espace pro : les modules souscrits en premier, puis les autres en dessous pour l'upsell.
   - Site internet (offre site), Rendez-vous + Agenda + Diffusion (prise de rdv), Visibilité, Avis Google
   - Toujours présents : Profil, Abonnement */

export type Modules = { site: boolean; rdv: boolean; leads: boolean; visibilite: boolean; avis: boolean; ads: boolean };

type Lien = { href: string; label: string; module?: keyof Modules; prefixe?: boolean; badge?: number };

export function DashboardNav({ modules, avisARepondre = 0, messagesNonLus = 0, pageSeule = false, widgetActif = false }: { modules: Modules; avisARepondre?: number; messagesNonLus?: number; pageSeule?: boolean; widgetActif?: boolean }) {
  const pathname = usePathname();
  const MODULES: Lien[] = [
    { href: "/dashboard", label: "Rendez-vous", module: "rdv" },
    { href: "/dashboard/site", label: "Mon site", module: "site", prefixe: true, badge: messagesNonLus },
    { href: "/dashboard/agenda", label: "Agenda", module: "rdv", prefixe: true },
    { href: "/dashboard/leads", label: "Apport d'affaires", module: "leads", prefixe: true },
    { href: "/dashboard/visibilite", label: "Visibilité", module: "visibilite", prefixe: true },
    { href: "/dashboard/avis", label: "Avis Google", module: "avis", prefixe: true, badge: avisARepondre },
    { href: "/dashboard/google-ads", label: "Google Ads", module: "ads", prefixe: true },
  ];
  // Formule page : l'apport d'affaires est la page elle-même, géré dans « Abonnement » (pas d'entrée dédiée).
  const liens = pageSeule ? MODULES.filter((l) => l.module !== "leads") : MODULES;
  const actifs = liens.filter((l) => modules[l.module!]);
  const inactifs = liens.filter((l) => !modules[l.module!]);
  // Formule page : le widget de prise de rdv (site, Google, LinkedIn, e-mail) est une offre à 69 € HT / mois.
  // Activé : entrée active vers les onglets d'installation de l'Agenda ; sinon proposé dans « Développez votre cabinet ».
  if (pageSeule && widgetActif) actifs.splice(2, 0, { href: "/dashboard/widget", label: "Widget rdv", prefixe: true });
  else if (pageSeule) inactifs.unshift({ href: "/dashboard/widget", label: "Widget rdv", prefixe: true });
  const general: Lien[] = [{ href: "/dashboard/fiche", label: "Profil" }, { href: "/dashboard/abonnement", label: "Abonnement" }];

  const item = (l: Lien, upsell = false) => {
    const actif = l.prefixe ? pathname.startsWith(l.href) : pathname === l.href;
    return (
      <Link key={l.href} href={l.href}
        className={`block whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
          actif ? "bg-gray-950 text-white shadow-md" : upsell ? "text-gray-400 hover:bg-gray-100 hover:text-gray-950" : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
        }`}>
        <span className="flex items-center justify-between gap-2">
          {l.label}
          {!upsell && !!l.badge && l.badge > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${actif ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"}`}>{l.badge}</span>
          )}
          {upsell && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${actif ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700"}`}>Activer</span>
          )}
        </span>
      </Link>
    );
  };

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col">
      {actifs.map((l) => item(l))}
      {general.map((l) => item(l))}
      {inactifs.length > 0 && (
        <>
          <p className="hidden px-3.5 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-widest text-gray-400 lg:block">Développez votre cabinet</p>
          {inactifs.map((l) => item(l, true))}
        </>
      )}
    </nav>
  );
}
