import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingShell } from "../ProductTemplate";
import CtaFooter from "../CtaFooter";
import ArticleBody, { CtaArticle } from "./ArticleBody";
import { BlogHeader, Breadcrumb, PostCard, Toc } from "./BlogParts";
import { Faq, JsonLd } from "../ui";
import { eyebrow, px } from "../styles";
import { metaPage, shareImage } from "@/lib/landing-meta";
import { blogPath, formatDate, getAllPosts, getPost, getRelatedPosts, headings, readingMinutes } from "@/lib/blog";
import { CONFIGS, CTA_DEMO, CTA_SITE, type ProfessionId } from "@/lib/landing-config";

/** Textes des pages blog par profession. */
const BLOG = {
  avocat: {
    title: "Blog : développer son cabinet d’avocat",
    h1: "Développer son cabinet d’avocat",
    description: "Visibilité, référencement, fiche Google, site internet, prise de rendez-vous : nos guides pratiques pour développer la clientèle de votre cabinet d’avocat.",
    lead: "Visibilité, référencement, site internet, prise de rendez-vous : nos guides pratiques pour les cabinets.",
  },
  comptable: {
    title: "Blog : développer son cabinet d’expertise comptable",
    h1: "Développer son cabinet d’expertise comptable",
    description: "Visibilité, référencement, fiche Google, site internet, prise de rendez-vous : nos guides pratiques pour développer la clientèle de votre cabinet d’expertise comptable.",
    lead: "Visibilité, référencement, site internet, prise de rendez-vous : nos guides pratiques pour les cabinets d’expertise comptable.",
  },
} as const;

const CTA_BLOG = { title: "Mettez ces conseils en pratique.", subtitle: "Site, prise de rendez-vous et visibilité : en ligne en 10 minutes, sans engagement.", ctas: [CTA_SITE, CTA_DEMO] };

export function blogIndexMetadata(profession: ProfessionId): Metadata {
  const t = BLOG[profession];
  return metaPage({ title: t.title, description: t.description, path: "/blog", profession });
}

export function BlogIndex({ profession }: { profession: ProfessionId }) {
  const conf = CONFIGS[profession];
  const t = BLOG[profession];
  const posts = getAllPosts(profession);
  return (
    <LandingShell conf={conf}>
      <BlogHeader conf={conf}>
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="rounded-full bg-white/75 px-[14px] py-1.5 font-geistmono text-[12px] font-semibold tracking-[0.96px] text-brand">BLOG</p>
          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-1.2px] text-nuit sm:text-[56px]">{t.h1}</h1>
          <p className="max-w-[640px] text-[17px] leading-[1.55] text-nuit/75 sm:text-[19px]">{t.lead}</p>
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
          name: `Blog ${conf.nom}`,
          url: `${conf.siteUrl}/blog`,
          inLanguage: "fr-FR",
          blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${conf.siteUrl}${blogPath(p.slug)}`, datePublished: p.date })),
        }}
      />

      <CtaFooter conf={conf} {...CTA_BLOG} />
    </LandingShell>
  );
}

export function blogArticleParams(profession: ProfessionId) {
  return getAllPosts(profession).map((p) => ({ slug: p.slug }));
}

export function blogArticleMetadata(profession: ProfessionId, slug: string): Metadata {
  const post = getPost(slug, profession);
  if (!post) return {};
  const meta = metaPage({ title: post.seoTitle ?? post.title, description: post.description, path: blogPath(post.slug), profession, type: "article" });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: "article", publishedTime: post.date, modifiedTime: post.updated ?? post.date, section: post.category },
  };
}

export function BlogArticle({ profession, slug }: { profession: ProfessionId; slug: string }) {
  const post = getPost(slug, profession);
  if (!post) notFound();
  const conf = CONFIGS[profession];
  const SITE_URL = conf.siteUrl;
  const related = getRelatedPosts(post, profession);
  const url = `${SITE_URL}${blogPath(post.slug)}`;

  return (
    <LandingShell conf={conf}>
      <BlogHeader conf={conf}>
        <div className="flex flex-col items-start gap-5">
          <Breadcrumb items={[{ href: "/", label: "Accueil" }, { href: "/blog", label: "Blog" }, { label: post.title }]} />
          <span className={`${eyebrow} rounded-full bg-white/75 px-3 py-1 text-[11px] text-brand`}>{post.category}</span>
          <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-1px] text-nuit sm:text-[48px]">{post.title}</h1>
          <p className="text-[18px] leading-[1.55] text-nuit/75">{post.description}</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-nuit/60">
            <span>
              Par <span className="font-semibold text-nuit">{post.author}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Publié le <time dateTime={post.date}>{formatDate(post.date)}</time>
            </span>
            {post.updated && post.updated !== post.date && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  Mis à jour le <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(post)} min de lecture</span>
          </p>
        </div>
      </BlogHeader>

      <article className={`flex justify-center pb-16 pt-12 ${px}`}>
        <div className="w-full max-w-[760px]">
          <Toc headings={headings(post)} />
          <ArticleBody body={post.body} profession={profession} />
          <CtaArticle />
          <aside className="rounded-[24px] border border-black/[0.08] p-7">
            <p className={`${eyebrow} text-brand`}>Notre solution</p>
            <p className="mt-2 font-manrope text-[22px] font-semibold text-nuit">{post.relatedLanding.label}</p>
            <Link href={post.relatedLanding.href} className="mt-3 inline-block text-[15px] font-semibold text-brand hover:brightness-110">
              Découvrir l’offre {post.relatedLanding.label} →
            </Link>
          </aside>
        </div>
      </article>

      {post.faq.length > 0 && (
        <section className={`flex flex-col items-center gap-10 py-16 ${px}`}>
          <Faq items={post.faq} />
        </section>
      )}

      {related.length > 0 && (
        <section className={`flex flex-col items-center gap-10 rounded-[40px] bg-brand-section py-16 lg:py-20 ${px}`}>
          <h2 className="text-[30px] font-semibold tracking-[-1px] text-nuit sm:text-[40px]">Articles liés</h2>
          <div className="grid w-full max-w-[1200px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <CtaFooter conf={conf} {...CTA_BLOG} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          author: { "@type": "Organization", name: post.author, url: SITE_URL },
          publisher: { "@type": "Organization", name: "Clotere", url: SITE_URL },
          image: `${SITE_URL}${shareImage(profession).url}`,
          articleSection: post.category,
          mainEntityOfPage: url,
          inLanguage: "fr-FR",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ],
        }}
      />
    </LandingShell>
  );
}
