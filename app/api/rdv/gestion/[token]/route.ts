import { NextResponse } from "next/server";
import { annulerParPro, baseUrl, ErreurRdv, proposer, refuser, supprimerParPro, valider } from "@/lib/rdv/actions";
import { rdvParTokenPro } from "@/lib/rdv/load";

// Actions de l'avocat depuis la page « Gérer la demande » (lien sans connexion).
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await rdvParTokenPro(token);
  if (!r) return NextResponse.json({ ok: false, error: "Lien invalide" }, { status: 404 });
  try {
    const b = await req.json();
    const base = baseUrl(req);
    const message = typeof b.message === "string" ? b.message.slice(0, 3000) : null;
    if (b.action === "valider") await valider(r, message, base);
    else if (b.action === "refuser") await refuser(r, message, base);
    else if (b.action === "proposer") await proposer(r, Array.isArray(b.creneaux) ? b.creneaux : [], message, base);
    else if (b.action === "annuler") await annulerParPro(r, message, base);
    else if (b.action === "supprimer") {
      const res = await supprimerParPro(r, b.raison, typeof b.detail === "string" ? b.detail : null, !!b.avis);
      return NextResponse.json({ ok: true, ...res });
    }
    else throw new ErreurRdv("Action inconnue");
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (!(e instanceof ErreurRdv)) console.error("[api/gestion]", e);
    return NextResponse.json({ ok: false, error: e instanceof ErreurRdv ? e.message : "Erreur inattendue" }, { status: 400 });
  }
}
