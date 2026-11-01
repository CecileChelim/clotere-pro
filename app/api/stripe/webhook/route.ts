import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { webhookValide } from "@/lib/stripe";
import { infosCabinet, notifierSlack } from "@/lib/slack";

// Webhook Stripe : met à jour l'abonnement du cabinet. À déclarer dans Stripe → Développeurs → Webhooks.
type Sub = { id: string; status: string; customer: string; metadata?: { cabinet_id?: string }; items?: { data: { quantity: number; current_period_end?: number }[] }; current_period_end?: number };

const STATUTS: Record<string, string> = {
  active: "actif", trialing: "actif", past_due: "impayé", unpaid: "impayé", incomplete: "impayé", incomplete_expired: "résilié", canceled: "résilié", paused: "résilié",
};

export async function POST(req: Request) {
  const payload = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookValide(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } };
  const db = createAdminClient();
  const o = event.data.object;

  if (event.type === "checkout.session.completed") {
    const cabinetId = (o.metadata as { cabinet_id?: string })?.cabinet_id ?? (o.client_reference_id as string);
    if (cabinetId) {
      await db.from("cabinets").update({ stripe_customer_id: o.customer, stripe_subscription_id: o.subscription, subscription_status: "actif" }).eq("id", cabinetId);
      const i = await infosCabinet(cabinetId);
      await notifierSlack(i.profession, `💳 Abonnement activé : ${i.cabinet}`, [["Contact", i.contact], ["Ville", i.ville], ["Professionnels", String(i.nb)]]);
    }
  }

  if (event.type.startsWith("customer.subscription.")) {
    const sub = o as unknown as Sub;
    const item = sub.items?.data?.[0];
    const fin = item?.current_period_end ?? sub.current_period_end;
    const patch = {
      stripe_customer_id: sub.customer, stripe_subscription_id: sub.id,
      subscription_status: event.type === "customer.subscription.deleted" ? "résilié" : STATUTS[sub.status] ?? sub.status,
      abonnement_quantite: item?.quantity ?? null,
      abonnement_fin_periode: fin ? new Date(fin * 1000).toISOString() : null,
    };
    const q = db.from("cabinets").update(patch);
    if (sub.metadata?.cabinet_id) await q.eq("id", sub.metadata.cabinet_id);
    else await q.eq("stripe_customer_id", sub.customer);
    if (event.type === "customer.subscription.deleted") {
      const { data: c } = await db.from("cabinets").select("id").eq("stripe_customer_id", sub.customer).maybeSingle();
      if (c) { const i = await infosCabinet(c.id); await notifierSlack(i.profession, `👋 Résiliation : ${i.cabinet}`, [["Contact", i.contact], ["Ville", i.ville]]); }
    }
  }

  if (event.type === "invoice.payment_failed") {
    await db.from("cabinets").update({ subscription_status: "impayé" }).eq("stripe_customer_id", o.customer as string);
    const { data: c } = await db.from("cabinets").select("id").eq("stripe_customer_id", o.customer as string).maybeSingle();
    if (c) { const i = await infosCabinet(c.id); await notifierSlack(i.profession, `⚠️ Paiement échoué : ${i.cabinet}`, [["Contact", i.contact]]); }
  }
  return NextResponse.json({ received: true });
}
