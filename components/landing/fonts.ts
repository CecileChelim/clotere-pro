import localFont from "next/font/local";

// Typographie des landings (maquettes Figma) : Manrope pour les titres,
// Geist Mono pour les sur-titres. Le texte courant reste en Instrument Sans
// (police du body, chargée dans app/layout.tsx). Fichiers auto-hébergés,
// repris de la vitrine notaire.
const manrope = localFont({
  src: "../../app/fonts/Manrope-latin-var.woff2",
  weight: "500 700",
  variable: "--font-manrope-src",
  display: "swap",
});

const geistMono = localFont({
  src: "../../app/fonts/GeistMono-600-latin.woff2",
  weight: "600",
  variable: "--font-geist-mono-src",
  display: "swap",
});

export const landingFonts = `${manrope.variable} ${geistMono.variable}`;
