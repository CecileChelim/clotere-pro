import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { RelectureArticle } from "@/components/visibilite/RelectureArticle";
import type { Article } from "@/lib/visibilite";

export const metadata = { title: "Relire l'article" };

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await cabinetConnecte();
  if (!ctx) redirect(`/login?next=/dashboard/visibilite/articles/${id}`);
  if (!ctx.cab.offre_visibilite) redirect("/dashboard/visibilite");
  const { data } = await createAdminClient().from("articles").select("*").eq("id", id).maybeSingle();
  if (!data || data.cabinet_id !== ctx.cab.id) notFound();
  return <RelectureArticle article={data as Article} />;
}
