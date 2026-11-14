import type { Metadata } from "next";
import HomeTemplate from "@/components/landing/HomeTemplate";
import { homeComptable } from "@/content/comptable/home";
import { metaPage } from "@/lib/landing-meta";
import { espaceConnecte } from "@/lib/landing-espace";

// Accueil comptable.clotere.fr (la racine du sous-domaine est réécrite vers /comptable, cf. proxy.ts).
export const metadata: Metadata = metaPage({
  title: "Clotere Expert-comptable — Site, rendez-vous et visibilité",
  description:
    "Site internet, prise de rendez-vous en ligne, avis Google, référencement et IA : tout pour qu’un dirigeant choisisse votre cabinet d’expertise comptable.",
  path: "/",
  profession: "comptable",
  absoluteTitle: true,
});

export default async function ComptableAccueil() {
  return <HomeTemplate data={homeComptable} espace={await espaceConnecte()} />;
}
