import { NextResponse } from "next/server";
import { annulerParClient, baseUrl, choisirCreneau, ErreurRdv } from "@/lib/rdv/actions";
import { rdvParTokenClient } from "@/lib/rdv/load";

// Actions du client depuis sa page de suivi (lien sans connexion).
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await rdvParTokenClient(token);
  if (!r) return NextResponse.json({ ok: false, error: "Lien invalide" }, { status: 404 });
  try {
    const b = await req.json();
    if (b.action === "choisir") await choisirCreneau(r, Number(b.index), baseUrl(req));
    else if (b.action === "annuler") await annulerParClient(r, baseUrl(req), String(b.raison ?? ""));
    else throw new ErreurRdv("Action inconnue");
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (!(e instanceof ErreurRdv)) console.error("[api/suivi]", e);
    return NextResponse.json({ ok: false, error: e instanceof ErreurRdv ? e.message : "Erreur inattendue" }, { status: 400 });
  }
}
