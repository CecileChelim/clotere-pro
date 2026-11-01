import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfilForm } from "@/components/pro/ProfilForm";
import { chargerTaxonomie } from "@/lib/taxonomie";

export default async function FichePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/fiche");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: pro } = await db
    .from("professionals")
    .select("id, auth_user_id, prenom, nom, telephone, email, photo_url, bio, role, cabinet_id, profession, domaines, honoraires_modes, paiement_moyens, services, linkedin_url")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!pro) redirect("/inscription");

  const { data: cabinet } = pro.cabinet_id
    ? await db.from("cabinets").select("id, nom, adresse, code_postal, ville, telephone, site_web, google_rating, google_reviews_count, google_reviews_url, google_business_url").eq("id", pro.cabinet_id).maybeSingle()
    : { data: null };
  const taxo = await chargerTaxonomie(db, pro.profession === "comptable" ? "comptable" : "avocat");
  const { data: ps } = await db.from("pro_specialites").select("specialite_id").eq("professional_id", pro.id);
  const specs = (ps ?? []).map((x: { specialite_id: string }) => x.specialite_id);

  return (
    <div>
      <p className="eyebrow">Ma fiche</p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight text-gray-950">Mon profil</h1>
      <p className="mt-2 text-sm text-gray-600">Ces informations s&apos;affichent sur votre page de prise de rendez-vous.</p>
      <ProfilForm pro={pro} cabinet={cabinet} taxo={taxo} specsInit={specs} />
    </div>
  );
}
