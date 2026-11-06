import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { synchroniserAvis } from "@/lib/avis-serveur";

// Enregistre le lien de la fiche Google du cabinet, puis récupère ses avis.
export async function POST(req: Request) {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  const brut = (url ?? "").trim();
  if (!/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(brut) || brut.length > 2000) return NextResponse.json({ ok: false, error: "Collez le lien de votre fiche Google." }, { status: 400 });
  const lien = /^https?:\/\//i.test(brut) ? brut : `https://${brut}`;
  await createAdminClient().from("cabinets").update({ google_business_url: lien, google_reviews_url: lien }).eq("id", ctx.cab.id);
  const r = await synchroniserAvis(ctx.cab.id);
  if (!r.ok) return NextResponse.json({ ok: false, error: "Lien enregistré, mais nous n'avons pas retrouvé la fiche. Vérifiez qu'il s'agit bien du lien de partage de votre fiche." }, { status: 422 });
  return NextResponse.json(r);
}
