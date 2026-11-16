import Link from "next/link";
import type { ReactNode } from "react";
import { isExternal, type Cta } from "@/lib/landing-config";
import { btnMd, btnPrimary, btnSecondary, eyebrow } from "./styles";

/** Lien-bouton : externe (nouvel onglet) ou interne (next/link). */
/** `dataCta` : identifiant du bouton pour le tracking GTM (attribut data-cta, posé sur le <a> lui-même). */
export function CtaLink({ cta, className, dataCta }: { cta: Cta; className?: string; dataCta?: string }) {
  const cls = className ?? `${cta.style === "secondary" ? btnSecondary : btnPrimary} ${btnMd}`;
  if (isExternal(cta.href)) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={cls} data-cta={dataCta}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={cls} data-cta={dataCta}>
      {cta.label}
    </Link>
  );
}

/** Coche couleur profession (composant Figma « Item liste · Inclus »). */
export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} fill="none" aria-hidden="true" className={`mt-px shrink-0 text-brand ${className}`}>
      <path d="M3.75 9.375L7.125 12.75L14.25 5.625" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Croix grise (« Item liste · Exclu »). */
export function CrossIcon() {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} fill="none" aria-hidden="true" className="mt-px shrink-0 text-[#9ca3af]">
      <path d="M5.5 5.5L12.5 12.5M12.5 5.5L5.5 12.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

/** Horloge (« Item liste · Bientôt »). */
export function ClockIcon() {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} fill="none" aria-hidden="true" className="mt-px shrink-0 text-brand">
      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth={1.5} />
      <path d="M9 5.75V9L11 10.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[15px] leading-[1.45] text-nuit">
      <CheckIcon />
      <span>{children}</span>
    </li>
  );
}

/** En-tête de section (composant Figma « En-tête de section »). */
export function SectionHeading({ eyebrow: eb, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="flex w-full max-w-[880px] flex-col items-center gap-4 text-center">
      <p className={`${eyebrow} text-brand`}>{eb}</p>
      <h2 className="text-[34px] font-semibold leading-[1.06] tracking-[-1.2px] text-nuit sm:text-[48px]">{title}</h2>
      {subtitle && <p className="max-w-[720px] text-[17px] leading-[1.55] text-nuit/70 sm:text-[18px]">{subtitle}</p>}
    </div>
  );
}

/** 3 chiffres clés (composant Figma « Stat »). */
export function Stats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="grid w-full max-w-[1188px] grid-cols-1 gap-6 md:grid-cols-3">
      {items.map((s) => (
        <div key={s.value} className="flex flex-col gap-2 rounded-[24px] border border-black/[0.06] bg-white p-7 drop-shadow-[0px_4px_6px_rgba(20,18,31,0.05)]">
          <p className="font-manrope text-[40px] font-semibold tracking-[-1.1px] text-brand sm:text-[44px]">{s.value}</p>
          <p className="text-[14px] leading-[1.45] text-nuit/65">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export type CarteData = {
  badge: string;
  eyebrow: string;
  title: string;
  text: string;
  points?: string[];
  cta?: Cta;
};

/** Carte numérotée (composant Figma « Carte solution »). */
export function Carte({ c, compact = false, level = "h3" }: { c: CarteData; compact?: boolean; level?: "h2" | "h3" }) {
  const H = level;
  return (
    <article className="flex h-full flex-col gap-[14px] rounded-[32px] border border-black/[0.06] bg-white p-7 drop-shadow-[0px_16px_20px_rgba(20,18,31,0.08)] lg:p-8">
      <span className="flex size-12 items-center justify-center rounded-[14px] bg-brand-soft font-geistmono text-[15px] font-semibold text-brand">{c.badge}</span>
      <p className="font-geistmono text-[11px] font-semibold uppercase tracking-[0.88px] text-brand">{c.eyebrow}</p>
      <H className={`font-semibold leading-[1.15] tracking-[-0.6px] text-nuit ${compact ? "text-[22px]" : "text-[24px]"}`}>{c.title}</H>
      <p className="text-[15px] leading-[1.5] text-nuit/70">{c.text}</p>
      {c.points && (
        <ul className="flex flex-col gap-[10px] py-1">
          {c.points.map((p) => (
            <CheckItem key={p}>{p}</CheckItem>
          ))}
        </ul>
      )}
      {c.cta && (
        <div className="mt-auto flex justify-center pt-2">
          <CtaLink cta={c.cta} />
        </div>
      )}
    </article>
  );
}

/** Rangée de 3 cartes avec en-tête (« Comment ça marche », « Notre approche »). */
export function CartesSection({ eyebrow: eb, title, subtitle, items }: { eyebrow: string; title: string; subtitle?: string; items: CarteData[] }) {
  return (
    <>
      <SectionHeading eyebrow={eb} title={title} subtitle={subtitle} />
      <div className="grid w-full max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((c) => (
          <Carte key={c.title} c={c} />
        ))}
      </div>
    </>
  );
}

/** FAQ en accordéon (composant Figma « FAQ »). */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <>
      <SectionHeading eyebrow="FAQ" title="Vos questions, simplement." />
      <div className="flex w-full max-w-[880px] flex-col gap-3">
        {items.map((item, i) => (
          <details key={item.q} open={i === 0} className="group rounded-[20px] border border-black/[0.07] bg-white px-6 py-[22px] sm:px-7">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium text-nuit sm:text-[18px]">
              {item.q}
              <span aria-hidden="true" className="text-[22px] font-normal text-brand">
                <span className="group-open:hidden">+</span>
                <span className="hidden group-open:inline">–</span>
              </span>
            </summary>
            <p className="mt-[10px] text-[15px] leading-[1.55] text-nuit/70">{item.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
        }}
      />
    </>
  );
}

export type GuideData = {
  title: string;
  intro: string;
  sections: { title: string; paragraphs: string[] }[];
  /** Lien vers la version complète du guide (à brancher quand le guide existe). */
  link?: { href: string; label: string };
};

/** Guide textuel en bas de page (SEO), avec lien vers le guide complet. */
export function GuideArticle({ guide }: { guide: GuideData }) {
  return (
    <article className="flex w-full max-w-[880px] flex-col gap-[18px]">
      <p className={`${eyebrow} text-brand`}>Guide</p>
      <h2 className="text-[34px] font-bold leading-[1.14] tracking-[-1.2px] text-nuit sm:text-[44px]">{guide.title}</h2>
      <p className="text-[18px] leading-[1.55] text-[#4a4a59] sm:text-[20px]">{guide.intro}</p>
      {guide.sections.map((s) => (
        <div key={s.title} className="flex flex-col gap-[18px] pt-8">
          <h3 className="text-[24px] font-bold leading-[1.25] tracking-[-0.6px] text-nuit sm:text-[28px]">{s.title}</h3>
          {s.paragraphs.map((p) => (
            <p key={p} className="text-[17px] leading-[1.65] text-[#4a4a59]">
              {p}
            </p>
          ))}
        </div>
      ))}
      {guide.link && (
        <Link href={guide.link.href} className="self-start pt-6 text-[16px] font-semibold text-brand hover:brightness-110">
          {guide.link.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </article>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
