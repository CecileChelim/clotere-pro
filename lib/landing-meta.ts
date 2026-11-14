import type { Metadata } from "next";
import { CONFIGS, type ProfessionId } from "./landing-config";

/** Image de partage (Open Graph / Twitter) d'une profession. */
export function shareImage(profession: ProfessionId) {
  const c = CONFIGS[profession];
  return { url: c.share.url, width: 1200, height: 630, alt: c.share.alt };
}

/** Métadonnées d'une landing ou d'un article (title complété par « · Clotere … » via app/layout.tsx). */
export function metaPage({
  title,
  description,
  path,
  profession = "avocat",
  absoluteTitle = false,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  profession?: ProfessionId;
  absoluteTitle?: boolean;
  type?: "website" | "article";
}): Metadata {
  const c = CONFIGS[profession];
  const url = `${c.siteUrl}${path === "/" ? "" : path}`;
  const img = shareImage(profession);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type, locale: "fr_FR", siteName: c.nom, images: [img] },
    twitter: { card: "summary_large_image", title, description, images: [img.url] },
    robots: { index: true, follow: true },
  };
}
