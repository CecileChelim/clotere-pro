import type { Metadata } from "next";
import { Newsreader, Instrument_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Moneago — La prise de rendez-vous en ligne pour les CGP & CGPI",
  description:
    "Publiez votre fiche professionnelle et activez la prise de rendez-vous en ligne en 5 minutes. Sans engagement, conforme ORIAS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${newsreader.variable} ${instrumentSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
