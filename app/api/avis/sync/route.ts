import { NextResponse } from "next/server";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { synchroniserAvis } from "@/lib/avis-serveur";
import { avisActif } from "@/lib/options";

// « Actualiser » : récupère les derniers avis de la fiche Google.
export async function POST() {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  if (!avisActif(ctx.cab)) return NextResponse.json({ ok: false, error: "Option non active" }, { status: 403 });
  const r = await synchroniserAvis(ctx.cab.id);
  return NextResponse.json(r, { status: r.ok ? 200 : 422 });
}
