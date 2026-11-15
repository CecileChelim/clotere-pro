import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { professionFromHost } from "@/lib/professions-config";
import { blogPath, getAllPosts } from "@/lib/blog";
import { CONFIGS, LANDINGS_MAJ } from "@/lib/landing-config";
import { createClient } from "@supabase/supabase-js";

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
  // Sites créés avec Clotere : seulement ceux dont l'abonnement est payé (pendant l'essai, ils sont en noindex).
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: sites } = await db.from("sites").select("slug, updated_at, cabinets!inner(subscription_status, offre_site)")
    .eq("profession", profession).eq("cabinets.subscription_status", "actif").eq("cabinets.offre_site", true);
  const sitesClients: MetadataRoute.Sitemap = (sites ?? []).map((x: { slug: string; updated_at: string }) => ({
    url: `${siteUrl}/${x.slug}`, lastModified: x.updated_at, changeFrequency: "monthly", priority: 0.5,
  }));
  return [...landings, ...articles, ...sitesClients];
}
