import type { SupabaseClient } from "@supabase/supabase-js";

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // enlève les accents (diacritiques combinants après normalize)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Slug libre pour la page de rdv d'un pro (/rdv/<slug>) : prenom-nom, puis -2, -3… seulement si déjà pris.
 * Fonctionne avec le client navigateur comme avec le client admin (lecture publique sur professionals).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function slugProLibre(db: SupabaseClient<any, any, any>, prenom: string, nom: string): Promise<string> {
  const base = slugify(`${prenom} ${nom}`) || "pro";
  const { data } = await db.from("professionals").select("slug").like("slug", `${base}%`);
  const pris = new Set((data ?? []).map((r: { slug: string }) => r.slug));
  if (!pris.has(base)) return base;
  let i = 2;
  while (pris.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
