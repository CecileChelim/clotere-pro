import { NextResponse } from "next/server";
import { lienTelechargement } from "@/lib/rdv/documents";
import { rdvParTokenPro } from "@/lib/rdv/load";

// Téléchargement d'un document du client par le pro (lien « Gérer la demande », sans connexion).
export async function GET(_req: Request, { params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;
  const r = await rdvParTokenPro(token);
  if (!r || !/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Lien invalide", { status: 404 });
  const url = await lienTelechargement(r, id);
  if (!url) return new NextResponse("Document introuvable ou supprimé", { status: 404 });
  return NextResponse.redirect(url, { headers: { "Cache-Control": "no-store" } });
}
