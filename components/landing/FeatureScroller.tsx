"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckItem } from "./ui";
import { btnMd, btnSecondary, eyebrow } from "./styles";

export type Feature = {
  eyebrow: string;
  title: string;
  text: string;
  /** Liste à puces (pages produit / solution). */
  points?: string[];
  /** Lien vers la page détaillée. */
  href?: string;
  linkLabel?: string;
  visual: ReactNode;
};

type Variant = "home" | "product";

const styles: Record<Variant, { title: string; text: string; stage: string; textCol: string }> = {
  // Accueil : visuels photo de 460 / 560 px (FeatureVisuals)
  home: {
    title: "text-[32px] font-semibold leading-[1.12] tracking-[-1px] text-nuit sm:text-[40px]",
    text: "text-[17px] leading-[1.6] text-[#5c5a6b] sm:text-[18px]",
    stage: "top-[calc(50vh-230px)] h-[460px] xl:top-[calc(50vh-280px)] xl:h-[560px]",
    textCol: "lg:w-[380px] xl:w-[440px]",
  },
  // Pages produit / solution : panneau teinté de 440 px avec un aperçu d'interface
  product: {
    title: "text-[32px] font-semibold leading-[1.08] tracking-[-1px] text-nuit sm:text-[40px]",
    text: "text-[17px] leading-[1.55] text-nuit/70",
    stage: "top-[calc(50vh-220px)] h-[440px]",
    textCol: "lg:w-[400px] xl:w-[480px]",
  },
};

/** Panneau teinté des pages produit (calque « Visuel » du « Bloc feature »). */
function ProductPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex w-full items-center justify-center rounded-[32px] bg-brand-section px-4 sm:px-12 ${className}`}>{children}</div>;
}

/**
 * Blocs fonctionnalités en défilement (même comportement que le site notaire) :
 * sur desktop, les visuels restent fixés à droite (sticky) et seuls les textes
 * défilent ; le visuel affiché suit le texte au centre de l'écran. Sur mobile :
 * texte puis visuel. Tout le contenu est dans le HTML servi (SEO).
 */
export default function FeatureScroller({ features, variant = "home" }: { features: Feature[]; variant?: Variant }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const s = styles[variant];
  const isProduct = variant === "product";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      // Actif = le bloc qui croise la ligne médiane de l'écran
      { rootMargin: "-50% 0px -50% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex w-full flex-col gap-20 lg:flex-row lg:gap-12 xl:gap-[96px]">
      {/* Textes (défilent) */}
      <div className={`flex flex-col gap-20 lg:shrink-0 lg:gap-0 ${s.textCol}`}>
        {features.map((f, i) => (
          <div
            key={f.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-index={i}
            className="flex flex-col gap-10 lg:min-h-[70vh] lg:justify-center"
          >
            <div className={`flex flex-col ${isProduct ? "gap-4" : "gap-5"} transition-opacity duration-500 ${active === i ? "lg:opacity-100" : "lg:opacity-30"}`}>
              <p className={`${eyebrow} text-brand`}>{f.eyebrow}</p>
              <h3 className={s.title}>{f.title}</h3>
              <p className={s.text}>{f.text}</p>
              {f.points && (
                <ul className="flex flex-col gap-[10px] pt-1">
                  {f.points.map((p) => (
                    <CheckItem key={p}>{p}</CheckItem>
                  ))}
                </ul>
              )}
              {f.href &&
                (isProduct ? (
                  <Link href={f.href} className={`${btnSecondary} ${btnMd} mt-2 self-start`}>
                    {f.linkLabel ?? "En savoir plus"}
                  </Link>
                ) : (
                  <Link href={f.href} className="self-start pt-2 text-[16px] font-semibold text-brand hover:brightness-110">
                    {f.linkLabel ?? "En savoir plus"} <span aria-hidden="true">→</span>
                  </Link>
                ))}
            </div>
            {/* Mobile : visuel sous son texte */}
            <div className="lg:hidden">{isProduct ? <ProductPanel className="py-10">{f.visual}</ProductPanel> : f.visual}</div>
          </div>
        ))}
      </div>

      {/* Visuels (fixés à droite, desktop uniquement) */}
      <div className="hidden lg:block lg:min-w-0 lg:flex-1">
        <div className={`sticky ${s.stage}`}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`absolute inset-x-0 top-0 transition-all duration-700 ease-out ${isProduct ? "h-full" : ""} ${active === i ? "scale-100 opacity-100" : "pointer-events-none scale-[.97] opacity-0"}`}
            >
              {isProduct ? <ProductPanel className="h-full">{f.visual}</ProductPanel> : f.visual}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
