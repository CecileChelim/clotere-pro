import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { professionFromHost } from "@/lib/professions-config";
import { blogPath, getAllPosts } from "@/lib/blog-avocat";
import { PAGES, SITE_URL } from "@/lib/landing-avocat";

// sitemap.xml propre à chaque sous-domaine (avocat.clotere.fr / comptable.clotere.fr).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profession = professionFromHost((await headers()).get("host"));
  if (profession !== "avocat") return [];

  const landings: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...Object.values(PAGES).map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];
  const articles: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${SITE_URL}${blogPath(p.slug)}`,
    lastModified: p.updated ?? p.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...landings, ...articles];
}
