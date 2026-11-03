import type { Metadata } from "next";
import { Newsreader, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import { professionFromHost } from "@/lib/professions-config";
import Script from "next/script";
import { gaIdFromHost } from "@/lib/analytics";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const META = {
  comptable: {
    nom: "Clotere Expert-comptable",
    url: "https://comptable.clotere.fr",
    titre: "Clotere Expert-comptable — Visibilité et prise de rendez-vous pour experts-comptables",
    description:
      "Faites trouver votre cabinet sur Google, attirez les bons profils et transformez chaque visite en rendez-vous qualifié. Spécialiste des experts-comptables, déontologie respectée.",
    icone: "comptable",
  },
  avocat: {
    nom: "Clotere Avocat",
    url: "https://avocat.clotere.fr",
    titre: "Clotere Avocat — Visibilité et prise de rendez-vous en ligne pour avocats",
    description:
      "Prise de rendez-vous en ligne, réponses prêtes à envoyer et référencement Google pour faire de votre cabinet d'avocats le premier qu'on trouve dans votre ville.",
    icone: "avocat",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const profession = professionFromHost((await headers()).get("host"));
  const m = profession === "comptable" ? META.comptable : META.avocat;
  return {
    metadataBase: new URL(m.url),
    title: { default: m.titre, template: `%s · ${m.nom}` },
    description: m.description,
    applicationName: m.nom,
    openGraph: { type: "website", locale: "fr_FR", siteName: m.nom, title: m.titre, description: m.description, url: m.url, images: [{ url: `/icons/icon-${m.icone}-512.png`, width: 512, height: 512 }] },
    twitter: { card: "summary", title: m.titre, description: m.description },
    icons: {
      icon: [{ url: `/icons/icon-${m.icone}.svg`, type: "image/svg+xml" }, { url: `/icons/icon-${m.icone}-32.png`, sizes: "32x32", type: "image/png" }],
      apple: `/icons/apple-${m.icone}.png`,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = (await headers()).get("host");
  const gaId = gaIdFromHost(host);
  return (
    <html lang="fr" data-theme={professionFromHost(host)} className={`${newsreader.variable} ${instrumentSans.variable}`}>
      <body className="antialiased">
        {children}
        {gaId && (
          <>
            {/* Google tag (gtag.js) */}
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-tag" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
