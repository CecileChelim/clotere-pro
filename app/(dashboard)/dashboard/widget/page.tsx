import { redirect } from "next/navigation";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { EnTetePage } from "@/components/dashboard/EnTetePage";
import { WidgetPresentation } from "@/components/mon-site/Upsells";

export const metadata = { title: "Widget de prise de rendez-vous" };

/* Formule page : offre widget (69 € HT / mois). Une fois abonné, l'installation se fait dans Agenda. */
export default async function WidgetPage() {
  const ctx = await cabinetConnecte();
  if (!ctx) redirect("/login?next=/dashboard/widget");
  if (!ctx.cab.page_seule || ctx.cab.offre_widget) redirect("/dashboard/agenda?onglet=site");
  return (
    <div>
      <EnTetePage section="Widget rdv" titre="Widget de prise de rendez-vous" />
      <div className="mt-8"><WidgetPresentation /></div>
    </div>
  );
}
