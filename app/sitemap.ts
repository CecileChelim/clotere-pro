import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { professionFromHost } from "@/lib/professions-config";
import { blogPath, getAllPosts } from "@/lib/blog";
import { CONFIGS, LANDINGS_MAJ } from "@/lib/landing-config";

// sitemap.xml propre à chaque sous-domaine (avocat.clotere.fr / comptable.clotere.fr).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profession = professionFromHost((await headers()).get("host"));
  const { siteUrl, pages } = CONFIGS[profession];

  const landings: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: LANDINGS_MAJ, changeFrequency: "weekly", priority: 1 },
    ...Object.values(pages).map((p) => ({ url: `${siteUrl}${p}`, lastModified: LANDINGS_MAJ, changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${siteUrl}/blog`, lastModified: LANDINGS_MAJ, changeFrequency: "weekly", priority: 0.7 },
  ];
  const articles: MetadataRoute.Sitemap = getAllPosts(profession).map((p) => ({
    url: `${siteUrl}${blogPath(p.slug)}`,
    lastModified: p.updated ?? p.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...landings, ...articles];
}
