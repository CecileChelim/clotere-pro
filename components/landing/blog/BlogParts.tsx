import Link from "next/link";
import type { ReactNode } from "react";
import { blogPath, formatDate, readingMinutes, type BlogPost, type Heading } from "@/lib/blog-avocat";
import SiteNav from "../SiteNav";
import { eyebrow } from "../styles";

/** Header compact du blog : navigation + contenu sur le dégradé de la profession. */
export function BlogHeader({ children }: { children: ReactNode }) {
  return (
    <header
      className="flex w-full flex-col items-center gap-14 rounded-[40px] px-4 pb-16 pt-6 sm:px-8 sm:pt-8 lg:gap-20 lg:px-[104px] lg:pb-20"
      style={{ backgroundImage: "var(--brand-gradient)" }}
    >
      <SiteNav />
      <div className="w-full max-w-[880px]">{children}</div>
    </header>
  );
}

/** Carte article. */
export function PostCard({ post, headingLevel = "h3" }: { post: BlogPost; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="relative flex flex-col rounded-[24px] border border-black/[0.06] bg-white p-7 drop-shadow-[0px_8px_12px_rgba(20,18,31,0.06)] transition hover:-translate-y-1">
      <span className={`${eyebrow} self-start rounded-full bg-brand-soft px-3 py-1 text-[11px] text-brand`}>{post.category}</span>
      <H className="mt-4 text-[20px] font-semibold leading-snug tracking-[-0.3px] text-nuit">
        <Link href={blogPath(post.slug)} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </H>
      <p className="mt-3 flex-1 text-[15px] leading-[1.5] text-nuit/70">{post.description}</p>
      <p className="mt-5 text-[13px] text-nuit/50">
        <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(post)} min de lecture
      </p>
    </article>
  );
}

/** Table des matières (H2 de l'article). */
export function Toc({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) return null;
  return (
    <nav aria-labelledby="toc-title" className="rounded-[24px] bg-brand-section p-6 ring-1 ring-inset ring-black/5">
      <p id="toc-title" className={`${eyebrow} text-brand`}>
        Sommaire
      </p>
      <ol className="mt-4 space-y-2 text-[15px]">
        {headings.map((h, i) => (
          <li key={h.id} className="flex gap-2">
            <span className="text-nuit/40">{i + 1}.</span>
            <a href={`#${h.id}`} className="text-nuit/80 hover:text-brand">
              {h.text.replace(/^\d+\.\s*/, "")}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Fil d'Ariane (le dernier élément est la page courante). */
export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-[14px] text-nuit/60">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">›</span>}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className="hover:text-brand">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-nuit">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
