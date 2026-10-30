import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfessionalForm } from "@/components/onboarding/ProfessionalForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Filet de sécurité : le middleware protège déjà /onboarding, mais on
  // reste défensif si la page est atteinte sans session.
  if (!user) redirect("/login?next=/onboarding");

  const { data: existing } = await supabase
    .from("professionals")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Une fiche existe déjà pour ce compte : pas d'onboarding à refaire.
  if (existing) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="font-serif text-xl text-ink-2">
          Moneago
        </Link>

        <p className="eyebrow mt-8">Bienvenue</p>
        <h1 className="mt-2 font-serif text-3xl text-ink-2">Créons votre fiche professionnelle</h1>
        <p className="mt-3 text-sm text-body">
          Ces informations composent votre fiche publique, indexable par Google. Vous pourrez les
          modifier à tout moment depuis votre espace CGP.
        </p>

        <div className="mt-8">
          <ProfessionalForm mode="onboarding" userId={user.id} userEmail={user.email ?? ""} />
        </div>
      </div>
    </div>
  );
}
