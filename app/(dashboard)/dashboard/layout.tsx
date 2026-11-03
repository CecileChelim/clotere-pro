import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { PROFESSIONS } from "@/lib/professions-config";
import { MarketingPromoCard } from "@/components/dashboard/MarketingPromoCard";
import { GardeAbonnement } from "@/components/dashboard/AbonnementActions";
import { etatAbonnement } from "@/lib/abonnement";
import { InscriptionTerminee } from "@/components/analytics/InscriptionTerminee";

// La présence d'une session valide est déjà garantie par middleware.ts
// (redirection vers /login sinon). On récupère ici le profil pro associé
// pour l'affichage du nom dans la sidebar, et on renvoie vers /inscription
// tout compte authentifié qui n'a pas encore de fiche.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: professional } = user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (supabase as any)
        .from("professionals")
        .select("prenom, nom, email, profession, slug, cabinet_id")
        .eq("auth_user_id", user.id)
        .maybeSingle()
    : { data: null };

  if (user && !professional) redirect("/inscription");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cab } = professional?.cabinet_id ? await (supabase as any).from("cabinets").select("*").eq("id", professional.cabinet_id).maybeSingle() : { data: null };
  const abo = etatAbonnement(cab);

  const brand = PROFESSIONS[professional?.profession === "comptable" ? "comptable" : "avocat"].brand;

  return (
    <div className="relative min-h-screen bg-white">
      <InscriptionTerminee />
      <div className="bg-brand-gradient absolute inset-x-2 top-2 h-72 rounded-[2rem] ring-1 ring-black/5 ring-inset" />
      <div className="relative mx-auto max-w-7xl px-6">
        <header className="flex items-center justify-between gap-4 py-8">
          <Link href="/dashboard" className="shrink-0 text-lg font-bold tracking-tight text-gray-950">{brand}</Link>
          <div className="flex shrink-0 items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-950">
                {professional ? `${professional.prenom} ${professional.nom}` : "Mon espace"}
              </p>
              <p className="truncate text-xs text-gray-950/60">{professional?.email ?? user?.email}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">
              {professional ? `${professional.prenom?.[0] ?? ""}${professional.nom?.[0] ?? ""}`.toUpperCase() : "·"}
            </div>
          </div>
        </header>

        <div className="mb-10 flex flex-col gap-8 rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-black/5 sm:p-10 lg:flex-row">
          <aside className="shrink-0 lg:w-56">
            <DashboardNav visibilite={!!cab?.offre_visibilite} />
            <div className="mt-6 hidden lg:block"><MarketingPromoCard compact profession={professional?.profession} /></div>
            <div className="mt-6 border-t border-gray-100 pt-4">
              <SignOutButton />
            </div>
          </aside>
          <main className="min-w-0 flex-1">
            {abo.essai && cab?.subscription_status !== "actif" && (
              <div className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm ring-1 ${abo.joursRestants <= 2 ? "bg-amber-50 ring-amber-200" : "bg-gray-50 ring-black/5"}`}>
                <span className="text-gray-700">Essai gratuit : <strong className="text-gray-950">{abo.joursRestants} jour{abo.joursRestants > 1 ? "s" : ""} restant{abo.joursRestants > 1 ? "s" : ""}</strong>{abo.joursRestants <= 2 && " · ensuite, votre page de rendez-vous sera mise en pause"}</span>
                <Link href="/dashboard/abonnement" className="font-medium text-gray-950 underline underline-offset-2">Ajouter ma carte</Link>
              </div>
            )}
            {cab?.subscription_status === "impayé" && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
                <span>Le dernier paiement a échoué : mettez à jour votre carte pour continuer à recevoir des rendez-vous.</span>
                <Link href="/dashboard/abonnement" className="font-semibold underline underline-offset-2">Mettre à jour</Link>
              </div>
            )}
            <GardeAbonnement bloque={!abo.actif} paywall={
              <div className="card p-10 text-center">
                <p className="eyebrow">Essai terminé</p>
                <h2 className="mx-auto mt-3 max-w-lg text-3xl font-medium tracking-tight text-gray-950">Votre essai gratuit est terminé</h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] text-gray-600">Votre page de prise de rendez-vous est en pause. Activez votre abonnement pour recevoir à nouveau des demandes.</p>
                <Link href="/dashboard/abonnement" className="btn-solid mt-6">Activer mon abonnement</Link>
              </div>
            }>{children}</GardeAbonnement>
          </main>
        </div>
      </div>
    </div>
  );
}
