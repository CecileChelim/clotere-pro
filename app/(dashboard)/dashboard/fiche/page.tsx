import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfessionalForm } from "@/components/onboarding/ProfessionalForm";

export default async function DashboardFichePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/fiche");

  const { data: professional } = await supabase
    .from("professionals")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Filet de sécurité : le layout dashboard redirige déjà vers /onboarding
  // si aucune fiche n'existe encore pour ce compte.
  if (!professional) redirect("/onboarding");

  const [{ data: motifs }, { data: services }] = await Promise.all([
    supabase
      .from("motifs")
      .select("*")
      .eq("professional_id", professional.id)
      .order("ordre", { ascending: true }),
    supabase
      .from("services")
      .select("*")
      .eq("professional_id", professional.id)
      .order("ordre", { ascending: true }),
  ]);

  return (
    <div>
      <p className="eyebrow">Ma fiche</p>
      <h1 className="mt-2 font-serif text-3xl text-ink-2">Éditer ma fiche professionnelle</h1>
      <p className="mt-3 max-w-lg text-sm text-body">
        Ces informations sont visibles publiquement sur votre fiche, indexable par Google.
      </p>

      <div className="mt-8">
        <ProfessionalForm
          mode="edit"
          userId={user.id}
          userEmail={user.email ?? professional.email}
          initial={{ professional, motifs: motifs ?? [], services: services ?? [] }}
        />
      </div>
    </div>
  );
}
