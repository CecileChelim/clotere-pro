import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingShell } from "@/components/landing/ProductTemplate";
import CtaFooter from "@/components/landing/CtaFooter";
import ArticleBody, { CtaArticle } from "@/components/landing/blog/ArticleBody";
import { BlogHeader, Breadcrumb, PostCard, Toc } from "@/components/landing/blog/BlogParts";
import { Faq, JsonLd } from "@/components/landing/ui";
import { eyebrow, px } from "@/components/landing/styles";
import { metaPage, SHARE_IMAGE } from "@/content/avocat/shared";
import { blogPath, formatDate, getAllPosts, getPost, getRelatedPosts, headings, readingMinutes } from "@/lib/blog-avocat";
import { CTA_DEMO, CTA_SITE, SITE_URL } from "@/lib/landing-avocat";

type Params = { slug: string };

// SSG : une page par article ; tout autre slug → 404.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const meta = metaPage({ title: post.seoTitle ?? post.title, description: post.description, path: blogPath(post.slug), type: "article" });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: "article", publishedTime: post.date, modifiedTime: post.updated ?? post.date, section: post.category },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const related = getRelatedPosts(post);
  const url = `${SITE_URL}${blogPath(post.slug)}`;

  return (
    <LandingShell>
      <BlogHeader>
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
          <ArticleBody body={post.body} />
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

      <CtaFooter title="Mettez ces conseils en pratique." subtitle="Site, prise de rendez-vous et visibilité : en ligne en 10 minutes, sans engagement." ctas={[CTA_SITE, CTA_DEMO]} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          author: { "@type": "Organization", name: post.author, url: SITE_URL },
          image: `${SITE_URL}${SHARE_IMAGE.url}`,
          articleSection: post.category,
          publisher: { "@type": "Organization", name: "Clotere", url: SITE_URL },
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
