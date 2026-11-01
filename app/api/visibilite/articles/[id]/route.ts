import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { esc, prevenirClotere } from "@/lib/mail-compte";
import { notifierSlack } from "@/lib/slack";

// Actions du cabinet sur un article : enregistrer ses corrections, valider, demander des modifications.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false, error: "Non connecté" }, { status: 401 });
  const db = createAdminClient();
  const { data: a } = await db.from("articles").select("id, cabinet_id, titre, statut").eq("id", id).maybeSingle();
  if (!a || a.cabinet_id !== ctx.cab.id) return NextResponse.json({ ok: false, error: "Article introuvable" }, { status: 404 });
  if (a.statut === "valide" || a.statut === "publie") return NextResponse.json({ ok: false, error: "Cet article est déjà validé." }, { status: 409 });

  const body = (await req.json().catch(() => ({}))) as { action?: string; contenu?: string; titre?: string; commentaire?: string };
  const qui = `${ctx.pro.prenom ?? ""} ${ctx.pro.nom ?? ""} (${ctx.cab.nom})`;
  const edition = typeof body.contenu === "string"
    ? { contenu: body.contenu.slice(0, 60000), titre: (body.titre ?? a.titre).slice(0, 300), modifie_par_client: true } : {};

  if (body.action === "enregistrer") {
    await db.from("articles").update(edition).eq("id", id);
  } else if (body.action === "valider") {
    await db.from("articles").update({ ...edition, statut: "valide", valide_le: new Date().toISOString() }).eq("id", id);
    await notifierSlack(ctx.pro.profession, `✅ Article validé : ${a.titre}`, [["Cabinet", ctx.cab.nom], ["Corrigé par le client", "contenu" in edition ? "oui" : "non"]]);
    await prevenirClotere(`Article validé : ${a.titre}`, `<p>${esc(qui)} a validé « ${esc(a.titre)} »${"contenu" in edition ? " (avec corrections)" : ""}.</p>`);
  } else if (body.action === "modifs") {
    const commentaire = (body.commentaire ?? "").trim().slice(0, 4000);
    if (!commentaire) return NextResponse.json({ ok: false, error: "Précisez les modifications souhaitées." }, { status: 400 });
    await db.from("articles").update({ ...edition, statut: "modifs_demandees", commentaire_client: commentaire }).eq("id", id);
    await notifierSlack(ctx.pro.profession, `✏️ Modifications demandées : ${a.titre}`, [["Cabinet", ctx.cab.nom], ["Remarques", commentaire]]);
    await prevenirClotere(`Modifications demandées : ${a.titre}`, `<p>${esc(qui)} demande des modifications sur « ${esc(a.titre)} » :</p><blockquote>${esc(commentaire).replace(/\n/g, "<br>")}</blockquote>`);
  } else {
    return NextResponse.json({ ok: false, error: "Action inconnue" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
