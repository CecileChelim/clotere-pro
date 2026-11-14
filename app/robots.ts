import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { professionFromHost } from "@/lib/professions-config";
import { CONFIGS } from "@/lib/landing-config";

// robots.txt propre à chaque sous-domaine : pages publiques indexables, espace pro et pages à jeton exclus.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = CONFIGS[professionFromHost((await headers()).get("host"))].siteUrl;
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
