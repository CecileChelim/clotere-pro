import type { Metadata } from "next";
import { LandingShell } from "@/components/landing/ProductTemplate";
import CtaFooter from "@/components/landing/CtaFooter";
import { BlogHeader, PostCard } from "@/components/landing/blog/BlogParts";
import { px } from "@/components/landing/styles";
import { JsonLd } from "@/components/landing/ui";
import { metaPage } from "@/content/avocat/shared";
import { blogPath, getAllPosts } from "@/lib/blog-avocat";
import { CTA_DEMO, CTA_SITE, SITE_URL } from "@/lib/landing-avocat";

export const metadata: Metadata = metaPage({
  title: "Blog : développer son cabinet d’avocat",
  description: "Visibilité, référencement, fiche Google, site internet, prise de rendez-vous : nos guides pratiques pour développer la clientèle de votre cabinet d’avocat.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <LandingShell>
      <BlogHeader>
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="rounded-full bg-white/75 px-[14px] py-1.5 font-geistmono text-[12px] font-semibold tracking-[0.96px] text-brand">BLOG</p>
          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] text-nuit sm:text-[56px]">Développer son cabinet d’avocat</h1>
          <p className="max-w-[640px] text-[17px] leading-[1.55] text-nuit/75 sm:text-[19px]">
            Visibilité, référencement, site internet, prise de rendez-vous : nos guides pratiques pour les cabinets.
          </p>
        </div>
      </BlogHeader>

      <section className={`flex justify-center py-16 lg:py-24 ${px}`}>
        <div className="grid w-full max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} headingLevel="h2" />
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog Clotere Avocat",
          url: `${SITE_URL}/blog`,
          inLanguage: "fr-FR",
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE_URL}${blogPath(p.slug)}`,
            datePublished: p.date,
          })),
        }}
      />

      <CtaFooter title="Mettez ces conseils en pratique." subtitle="Site, prise de rendez-vous et visibilité : en ligne en 10 minutes, sans engagement." ctas={[CTA_SITE, CTA_DEMO]} />
    </LandingShell>
  );
}
