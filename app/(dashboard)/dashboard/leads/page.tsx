import { redirect } from "next/navigation";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { ApportAffaires } from "@/components/dashboard/ApportAffaires";

export const metadata = { title: "Apport d'affaires" };

/* Apport d'affaires des cabinets abonnés. En formule page, il est dans « Abonnement ». */
export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ activation?: string; bienvenue?: string }> }) {
  const { activation, bienvenue } = await searchParams;
  const ctx = await cabinetConnecte();
  if (ctx?.cab.page_seule) redirect(`/dashboard/abonnement${activation ? `?activation=${activation}` : ""}`);
  return <ApportAffaires activation={activation} bienvenue={bienvenue} retour="/dashboard/leads" />;
}
