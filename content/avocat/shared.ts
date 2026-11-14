import type { Metadata } from "next";
import { SITE_URL } from "@/lib/landing-avocat";

/** Questions de FAQ communes à plusieurs pages (maquettes Figma). */
export const FAQ_DEONTOLOGIE = {
  q: "Est-ce conforme aux règles de la profession ?",
  a: "Oui. Abonnement fixe, aucune rémunération liée à vos dossiers, contenus relus et validés par vous : nos outils respectent les règles de communication de la profession d’avocat.",
};

export const FAQ_ENGAGEMENT = { q: "Suis-je engagé ?", a: "Non. Nos offres sont sans engagement : vous arrêtez quand vous voulez." };

/** Métadonnées d'une landing (title complété par « · Clotere Avocat » via app/layout.tsx). */
export const SHARE_IMAGE = { url: "/img/share-avocat.png", width: 1200, height: 630, alt: "Clotere — la solution croissance des avocats" };

export function metaPage({
  title,
  description,
  path,
  absoluteTitle = false,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  type?: "website" | "article";
}): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type, locale: "fr_FR", siteName: "Clotere Avocat", images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE.url] },
    robots: { index: true, follow: true },
  };
}
