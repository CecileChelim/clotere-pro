import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";

// Ouvre un rapport trimestriel (lien signé valable 5 minutes), seulement pour son cabinet.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.redirect(new URL("/login?next=/dashboard/visibilite", req.url));
  const db = createAdminClient();
  const { data: r } = await db.from("rapports").select("cabinet_id, fichier").eq("id", id).maybeSingle();
  if (!r || r.cabinet_id !== ctx.cab.id) return NextResponse.json({ ok: false }, { status: 404 });
  const { data, error } = await db.storage.from("rapports").createSignedUrl(r.fichier, 300);
  if (error || !data) return NextResponse.json({ ok: false, error: "Fichier introuvable" }, { status: 404 });
  return NextResponse.redirect(data.signedUrl);
}
