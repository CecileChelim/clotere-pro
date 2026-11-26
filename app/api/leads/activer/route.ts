import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { stripe } from "@/lib/stripe";
import { notifierSlack } from "@/lib/slack";
import { PLAFONDS_PROPOSES } from "@/lib/leads";

// Activation des demandes Clotere : enregistrement de la carte (Stripe Checkout en mode « setup », aucun débit immédiat).
// Les leads sont activés par le webhook (checkout.session.completed, metadata.type = "leads").
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  if (ctx.pro.role === "membre") return NextResponse.json({ ok: false, error: "Seul le titulaire du cabinet peut activer les demandes Clotere." }, { status: 403 });
  const { cab, pro } = ctx;
  const { plafond, cgv } = (await req.json().catch(() => ({}))) as { plafond?: unknown; cgv?: unknown };
  if (cgv !== true) return NextResponse.json({ ok: false, error: "Merci d'accepter les conditions générales de vente et le tarif." }, { status: 400 });
  const p = typeof plafond === "number" && (PLAFONDS_PROPOSES as readonly number[]).includes(plafond) ? plafond : null;

  try {
    const db = createAdminClient();
    // Plafond choisi avant le paiement : appliqué dès l'activation.
    // Plafond choisi et acceptation des CGV / du tarif (preuve horodatée).
    await db.from("cabinets").update({ leads_plafond: p, leads_cgv_at: new Date().toISOString() }).eq("id", cab.id);

    let customer = cab.stripe_customer_id as string | null;
    if (!customer) {
      const c = await stripe<{ id: string }>("customers", { email: pro.email, name: cab.nom ?? undefined, metadata: { cabinet_id: cab.id } });
      customer = c.id;
      await db.from("cabinets").update({ stripe_customer_id: customer }).eq("id", cab.id);
    }
    const session = await stripe<{ url: string }>("checkout/sessions", {
      mode: "setup", customer, payment_method_types: ["card"], client_reference_id: cab.id,
      metadata: { cabinet_id: cab.id, type: "leads" }, setup_intent_data: { metadata: { cabinet_id: cab.id, type: "leads" } },
      locale: "fr",
      success_url: `${origin}/dashboard/${cab.page_seule ? "abonnement" : "leads"}?activation=ok`,
      cancel_url: `${origin}/dashboard/${cab.page_seule ? "abonnement" : "leads"}`,
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    console.error("[leads] activation", e);
    await notifierSlack(pro.profession, `⚠️ Activation des leads impossible, à rappeler : ${cab.nom}`, [["Contact", `${pro.prenom ?? ""} ${pro.nom ?? ""} · ${pro.email}`], ["Erreur", String(e).slice(0, 200)]]);
    return NextResponse.json({ ok: false, error: "L'enregistrement de la carte n'a pas pu s'ouvrir. Notre équipe vous rappelle sous 24 h." }, { status: 502 });
  }
}
