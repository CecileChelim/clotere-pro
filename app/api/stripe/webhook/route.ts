import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, webhookValide } from "@/lib/stripe";
import { majOuvertureLeads } from "@/lib/leads-serveur";
import { infosCabinet, notifierSlack } from "@/lib/slack";
import { estOption, OPTIONS, type OptionPayante } from "@/lib/options";

// Webhook Stripe : met à jour l'abonnement du cabinet. À déclarer dans Stripe → Développeurs → Webhooks.
type Sub = { id: string; status: string; customer: string; metadata?: { cabinet_id?: string; option?: string }; items?: { data: { quantity: number; current_period_end?: number }[] }; current_period_end?: number };

/** Colonnes du cabinet pour une option payante (abonnement Stripe séparé de l'abonnement de base). */
function patchOption(option: OptionPayante, active: boolean, subId: string | null) {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  if (option === "widget") return { offre_widget: active, stripe_sub_widget: subId };
  if (option === "site") return { site_paye: active, stripe_sub_site: subId };
  return option === "visibilite"
    ? { offre_visibilite: active, stripe_sub_visibilite: subId, ...(active ? { offre_visibilite_depuis: aujourdhui } : {}) }
    : { offre_avis: active, stripe_sub_avis: subId, ...(active ? { offre_avis_depuis: aujourdhui } : {}) };
}

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
    const meta = (o.metadata as { cabinet_id?: string; option?: string; periode?: string; type?: string }) ?? {};
    const cabinetId = meta.cabinet_id ?? (o.client_reference_id as string);
    if (cabinetId && meta.type === "leads") {
      // Demandes Clotere : carte enregistrée (mode setup) → moyen de paiement par défaut du client, leads activés.
      try {
        const si = await stripe<{ payment_method: string }>(`setup_intents/${o.setup_intent as string}`);
        await stripe(`customers/${o.customer as string}`, { invoice_settings: { default_payment_method: si.payment_method } });
      } catch (e) { console.error("[webhook] carte leads", e); }
      const { data: dejaActif } = await db.from("cabinets").select("leads_actives_at").eq("id", cabinetId).maybeSingle();
      const maintenant = new Date().toISOString();
      await db.from("cabinets").update({ leads_actifs: true, leads_actives_at: dejaActif?.leads_actives_at ?? maintenant, leads_carte_at: maintenant, stripe_customer_id: o.customer }).eq("id", cabinetId);
      await majOuvertureLeads(cabinetId);
      const i = await infosCabinet(cabinetId);
      await notifierSlack(i.profession, `🤝 Demandes Clotere activées : ${i.cabinet}`, [["Contact", i.contact], ["Ville", i.ville]]);
    } else if (cabinetId && estOption(meta.option)) {
      // Option payante : on l'active sans toucher à l'abonnement de base.
      const { data: c } = await db.from("cabinets").select("stripe_customer_id").eq("id", cabinetId).maybeSingle();
      await db.from("cabinets").update({ ...patchOption(meta.option, true, o.subscription as string), ...(c?.stripe_customer_id ? {} : { stripe_customer_id: o.customer }) }).eq("id", cabinetId);
      const i = await infosCabinet(cabinetId);
      await notifierSlack(i.profession, `✨ Option ${OPTIONS[meta.option].nom} activée : ${i.cabinet}`, [["Contact", i.contact], ["Ville", i.ville]]);
    } else if (cabinetId) {
      await db.from("cabinets").update({ stripe_customer_id: o.customer, stripe_subscription_id: o.subscription, subscription_status: "actif", abonnement_periode: meta.periode === "an" ? "an" : "mois" }).eq("id", cabinetId);
      const i = await infosCabinet(cabinetId);
      await notifierSlack(i.profession, `💳 Abonnement activé : ${i.cabinet}`, [["Contact", i.contact], ["Ville", i.ville], ["Professionnels", String(i.nb)]]);
    }
  }

  if (event.type.startsWith("customer.subscription.") && estOption((o as unknown as Sub).metadata?.option)) {
    // Abonnement d'une option : seule l'option est mise à jour.
    const sub = o as unknown as Sub;
    const option = sub.metadata!.option as OptionPayante;
    const active = event.type !== "customer.subscription.deleted" && ["active", "trialing", "past_due"].includes(sub.status);
    const q = db.from("cabinets").update(patchOption(option, active, active ? sub.id : null));
    if (sub.metadata?.cabinet_id) await q.eq("id", sub.metadata.cabinet_id);
    else await q.eq("stripe_customer_id", sub.customer);
    if (!active && sub.metadata?.cabinet_id) {
      const i = await infosCabinet(sub.metadata.cabinet_id);
      await notifierSlack(i.profession, `👋 Option ${OPTIONS[option].nom} arrêtée : ${i.cabinet}`, [["Contact", i.contact]]);
    }
  } else if (event.type.startsWith("customer.subscription.")) {
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
    // L'échec d'une facture d'option ne bloque pas la page de rendez-vous (seul l'abonnement de base le fait).
    const subFacture = (o.subscription as string | undefined) ?? (o.parent as { subscription_details?: { subscription?: string } } | undefined)?.subscription_details?.subscription;
    const { data: c } = await db.from("cabinets").select("id, stripe_subscription_id, stripe_sub_visibilite, stripe_sub_avis, stripe_sub_widget, stripe_sub_site").eq("stripe_customer_id", o.customer as string).maybeSingle();
    const facturOption = !!subFacture && !!c && (subFacture === c.stripe_sub_visibilite || subFacture === c.stripe_sub_avis || subFacture === c.stripe_sub_widget || subFacture === c.stripe_sub_site);
    // Facture sans abonnement = facture mensuelle des leads : on suspend les demandes Clotere, pas l'abonnement.
    const factureLeads = !subFacture;
    if (c && factureLeads) await db.from("cabinets").update({ leads_actifs: false, leads_ouverts: false }).eq("id", c.id);
    else if (c && !facturOption) await db.from("cabinets").update({ subscription_status: "impayé" }).eq("id", c.id);
    if (c) { const i = await infosCabinet(c.id); await notifierSlack(i.profession, `⚠️ Paiement échoué${facturOption ? " (option)" : factureLeads ? " (leads, demandes Clotere suspendues)" : ""} : ${i.cabinet}`, [["Contact", i.contact]]); }
  }
  return NextResponse.json({ received: true });
}
