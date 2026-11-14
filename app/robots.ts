import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { professionFromHost } from "@/lib/professions-config";

const SITES = { avocat: "https://avocat.clotere.fr", comptable: "https://comptable.clotere.fr" } as const;

// robots.txt propre à chaque sous-domaine : pages publiques indexables, espace pro et pages à jeton exclus.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = SITES[professionFromHost((await headers()).get("host"))];
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/login", "/signup", "/inscription", "/onboarding", "/auth/", "/reset-password", "/gestion/", "/suivi/"],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
