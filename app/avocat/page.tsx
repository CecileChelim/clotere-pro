import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import FeatureScroller, { type Feature } from "@/components/landing/FeatureScroller";
import { VisualPriseRdv, VisualSite, VisualVisibilite } from "@/components/landing/FeatureVisuals";
import Pricing from "@/components/landing/Pricing";
import CtaFooter from "@/components/landing/CtaFooter";
import { LandingShell } from "@/components/landing/ProductTemplate";
import { Carte, Faq, SectionHeading, Stats, type CarteData } from "@/components/landing/ui";
import { px } from "@/components/landing/styles";
import { FAQ_DEONTOLOGIE, FAQ_ENGAGEMENT, metaPage } from "@/content/avocat/shared";
import { CTA_DEMO, CTA_SITE, PAGES, SITE_URL } from "@/lib/landing-avocat";
import { JsonLd } from "@/components/landing/ui";
import { createClient } from "@/lib/supabase/server";

// Accueil avocat.clotere.fr (la racine du sous-domaine est réécrite vers /avocat, cf. proxy.ts).
// Maquette Figma « Avocat · Accueil (avocat.clotere.fr) ».

export const metadata: Metadata = metaPage({
  title: "Clotere Avocat — Site, rendez-vous et visibilité pour avocats",
  description:
    "Site internet, prise de rendez-vous en ligne, avis Google, référencement et IA : tout pour qu’un client choisisse votre cabinet d’avocat plutôt qu’un autre.",
  path: "/",
  absoluteTitle: true,
});

const cartes: CarteData[] = [
  {
    badge: "01",
    eyebrow: "SITE INTERNET",
    title: "Votre site en ligne en 10 minutes.",
    text: "Vous le créez seul, la prise de rendez-vous est incluse.",
    cta: { href: PAGES.site, label: "Créer mon site →" },
  },
  {
    badge: "02",
    eyebrow: "PRISE DE RENDEZ-VOUS",
    title: "Des rendez-vous qualifiés, 24h/24.",
    text: "Les demandes arrivent triées, directement dans votre agenda.",
    cta: { href: PAGES.rdv, label: "Découvrir la prise de rdv →" },
  },
  {
    badge: "03",
    eyebrow: "RÉFÉRENCEMENT",
    title: "Soyez l’avocat qu’on trouve sur Google et dans les IA.",
    text: "Articles, fiche Google et référencement local sur vos domaines.",
    cta: { href: PAGES.seo, label: "Découvrir le référencement →" },
  },
];

const stats = [
  { value: "85 %", label: "des demandes de rendez-vous arrivent hors horaires d’ouverture" },
  { value: "10 min", label: "pour mettre votre site en ligne avec notre éditeur" },
  { value: "24h/24", label: "vos clients réservent, même le dimanche soir" },
];

const features: Feature[] = [
  {
    eyebrow: "SITE INTERNET",
    title: "On crée un site à votre image.",
    text: "Un site moderne pour votre cabinet, à vos couleurs, avec vos domaines d’intervention et la prise de rendez-vous intégrée. En ligne en 10 minutes, modifiable à tout moment, sans prestataire.",
    href: PAGES.site,
    linkLabel: "Découvrir la création de site",
    visual: <VisualSite />,
  },
  {
    eyebrow: "PRISE DE RENDEZ-VOUS",
    title: "On transforme vos visiteurs en rendez-vous.",
    text: "Sur votre site, votre fiche Google ou votre signature mail, vos visiteurs réservent un créneau en un clic, même le dimanche soir. Chaque demande arrive qualifiée dans votre agenda.",
    href: PAGES.rdv,
    linkLabel: "Découvrir la prise de rendez-vous",
    visual: <VisualPriseRdv />,
  },
  {
    eyebrow: "RÉFÉRENCEMENT",
    title: "Vos futurs clients vous trouvent en premier.",
    text: "Articles sur vos domaines, fiche Google optimisée, Google Ads et visibilité dans les IA : quand un client cherche un avocat dans votre ville, c’est votre cabinet qui apparaît.",
    href: PAGES.seo,
    linkLabel: "Découvrir le référencement",
    visual: <VisualVisibilite />,
  },
];

const faq = [
  {
    q: "Est-ce que je peux vraiment créer mon site seul ?",
    a: "Oui. Vous répondez à quelques questions sur votre cabinet, l’éditeur génère un site complet que vous modifiez ensuite comme vous voulez.",
  },
  {
    q: "Puis-je garder mon nom de domaine ?",
    // TODO réponse à valider
    a: "Oui. Vous pouvez connecter le nom de domaine que votre cabinet utilise déjà, ou en choisir un nouveau au moment de la mise en ligne.",
  },
  FAQ_DEONTOLOGIE,
  FAQ_ENGAGEMENT,
];

export default async function AvocatAccueil() {
  // Bouton « Mon espace » si la personne est connectée
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: pro } = user
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("professionals").select("prenom, nom").eq("auth_user_id", user.id).maybeSingle()
    : { data: null };
  const espace = user
    ? { initiales: (pro ? `${pro.prenom?.[0] ?? ""}${pro.nom?.[0] ?? ""}` : (user.email?.[0] ?? "")).toUpperCase() }
    : null;

  return (
    <LandingShell>
      <Hero
        grand
        espace={espace}
        eyebrow="CROISSANCE DES CABINETS D’AVOCATS"
        title="Accélérez la croissance de votre cabinet"
        subtitle="Site internet, prise de rendez-vous, avis Google, référencement et IA : tout ce qu’il faut pour qu’un client choisisse votre cabinet plutôt qu’un autre."
        ctas={[CTA_DEMO]}
        cartes={
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
            {cartes.map((c) => (
              <Carte key={c.title} c={c} level="h2" />
            ))}
          </div>
        }
      />

      <section aria-label="Chiffres clés" className={`flex flex-col items-center pb-6 pt-12 lg:pt-[72px] ${px}`}>
        <Stats items={stats} />
      </section>

      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-20 px-4 py-16 sm:px-8 lg:gap-12 xl:px-16 2xl:px-[120px]">
        <div className="flex justify-center">
          <SectionHeading eyebrow="La plateforme" title="Devenez l’avocat qu’on trouve en premier." />
        </div>
        <FeatureScroller features={features} />
      </section>

      <Pricing />

      <section className={`flex flex-col items-center gap-10 py-20 lg:py-[120px] ${px}`}>
        <Faq items={faq} />
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
              logo: `${SITE_URL}/icons/icon-avocat-512.png`,
              sameAs: ["https://www.linkedin.com/company/clotere", "https://clotere.fr"],
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: "Clotere Avocat",
              url: SITE_URL,
              inLanguage: "fr-FR",
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
          ],
        }}
      />

      <CtaFooter title="Prêt à remplir votre agenda ? Lancez-vous aujourd’hui." subtitle="En ligne en 10 minutes, sans engagement." ctas={[CTA_SITE, CTA_DEMO]} />
    </LandingShell>
  );
}
