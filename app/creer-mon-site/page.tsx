import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { professionFromHost, type Profession } from "@/lib/professions-config";
import { Createur } from "@/components/mon-site/Createur";

export const metadata: Metadata = {
  title: "Créez le site de votre cabinet en 10 minutes",
  description: "Choisissez un style, vos pages et vos couleurs : votre site est prêt, avec prise de rendez-vous en ligne. 7 jours d'essai gratuit.",
};

export default async function CreerMonSitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profession: Profession = professionFromHost((await headers()).get("host"));
  let prefill = null;

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data: pro } = await db.from("professionals").select("prenom, nom, profession, domaines, cabinet_id").eq("auth_user_id", user.id).maybeSingle();
    if (pro?.cabinet_id) {
      const { data: site } = await db.from("sites").select("id").eq("cabinet_id", pro.cabinet_id).maybeSingle();
      if (site) redirect("/dashboard/site");
      const { data: cab } = await db.from("cabinets").select("nom, adresse, code_postal, ville, telephone").eq("id", pro.cabinet_id).maybeSingle();
      profession = pro.profession === "comptable" ? "comptable" : "avocat";
      prefill = {
        prenom: pro.prenom ?? "", nom: pro.nom ?? "", domaines: pro.domaines ?? [],
        cabinet: { nom: cab?.nom ?? "", adresse: cab?.adresse ?? "", code_postal: cab?.code_postal ?? "", ville: cab?.ville ?? "", complement: "", telephone: cab?.telephone ?? "", email: user.email ?? "" },
      };
    }
  }

  return <Createur profession={profession} connecte={!!user} prefill={prefill} />;
}
