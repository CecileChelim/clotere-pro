import type { Metadata } from "next";
import HomeTemplate from "@/components/landing/HomeTemplate";
import { homeAvocat } from "@/content/avocat/home";
import { metaPage } from "@/lib/landing-meta";
import { espaceConnecte } from "@/lib/landing-espace";

// Accueil avocat.clotere.fr (la racine du sous-domaine est réécrite vers /avocat, cf. proxy.ts).
export const metadata: Metadata = metaPage({
  title: "Clotere Avocat — Site, rendez-vous et visibilité pour avocats",
  description:
    "Site internet, prise de rendez-vous en ligne, avis Google, référencement et IA : tout pour qu’un client choisisse votre cabinet d’avocat plutôt qu’un autre.",
  path: "/",
  profession: "avocat",
  absoluteTitle: true,
});

export default async function AvocatAccueil() {
  return <HomeTemplate data={homeAvocat} espace={await espaceConnecte()} />;
}
