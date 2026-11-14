import type { ReactNode } from "react";
import type { Cta } from "@/lib/landing-avocat";
import SiteNav from "./SiteNav";
import { CtaLink } from "./ui";

/**
 * Header de landing (composant Figma « Header · avec cartes ») : navigation,
 * pastille, titre, sous-titre et CTA sur le dégradé de la profession. Si des
 * cartes sont passées (accueil), elles sont posées à cheval sur le dégradé.
 */
export default function Hero({
  eyebrow,
  title,
  subtitle,
  ctas,
  note,
  cartes,
  espace,
  grand = false,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  ctas: Cta[];
  note?: string;
  cartes?: ReactNode;
  espace?: { initiales: string } | null;
  /** Titre plus grand (accueil). */
  grand?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center ${cartes ? "pb-6" : ""}`}>
      <header
        className={`flex w-full flex-col items-center gap-16 rounded-[40px] px-4 pt-6 sm:px-8 sm:pt-8 lg:gap-[96px] lg:px-[104px] ${
          cartes ? "pb-[248px] lg:pb-[272px]" : "pb-20 lg:pb-[120px]"
        }`}
        style={{ backgroundImage: "var(--brand-gradient)" }}
      >
        <SiteNav espace={espace} />
        <div className="flex w-full max-w-[1080px] flex-col items-center gap-6 text-center">
          <p className="rounded-full bg-white/75 px-[14px] py-1.5 font-geistmono text-[11px] font-semibold tracking-[0.96px] text-brand sm:text-[12px]">{eyebrow}</p>
          <h1
            className={`font-semibold text-nuit ${
              grand ? "text-[44px] leading-[1.02] tracking-[-1.2px] sm:text-[60px] lg:text-[72px] lg:tracking-[-1.8px]" : "text-[40px] leading-[1.04] tracking-[-1.2px] sm:text-[56px] lg:text-[68px] lg:tracking-[-2px]"
            }`}
          >
            {title}
          </h1>
          <p className="max-w-[820px] text-[17px] leading-[1.55] text-nuit/75 sm:text-[19px]">{subtitle}</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {ctas.map((c, i) => (
              <CtaLink key={c.label} cta={{ ...c, style: c.style ?? (i === 0 ? "primary" : "secondary") }} />
            ))}
          </div>
          {note && <p className="text-[13px] text-nuit/55">{note}</p>}
        </div>
      </header>
      {cartes && <div className="relative -mt-[200px] w-full max-w-[1200px] px-2 md:px-4 xl:px-0">{cartes}</div>}
    </div>
  );
}
