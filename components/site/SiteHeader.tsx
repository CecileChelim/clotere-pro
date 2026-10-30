import { UtilityBar } from "./UtilityBar";
import { NavBar } from "./NavBar";

/**
 * Header en deux niveaux :
 * 1. Barre utilitaire (réassurance : hébergement, RGPD, sans engagement)
 * 2. Nav principale (logo, liens, CTA)
 */
export function SiteHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-50">
      <UtilityBar />
      <NavBar isAuthenticated={isAuthenticated} />
    </header>
  );
}
