import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { genererReponse } from "@/lib/avis-serveur";
import { avisActif } from "@/lib/options";

// Actions sur un avis : régénérer la réponse proposée, l'enregistrer, marquer comme répondu / ignoré.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  if (!avisActif(ctx.cab)) return NextResponse.json({ ok: false, error: "Option non active" }, { status: 403 });
  const db = createAdminClient();
  const { data: avis } = await db.from("avis_google").select("id, cabinet_id, auteur, note, texte").eq("id", id).maybeSingle();
  if (!avis || avis.cabinet_id !== ctx.cab.id) return NextResponse.json({ ok: false }, { status: 404 });
  const { action, reponse } = (await req.json().catch(() => ({}))) as { action?: string; reponse?: string };

  let patch: Record<string, unknown>;
  if (action === "regenerer") {
    const { data: pro } = await db.from("professionals").select("id, prenom, nom, email, profession, role").eq("id", ctx.pro.id).single();
    patch = { reponse_suggeree: await genererReponse(avis, pro!, ctx.cab), reponse_suggeree_le: new Date().toISOString() };
  } else if (action === "enregistrer" && typeof reponse === "string") {
    patch = { reponse_suggeree: reponse.slice(0, 4000) };
  } else if (action === "repondu") {
    patch = { statut: "repondu", ...(typeof reponse === "string" ? { reponse_google: reponse.slice(0, 4000), reponse_google_le: new Date().toISOString() } : {}) };
  } else if (action === "ignorer") {
    patch = { statut: "ignore" };
  } else if (action === "a_repondre") {
    patch = { statut: "a_repondre" };
  } else return NextResponse.json({ ok: false, error: "Action inconnue" }, { status: 400 });

  const { data } = await db.from("avis_google").update(patch).eq("id", id).select("*").single();
  return NextResponse.json({ ok: true, avis: data });
}
