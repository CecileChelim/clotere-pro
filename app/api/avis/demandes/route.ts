import { NextResponse } from "next/server";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { creerDemandeAvis } from "@/lib/avis-serveur";
import { avisActif } from "@/lib/options";

// Demande d'avis envoyée à la main à un client (hors rendez-vous Clotere).
export async function POST(req: Request) {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  if (!avisActif(ctx.cab)) return NextResponse.json({ ok: false, error: "Option non active" }, { status: 403 });
  const { nom, email } = (await req.json().catch(() => ({}))) as { nom?: string; email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return NextResponse.json({ ok: false, error: "E-mail invalide" }, { status: 400 });
  try {
    const demande = await creerDemandeAvis({ cabinetId: ctx.cab.id, clientNom: nom?.slice(0, 120) ?? null, clientEmail: email });
    return NextResponse.json({ ok: true, demande });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Erreur" }, { status: 400 });
  }
}
