import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { esc, prevenirClotere } from "@/lib/mail-compte";
import { notifierSlack } from "@/lib/slack";

// « Activer ce service » : on enregistre la demande et on prévient l'équipe Clotere.
export async function POST() {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  await createAdminClient().from("cabinets").update({ visibilite_demande_at: new Date().toISOString() }).eq("id", ctx.cab.id);
  await prevenirClotere(`Demande d'activation Visibilité : ${ctx.cab.nom}`,
    `<p><strong>${esc(ctx.pro.prenom)} ${esc(ctx.pro.nom)}</strong> (${esc(ctx.pro.profession)}) souhaite activer l'offre Visibilité.</p>
     <p>Cabinet : ${esc(ctx.cab.nom)} — ${esc(ctx.cab.ville)}<br>E-mail : ${esc(ctx.pro.email)}<br>Téléphone : ${esc(ctx.cab.telephone)}<br>Site : ${esc(ctx.cab.site_web)}</p>`);
  await notifierSlack(ctx.pro.profession, `🚀 Demande d'activation Visibilité : ${ctx.cab.nom}`, [
    ["Contact", `${ctx.pro.prenom ?? ""} ${ctx.pro.nom ?? ""}`], ["E-mail", ctx.pro.email], ["Téléphone", ctx.cab.telephone], ["Ville", ctx.cab.ville], ["Site", ctx.cab.site_web],
  ]);
  return NextResponse.json({ ok: true });
}
