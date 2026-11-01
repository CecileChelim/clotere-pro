import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DiffusionWidget from "@/components/widget/DiffusionWidget";

export default async function DiffusionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/diffusion");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: pro } = await db
    .from("professionals")
    .select("id, slug, prenom, nom, email, telephone, profession, cabinets(nom, telephone)")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!pro) redirect("/inscription");

  const h = await headers();
  const host = h.get("host") ?? "avocat.clotere.fr";
  const base = `${host.includes("localhost") ? "http" : "https"}://${host}`;
  const cab = Array.isArray(pro.cabinets) ? pro.cabinets[0] : pro.cabinets;
  const titre = pro.profession === "avocat" ? "Maître " : "";

  return (
    <DiffusionWidget
      proId={pro.id}
      slug={pro.slug}
      base={base}
      nom={`${titre}${pro.prenom} ${pro.nom}`}
      office={cab?.nom || `Cabinet ${pro.nom}`}
      cabinetNom={cab?.nom ?? null}
      telephone={cab?.telephone || pro.telephone}
      email={pro.email}
      metier={pro.profession === "comptable" ? "Expert-comptable" : "Avocat"}
    />
  );
}
