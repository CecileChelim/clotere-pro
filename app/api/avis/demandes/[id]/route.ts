import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";

// Arrêter les relances d'une demande d'avis.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  if (action !== "arreter") return NextResponse.json({ ok: false, error: "Action inconnue" }, { status: 400 });
  const { data, error } = await createAdminClient().from("demandes_avis")
    .update({ statut: "arretee", prochaine_relance_le: null, updated_at: new Date().toISOString() })
    .eq("id", id).eq("cabinet_id", ctx.cab.id).eq("statut", "en_cours").select("*").maybeSingle();
  if (error || !data) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, demande: data });
}
