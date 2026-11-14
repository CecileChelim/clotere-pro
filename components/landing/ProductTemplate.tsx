import type { ReactNode } from "react";
import { CONFIGS, type Cta, type LandingConfig, type ProfessionId } from "@/lib/landing-config";
import { landingFonts } from "./fonts";
import Hero from "./Hero";
import FeatureScroller, { type Feature } from "./FeatureScroller";
import Pricing from "./Pricing";
import OffreSeo, { type OffreSurMesure } from "./OffreSeo";
import CtaFooter from "./CtaFooter";
import { CartesSection, Faq, GuideArticle, JsonLd, SectionHeading, Stats, type CarteData, type GuideData } from "./ui";
import { px } from "./styles";

/** Contenu d'une page produit / solution (gabarit des maquettes Figma avocat). */
export type ProductPageData = {
  /** Profession du site (avocat par défaut). */
  profession?: ProfessionId;
  /** Chemin de la page, ex. /produit/creation-site-internet-avocat */
  path: string;
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; subtitle: string; ctas: Cta[]; note?: string };
  stats: { value: string; label: string }[];
  /** « Comment ça marche » / « Notre approche » (facultatif). */
  cartes?: { eyebrow: string; title: string; subtitle?: string; items: CarteData[] };
  features: { title: string; items: Feature[] };
  /** Bloc après les fonctionnalités (ex. démo de réponse automatique). */
  apresFeatures?: ReactNode;
  /** offres = 3 offres site ; outil = widget seul ; objet = offre sur mesure sans prix (CTA démo). */
  pricing: "offres" | "outil" | OffreSurMesure;
  faq: { q: string; a: string }[];
  guide: GuideData;
  cta: { title: string; subtitle: string; ctas: Cta[] };
};

/** Coque commune des landings : polices, fond, espacement entre blocs arrondis. */
export function LandingShell({ conf, children }: { conf: LandingConfig; children: ReactNode }) {
  return <div data-profession={conf.id} className={`${landingFonts} lp flex flex-col gap-2 bg-white p-2 font-sans leading-[normal] text-nuit antialiased`}>{children}</div>;
}

/**
 * Gabarit des pages produit / solution : header (titre, sous-titre, CTA),
 * 3 chiffres, [comment ça marche], fonctionnalités en défilement, tarifs, FAQ,
 * guide textuel, CTA + footer.
 */
export default function ProductTemplate({ data }: { data: ProductPageData }) {
  const { hero, stats, cartes, features, apresFeatures, pricing, faq, guide, cta } = data;
  const conf = CONFIGS[data.profession ?? "avocat"];
  const SITE_URL = conf.siteUrl;
  return (
    <LandingShell conf={conf}>
      <Hero conf={conf} {...hero} />

      <section aria-label="Chiffres clés" className={`flex flex-col items-center pb-6 pt-12 lg:pt-[72px] ${px}`}>
        <Stats items={stats} />
      </section>

      {cartes && (
        <section className={`flex flex-col items-center gap-14 py-16 lg:py-[100px] ${px}`}>
          <CartesSection {...cartes} />
        </section>
      )}

      <section className={`flex flex-col items-center gap-16 py-10 lg:gap-10 ${px}`}>
        <SectionHeading eyebrow="Ce qui est inclus" title={features.title} />
        <div className="w-full max-w-[1200px]">
          <FeatureScroller variant="product" features={features.items} />
        </div>
      </section>

      {apresFeatures}

      {typeof pricing === "object" ? <OffreSeo offre={pricing} /> : <Pricing conf={conf} variant={pricing} />}

      <section className={`flex flex-col items-center gap-10 py-20 lg:py-[120px] ${px}`}>
        <Faq items={faq} />
      </section>

      <section className={`flex flex-col items-center pb-20 lg:pb-[120px] ${px}`}>
        <GuideArticle guide={guide} />
      </section>

      <CtaFooter conf={conf} {...cta} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              name: data.meta.title,
              description: data.meta.description,
              url: `${SITE_URL}${data.path}`,
              serviceType: data.meta.title,
              areaServed: { "@type": "Country", name: "France" },
              audience: { "@type": "BusinessAudience", audienceType: conf.audience },
              provider: { "@type": "Organization", name: "Clotere", url: SITE_URL },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: data.meta.title, item: `${SITE_URL}${data.path}` },
              ],
            },
          ],
        }}
      />
    </LandingShell>
  );
}
