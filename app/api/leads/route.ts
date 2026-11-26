import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { majOuvertureLeads } from "@/lib/leads-serveur";
import { notifierSlack } from "@/lib/slack";
import { PLAFONDS_PROPOSES } from "@/lib/leads";

// Réglages des demandes Clotere : { plafond: number | null } ou { actifs: false } (pause).
// La réactivation après une pause ne redemande pas la carte si elle est déjà enregistrée ({ actifs: true }).
export async function PATCH(req: Request) {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  if (ctx.pro.role === "membre") return NextResponse.json({ ok: false, error: "Réservé au titulaire du cabinet." }, { status: 403 });
  const b = (await req.json().catch(() => ({}))) as { plafond?: unknown; actifs?: unknown };
  const patch: Record<string, unknown> = {};
  if ("plafond" in b) {
    if (b.plafond !== null && !(typeof b.plafond === "number" && (PLAFONDS_PROPOSES as readonly number[]).includes(b.plafond))) {
      return NextResponse.json({ ok: false, error: "Plafond invalide" }, { status: 400 });
    }
    patch.leads_plafond = b.plafond;
  }
  if (b.actifs === false) patch.leads_actifs = false;
  if (b.actifs === true) {
    if (!ctx.cab.leads_actives_at) return NextResponse.json({ ok: false, error: "Enregistrez d'abord votre carte." }, { status: 400 });
    patch.leads_actifs = true;
  }
  if (!Object.keys(patch).length) return NextResponse.json({ ok: false, error: "Rien à enregistrer" }, { status: 400 });
  await createAdminClient().from("cabinets").update(patch).eq("id", ctx.cab.id);
  const ouverts = await majOuvertureLeads(ctx.cab.id);
  if ("leads_actifs" in patch) {
    await notifierSlack(ctx.pro.profession, `${patch.leads_actifs ? "▶️ Leads réactivés" : "⏸️ Leads mis en pause"} : ${ctx.cab.nom}`, [["Contact", ctx.pro.email]]);
  }
  return NextResponse.json({ ok: true, ouverts });
}
