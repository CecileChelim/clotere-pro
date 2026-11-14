// Blogs des sites vitrines : articles écrits dans content/blog-avocat/*.ts et content/blog-comptable/*.ts.
// Corps au format « markdown léger » (voir components/landing/blog/ArticleBody.tsx) :
//   ## Titre H2 · ### Titre H3 · lignes « - » (liste) · lignes « 1. » (liste numérotée)
//   > citation · ::illustration nom | légende · ::photo nom | légende · ::demo
//   **gras** et [lien](/chemin) dans le texte.

import { etreVisibleAvocat } from "@/content/blog-avocat/etre-visible-avocat";
import { rendezVousQualifiesAvocat } from "@/content/blog-avocat/rendez-vous-qualifies-avocat";
import { ficheGoogleAvocat } from "@/content/blog-avocat/fiche-google-avocat";
import { siteInternetAvocatGuide } from "@/content/blog-avocat/site-internet-avocat-guide";
import { visibiliteReferencementAvocat } from "@/content/blog-avocat/visibilite-referencement-avocat";
import { BLOG_COMPTABLE } from "@/content/blog-comptable";
import type { ProfessionId } from "@/lib/landing-config";

export type FaqItem = { q: string; a: string };

export type BlogPost = {
  slug: string;
  title: string;
  /** Titre pour Google, si différent du H1 (≤ 48 caractères, « · Clotere … » est ajouté). */
  seoTitle?: string;
  description: string;
  date: string; // AAAA-MM-JJ
  updated?: string;
  category: string;
  author: string;
  /** Landing liée (encart « Notre solution »). */
  relatedLanding: { href: string; label: string };
  faq: FaqItem[];
  body: string;
};

export type Heading = { id: string; text: string };

const POSTS: Record<ProfessionId, BlogPost[]> = {
  avocat: [etreVisibleAvocat, rendezVousQualifiesAvocat, ficheGoogleAvocat, siteInternetAvocatGuide, visibiliteReferencementAvocat],
  comptable: BLOG_COMPTABLE,
};

/** Texte brut d'une ligne (sans gras ni liens). */
export function plain(md: string): string {
  return md.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").trim();
}

/** Identifiant d'ancre stable à partir d'un titre. */
export function slugify(text: string): string {
  return plain(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function headings(post: BlogPost): Heading[] {
  return post.body
    .split("\n")
    .filter((l) => /^## /.test(l))
    .map((l) => {
      const text = plain(l.slice(3));
      return { id: slugify(text), text };
    });
}

export function readingMinutes(post: BlogPost): number {
  return Math.max(1, Math.round(post.body.split(/\s+/).filter(Boolean).length / 220));
}

export function getAllPosts(profession: ProfessionId = "avocat"): BlogPost[] {
  return [...POSTS[profession]].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getPost(slug: string, profession: ProfessionId = "avocat"): BlogPost | null {
  return POSTS[profession].find((p) => p.slug === slug) ?? null;
}

export function getRelatedPosts(post: BlogPost, profession: ProfessionId = "avocat", limit = 3): BlogPost[] {
  return getAllPosts(profession)
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, limit);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}

export const blogPath = (slug: string) => `/blog/${slug}`;
