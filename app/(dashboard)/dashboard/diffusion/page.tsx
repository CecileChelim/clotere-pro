import { redirect } from "next/navigation";

// « Diffusez votre lien » est désormais dans les onglets de la page Agenda.
export default function DiffusionPage() {
  redirect("/dashboard/agenda?onglet=site");
}
