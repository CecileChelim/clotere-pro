import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { notifierSlack } from "@/lib/slack";

// « Être rappelé » depuis la page Google Ads de l'espace pro : on horodate la demande et on prévient l'équipe sur Slack.
export async function POST(req: Request) {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  const { budget, telephone } = (await req.json().catch(() => ({}))) as { budget?: string; telephone?: string };
  const { cab, pro } = ctx;
  await createAdminClient().from("cabinets").update({ ads_demande_at: new Date().toISOString() }).eq("id", cab.id);
  await notifierSlack(pro.profession, `📣 Google Ads : demande de rappel — ${cab.nom}`, [
    ["Contact", `${pro.prenom ?? ""} ${pro.nom ?? ""} · ${pro.email}`],
    ["Téléphone", (typeof telephone === "string" && telephone.trim().slice(0, 30)) || cab.telephone],
    ["Ville", cab.ville],
    ["Budget mensuel envisagé", typeof budget === "string" ? budget.slice(0, 40) : null],
  ]);
  return NextResponse.json({ ok: true });
}
