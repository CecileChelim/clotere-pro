import Link from "next/link";
import { isExternal, type Cta, type LandingConfig } from "@/lib/landing-config";
import { Logo } from "./SiteNav";
import { CtaLink } from "./ui";
import { eyebrow } from "./styles";

/**
 * Bandeau d'appel à l'action + footer fusionnés (composant Figma « CTA + Footer ») :
 * un seul bloc, dégradé de la profession sur l'ensemble.
 */
export default function CtaFooter({ conf, title, subtitle, ctas }: { conf: LandingConfig; title: string; subtitle: string; ctas: Cta[] }) {
  return (
    <footer className="flex w-full flex-col rounded-[40px]" style={{ backgroundImage: "var(--brand-gradient)" }}>
      <div className="flex flex-col items-center gap-5 px-4 pb-[72px] pt-20 text-center sm:px-8 lg:px-[112px] lg:pt-24">
        <p className={`${eyebrow} text-brand`}>Commencer</p>
        <h2 className="max-w-[900px] text-[36px] font-semibold leading-[1.04] tracking-[-1.4px] text-nuit sm:text-[56px]">{title}</h2>
        <p className="text-[17px] text-nuit/70 sm:text-[18px]">{subtitle}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-3">
          {ctas.map((c, i) => (
            <CtaLink key={c.label} cta={{ ...c, style: c.style ?? (i === 0 ? "primary" : "secondary") }} />
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-[112px]">
        <div className="h-px w-full bg-nuit/10" />
      </div>

      <div className="flex flex-col gap-14 px-4 pb-10 pt-16 sm:px-8 lg:px-[112px]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:flex lg:gap-16">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-3 lg:w-[340px] lg:shrink-0">
            <Logo badge={conf.badge} />
            <p className="max-w-[300px] text-[14px] leading-[1.5] text-nuit/70">Sites, prise de rendez-vous et visibilité pour les professions réglementées.</p>
          </div>
          {conf.footer.map((col) => (
            <div key={col.titre} className="flex flex-col items-start gap-3 lg:flex-1">
              <p className="font-geistmono text-[11px] font-semibold uppercase tracking-[0.88px] text-nuit/55">{col.titre}</p>
              {col.liens.map((l) =>
                isExternal(l.href) ? (
                  <a key={l.href} href={l.href} className="text-[14px] text-nuit/95 hover:text-brand">
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} className="text-[14px] text-nuit/95 hover:text-brand">
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-black/10 pt-6 text-[12px] text-nuit/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Clotere SAS · {conf.disclaimer}</p>
          <a href="https://www.linkedin.com/company/clotere" aria-label="LinkedIn" className="hover:text-nuit">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
