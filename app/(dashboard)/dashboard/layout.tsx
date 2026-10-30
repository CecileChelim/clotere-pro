import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

// La présence d'une session valide est déjà garantie par middleware.ts
// (redirection vers /login sinon). On récupère ici le profil CGP associé
// pour l'affichage du nom dans la sidebar, et on renvoie vers /onboarding
// tout compte authentifié qui n'a pas encore de fiche.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: professional } = user
    ? await supabase
        .from("professionals")
        .select("prenom, nom, email")
        .eq("auth_user_id", user.id)
        .maybeSingle()
    : { data: null };

  if (user && !professional) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-10">
        <aside className="hidden w-56 shrink-0 sm:block">
          <Link href="/" className="font-serif text-xl text-ink-2">
            Moneago
          </Link>

          <div className="mt-6 border-t border-line pt-4">
            <p className="text-sm font-medium text-ink-2">
              {professional ? `${professional.prenom} ${professional.nom}` : "Espace CGP"}
            </p>
            <p className="truncate text-xs text-muted">{professional?.email ?? user?.email}</p>
          </div>

          <div className="mt-6">
            <DashboardNav />
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <SignOutButton />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
