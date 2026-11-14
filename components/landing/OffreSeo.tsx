import { CTA_DEMO } from "@/lib/landing-avocat";
import { CheckItem, CtaLink, SectionHeading } from "./ui";

export type OffreSurMesure = { badge: string; titre: string; accroche: string; texte: string; inclus: string[] };

export const OFFRE_SEO: OffreSurMesure = {
  badge: "RÉFÉRENCEMENT",
  titre: "Votre référencement, pris en main.",
  accroche: "Être le cabinet que Google affiche dans votre ville.",
  texte: "Le tarif dépend de votre ville et de vos domaines : on vous le présente pendant la démo.",
  inclus: [
  "Stratégie de mots-clés locale, sur vos domaines et votre ville",
  "Articles rédigés par notre équipe, validés par vous, publiés chaque mois",
  "Optimisation technique de votre site",
  "Fiche Google optimisée et publications régulières",
  "Contenus structurés pour être cités par les IA",
  "Reporting mensuel : positions, visites et rendez-vous générés",
  ],
};

/**
 * Offre sur mesure (référencement, Google Ads, IA) : ce que comprend
 * l'accompagnement, sans prix, avec un CTA démo.
 */
export default function OffreSeo({ offre = OFFRE_SEO }: { offre?: OffreSurMesure }) {
  return (
    <section id="offre" className="flex w-full scroll-mt-6 flex-col items-center gap-12 rounded-[40px] bg-brand-section px-4 py-20 sm:px-8 lg:gap-14 lg:px-[112px] lg:py-[120px]">
      <SectionHeading eyebrow="L’offre Clotere" title={offre.titre} subtitle="Un accompagnement sur mesure pour votre cabinet, sans engagement." />
      <article className="flex w-full max-w-[880px] flex-col gap-8 rounded-[32px] border-2 border-brand bg-white p-7 drop-shadow-[0px_24px_28px_rgba(20,18,31,0.12)] sm:p-10 md:flex-row md:items-center md:gap-12">
        <div className="flex flex-col gap-4 md:w-[280px] md:shrink-0">
          <span className="self-start rounded-full bg-brand px-3 py-[5px] font-geistmono text-[11px] font-semibold tracking-[0.66px] text-white">{offre.badge}</span>
          <h3 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.7px] text-nuit">{offre.accroche}</h3>
          <p className="text-[15px] leading-[1.5] text-nuit/70">{offre.texte}</p>
          <div className="pt-2">
            <CtaLink cta={CTA_DEMO} />
          </div>
        </div>
        <div className="h-px w-full bg-black/[0.08] md:h-auto md:w-px md:self-stretch" />
        <ul className="flex flex-col gap-[14px]">
          {offre.inclus.map((l) => (
            <CheckItem key={l}>{l}</CheckItem>
          ))}
        </ul>
      </article>
    </section>
  );
}
