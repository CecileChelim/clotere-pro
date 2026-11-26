import { NextResponse } from "next/server";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { contesterLead } from "@/lib/leads-serveur";
import { estRaison } from "@/lib/leads";

// Contestation d'un lead par le pro (jusqu'à 48 h après le créneau) : il n'est pas facturé.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const { raison, detail } = (await req.json().catch(() => ({}))) as { raison?: unknown; detail?: unknown };
  if (!estRaison(raison)) return NextResponse.json({ ok: false, error: "Choisissez une raison." }, { status: 400 });
  const ok = await contesterLead(ctx.cab.id, id, raison, typeof detail === "string" ? detail.trim() : "");
  if (!ok) return NextResponse.json({ ok: false, error: "Ce rendez-vous n'est plus contestable." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
