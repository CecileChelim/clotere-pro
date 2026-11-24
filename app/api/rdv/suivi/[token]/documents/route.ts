import { NextResponse } from "next/server";
import { baseUrl, ErreurRdv } from "@/lib/rdv/actions";
import { enregistrerDepot, preparerDepot, retirerDocument } from "@/lib/rdv/documents";
import { envoyer, liens, mails } from "@/lib/rdv/emails";
import { rdvParTokenClient } from "@/lib/rdv/load";

// Dépôt de documents par le client depuis sa page de suivi (lien sans connexion).
// preparer → URL d'envoi signée ; le navigateur envoie le PDF à Supabase ; enregistrer → rattachement au rdv.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await rdvParTokenClient(token);
  if (!r) return NextResponse.json({ ok: false, error: "Lien invalide" }, { status: 404 });
  try {
    const b = await req.json();
    if (b.action === "preparer") return NextResponse.json({ ok: true, ...(await preparerDepot(r, b.taille)) });
    if (b.action === "enregistrer") {
      const document = await enregistrerDepot(r, b.chemin, b.libelle, b.nom);
      await envoyer({ to: r.pro.email, type: "document_pro", rdv: r, ...mails.documentPro(r, liens(r, baseUrl(req)), document.libelle) })
        .catch((e) => console.error("[documents] notification pro :", e));
      return NextResponse.json({ ok: true, document });
    }
    if (b.action === "retirer") { await retirerDocument(r, b.id); return NextResponse.json({ ok: true }); }
    throw new ErreurRdv("Action inconnue");
  } catch (e) {
    if (!(e instanceof ErreurRdv)) console.error("[api/suivi/documents]", e);
    return NextResponse.json({ ok: false, error: e instanceof ErreurRdv ? e.message : "Erreur inattendue" }, { status: 400 });
  }
}
