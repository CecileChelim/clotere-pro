import { createClient } from "@/lib/supabase/server";

/** Initiales du professionnel connecté (bouton « Mon espace » de la navigation), ou null. */
export async function espaceConnecte(): Promise<{ initiales: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pro } = await (supabase as any).from("professionals").select("prenom, nom").eq("auth_user_id", user.id).maybeSingle();
  return { initiales: (pro ? `${pro.prenom?.[0] ?? ""}${pro.nom?.[0] ?? ""}` : (user.email?.[0] ?? "")).toUpperCase() };
}
