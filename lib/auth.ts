import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Session courante, mémoïsée pour la durée de la requête (React `cache`) :
 * le header public et la page d'accueil peuvent tous deux l'appeler sans
 * dupliquer l'appel réseau à Supabase.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
