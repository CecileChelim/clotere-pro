import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { professionFromHost } from "@/lib/professions-config";
import { InscriptionWizard, type Etape } from "@/components/inscription/InscriptionWizard";
import { chargerTaxonomie } from "@/lib/taxonomie";

export default async function InscriptionPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/inscription");

  const { data: pro } = await supabase
    .from("professionals")
    .select("id, prenom, nom, onboarding_step, cabinet_id, profession")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Étapes suivantes (horaires, agenda, widget) pas encore construites : on s'arrête au dashboard.
  if (pro && ["horaires", "agenda", "widget", "termine"].includes(pro.onboarding_step)) redirect("/dashboard");

  const profession = pro?.profession === "comptable" || pro?.profession === "avocat"
    ? pro.profession
    : professionFromHost((await headers()).get("host"));

  const taxo = await chargerTaxonomie(supabase, profession);

  return (
    <InscriptionWizard
      taxo={taxo}
      profession={profession}
      userId={user.id}
      userEmail={user.email ?? ""}
      initialStep={(pro ? (["presence", "expertise", "motifs"].includes(pro.onboarding_step) ? pro.onboarding_step : "presence") : "vous") as Etape}
      proId={pro?.id ?? null}
      cabinetId={pro?.cabinet_id ?? null}
    />
  );
}
