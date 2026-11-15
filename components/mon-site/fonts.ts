import { Inter } from "next/font/google";
import { landingFonts } from "@/components/landing/fonts";

// Polices des sites créés : Inter (templates Light et Performance), Manrope (template Moderne, auto-hébergée).
const inter = Inter({ subsets: ["latin"], variable: "--font-site-inter", display: "swap" });

export const policesSite = `${inter.variable} ${landingFonts}`;
export const FONT_INTER = "var(--font-site-inter), system-ui, sans-serif";
export const FONT_MANROPE = "var(--font-manrope-src), system-ui, sans-serif";
