import type { SiteRendu } from "@/lib/site/types";
import { variablesPalette } from "@/lib/site/palettes";
import { policesSite } from "@/components/mon-site/fonts";
import { TemplateLight } from "@/components/mon-site/templates/Light";
import { TemplateModerne } from "@/components/mon-site/templates/Moderne";
import { TemplatePerformance } from "@/components/mon-site/templates/Performance";

/** Affiche un site avec son template et sa palette. Utilisé pour la page publique et l'aperçu en direct. */
export function SiteRenderer({ d }: { d: SiteRendu }) {
  const T = d.template === "moderne" ? TemplateModerne : d.template === "performance" ? TemplatePerformance : TemplateLight;
  return (
    <div className={`@container scroll-smooth ${policesSite}`} style={variablesPalette(d.palette)}>
      <T d={d} />
    </div>
  );
}
