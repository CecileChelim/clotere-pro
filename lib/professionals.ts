import { createClient } from "@/lib/supabase/server";
import type { Motif, Professional, Service } from "@/types/database";

export async function getProfessionalBySlug(
  ville: string,
  slug: string
): Promise<{
  professional: Professional;
  motifs: Motif[];
  services: Service[];
} | null> {
  const supabase = await createClient();

  const { data: professional } = await supabase
    .from("professionals")
    .select("*")
    .eq("slug", slug)
    .ilike("ville", ville)
    .maybeSingle();

  if (!professional) return null;

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

  return { professional, motifs: motifs ?? [], services: services ?? [] };
}
