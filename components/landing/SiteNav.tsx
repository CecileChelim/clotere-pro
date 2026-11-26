"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LOGIN, type LandingConfig, type MenuEntry } from "@/lib/landing-config";
import { btnMd, btnPrimary, btnSecondary } from "./styles";

type MenuKey = "produits" | "solutions";

const LIENS = [{ href: "/blog", label: "Blog" }];

const itemCls = "flex items-center gap-1.5 whitespace-nowrap rounded-full px-[14px] py-2 text-[15px] font-medium leading-normal text-nuit transition-colors";

/** Logo texte « Clotere » + pastille profession (maquette Figma « Navigation »). */
export function Logo({ badge, className = "" }: { badge: string; className?: string }) {
  return (
    <span className={`flex items-center gap-[10px] ${className}`}>
      <span className="font-manrope text-[22px] font-bold tracking-[-0.55px] text-nuit">Clotere</span>
      <span className="rounded-full bg-brand-soft px-3 py-[5px] font-geistmono text-[11px] font-semibold tracking-[0.66px] text-brand">{badge}</span>
    </span>
  );
}

/**
 * Navigation des sites vitrines : Produits ▾ / Solutions ▾ / Blog, comme le site
 * notaire. Tous les liens des menus sont dans le HTML servi (SEO) ; seule
 * l'ouverture est côté client.
 */
export default function SiteNav({ conf, espace }: { conf: LandingConfig; espace?: { initiales: string } | null }) {
  const MENUS: { key: MenuKey; label: string; entries: MenuEntry[] }[] = [
    { key: "produits", label: "Produits", entries: conf.produits },
    { key: "solutions", label: "Solutions", entries: conf.solutions },
  ];
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<MenuKey | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => setOpen(null), []);

  // Fermeture au changement de page
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
    setMobileOpen(false);
  }

  // Fermeture : Échap, clic en dehors
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close]);

  // Survol souris : ouverture immédiate, fermeture avec un léger délai
  const hoverOpen = (key: MenuKey) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(key);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(close, 150);
  };

  const current = MENUS.find((m) => m.key === open);
  const primary = `${btnPrimary} ${btnMd}`;
  const secondary = `${btnSecondary} ${btnMd}`;

  return (
    <nav ref={navRef} aria-label="Navigation principale" className="relative z-40 flex w-full max-w-[1200px] items-center justify-between" onPointerLeave={hoverClose}>
      <Link href="/" aria-label={`${conf.nom} — accueil`}>
        <Logo badge={conf.badge} />
      </Link>

      {/* Menu desktop */}
      <ul className="hidden items-center gap-1 lg:flex">
        {MENUS.map((m) => (
          <li key={m.key} onPointerEnter={hoverOpen(m.key)}>
            <button
              type="button"
              aria-expanded={open === m.key}
              aria-controls={`menu-${m.key}`}
              onClick={() => setOpen((o) => (o === m.key ? null : m.key))}
              className={`${itemCls} ${open === m.key ? "bg-white/90" : "hover:bg-white/60"}`}
            >
              {m.label}
              <ChevronDownIcon aria-hidden="true" className={`size-3.5 transition-transform ${open === m.key ? "rotate-180" : ""}`} />
            </button>
          </li>
        ))}
        {LIENS.map((l) => (
          <li key={l.href} onPointerEnter={() => setOpen(null)}>
            <Link href={l.href} className={`${itemCls} hover:bg-white/60`}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-[10px]">
        <div className="hidden sm:block">
          {espace ? (
            <Link href="/dashboard" className={`${btnSecondary} gap-2 py-[7px] pl-[7px] pr-4 text-[15px]`}>
              <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand">{espace.initiales}</span>
              Mon espace
            </Link>
          ) : (
            <a href={LOGIN} className={secondary}>
              Connexion
            </a>
          )}
        </div>
        <div className="hidden min-[480px]:block">
          <Link href={conf.ctaPage.href} className={primary} data-cta="header">
            {conf.ctaPage.label}
          </Link>
        </div>
        <button type="button" onClick={() => setMobileOpen(true)} className="-mr-1 rounded-full p-2 text-nuit hover:bg-white/60 lg:hidden" aria-expanded={mobileOpen}>
          <span className="sr-only">Ouvrir le menu</span>
          <Bars3Icon aria-hidden="true" className="size-6" />
        </button>
      </div>

      {/* Panneaux déroulants desktop : rendus dans le HTML, affichés à l'ouverture */}
      {MENUS.map((m) => (
        <div
          key={m.key}
          id={`menu-${m.key}`}
          onPointerEnter={hoverOpen(m.key)}
          className={`absolute inset-x-0 top-[calc(100%+24px)] z-50 hidden justify-center gap-6 rounded-[20px] border border-black/[0.06] bg-white px-12 py-10 text-center drop-shadow-[0px_24px_24px_rgba(20,18,51,0.14)] ${open === m.key ? "lg:flex" : ""}`}
        >
          {m.entries.map((e) => (
            <Link key={e.href} href={e.href} onClick={close} className="flex w-[260px] flex-col items-center gap-[10px] rounded-2xl p-5 transition-colors hover:bg-brand-section">
              <span className="w-full font-manrope text-[22px] font-semibold leading-normal tracking-[-0.44px] text-nuit">{e.label}</span>
              <span className="w-full text-[15px] leading-[1.45] text-[#6b6b7a]">{e.description}</span>
            </Link>
          ))}
        </div>
      ))}

      {/* Voile derrière le panneau ouvert */}
      {current && <div aria-hidden="true" className="fixed inset-0 -z-10 hidden bg-[rgba(20,18,51,0.1)] lg:block" onClick={close} />}

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="fixed inset-0 z-50 bg-nuit/20" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col gap-6 overflow-y-auto bg-white p-6 sm:max-w-sm">
            <div className="flex items-center justify-between">
              <Logo badge={conf.badge} />
              <button type="button" onClick={() => setMobileOpen(false)} className="-mr-2 rounded-full p-2 text-nuit">
                <span className="sr-only">Fermer</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <ul className="flex flex-col">
              {MENUS.map((m) => (
                <li key={m.key}>
                  <button
                    type="button"
                    aria-expanded={mobileSection === m.key}
                    onClick={() => setMobileSection((s) => (s === m.key ? null : m.key))}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-nuit hover:bg-brand-soft"
                  >
                    {m.label}
                    <ChevronDownIcon aria-hidden="true" className={`size-4 transition-transform ${mobileSection === m.key ? "rotate-180" : ""}`} />
                  </button>
                  {mobileSection === m.key && (
                    <ul className="mb-2 ml-3 flex flex-col border-l border-black/10 pl-3">
                      {m.entries.map((e) => (
                        <li key={e.href}>
                          <Link href={e.href} className="block rounded-lg px-3 py-2 hover:bg-brand-soft">
                            <span className="block text-[15px] font-semibold text-nuit">{e.label}</span>
                            <span className="block text-[13px] text-[#6b6b7a]">{e.description}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              {LIENS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-3 text-base font-medium text-nuit hover:bg-brand-soft">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 border-t border-black/10 pt-6">
              <Link href={conf.ctaPage.href} className={primary} data-cta="header">
                {conf.ctaPage.label}
              </Link>
              {espace ? (
                <Link href="/dashboard" className={secondary}>
                  Mon espace
                </Link>
              ) : (
                <a href={LOGIN} className={secondary}>
                  Connexion
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
