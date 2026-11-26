import { CONFIGS, type Cta, type ProfessionId } from "@/lib/landing-config";
import Hero from "./Hero";
import FeatureScroller, { type Feature } from "./FeatureScroller";
import Pricing from "./Pricing";
import CtaFooter from "./CtaFooter";
import { LandingShell } from "./ProductTemplate";
import { Carte, Faq, JsonLd, SectionHeading, Stats, type CarteData } from "./ui";
import { px } from "./styles";

/** Contenu de l'accueil d'un site vitrine (maquettes Figma « … · Accueil »). */
export type HomeData = {
  profession: ProfessionId;
  hero: { eyebrow: string; title: string; subtitle: string; ctas: Cta[]; note?: string };
  cartes: CarteData[];
  stats: { value: string; label: string }[];
  features: { eyebrow: string; title: string; items: Feature[] };
  faq: { q: string; a: string }[];
  cta: { title: string; subtitle: string; ctas: Cta[] };
};

/** Accueil : header avec cartes, chiffres, features en défilement, tarifs, FAQ, CTA + footer. */
export default function HomeTemplate({ data, espace }: { data: HomeData; espace?: { initiales: string } | null }) {
  const conf = CONFIGS[data.profession];
  const SITE_URL = conf.siteUrl;
  return (
    <LandingShell conf={conf}>
      <Hero
        conf={conf}
        grand
        espace={espace}
        {...data.hero}
        cartes={
          <div className={`grid grid-cols-1 gap-4 lg:gap-6 ${data.cartes.length > 3 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3"}`}>
            {data.cartes.map((c) => (
              <Carte key={c.title} c={c} level="h2" />
            ))}
          </div>
        }
      />

      <section aria-label="Chiffres clés" className={`flex flex-col items-center pb-6 pt-12 lg:pt-[72px] ${px}`}>
        <Stats items={data.stats} />
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-20 px-4 py-16 sm:px-8 lg:gap-12 xl:px-16 2xl:px-[120px]">
        <div className="flex justify-center">
          <SectionHeading eyebrow={data.features.eyebrow} title={data.features.title} />
        </div>
        <FeatureScroller features={data.features.items} />
      </section>

      <Pricing conf={conf} />

      <section className={`flex flex-col items-center gap-10 py-20 lg:py-[120px] ${px}`}>
        <Faq items={data.faq} />
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "Clotere",
              url: SITE_URL,
              logo: `${SITE_URL}/icons/icon-${conf.id}-512.png`,
              sameAs: ["https://www.linkedin.com/company/clotere", "https://clotere.fr"],
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: conf.nom,
              url: SITE_URL,
              inLanguage: "fr-FR",
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
          ],
        }}
      />

      <CtaFooter conf={conf} {...data.cta} />
    </LandingShell>
  );
}
