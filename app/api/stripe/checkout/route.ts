import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { PRIX_MENSUEL_HT } from "@/lib/abonnement";
import { PROFESSIONS } from "@/lib/professions-config";

// Ouvre une page de paiement Stripe pour l'abonnement du cabinet (69 € HT / mois / professionnel).
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pro } = await (supabase as any).from("professionals").select("id, email, cabinet_id, role, profession").eq("auth_user_id", user.id).maybeSingle();
  if (!pro?.cabinet_id) return NextResponse.json({ ok: false, error: "Cabinet introuvable" }, { status: 400 });
  if (pro.role === "membre") return NextResponse.json({ ok: false, error: "Seul le titulaire du cabinet peut gérer l'abonnement." }, { status: 403 });

  const db = createAdminClient();
  const { data: cab } = await db.from("cabinets").select("id, nom, trial_ends_at, stripe_customer_id").eq("id", pro.cabinet_id).single();
  const { count } = await db.from("professionals").select("id", { count: "exact", head: true }).eq("cabinet_id", pro.cabinet_id);
  const quantite = Math.max(1, count ?? 1);
  const conf = PROFESSIONS[pro.profession === "comptable" ? "comptable" : "avocat"];

  // Si l'essai n'est pas terminé (> 48 h restantes), le premier prélèvement a lieu à sa fin.
  const finEssai = cab?.trial_ends_at ? Math.floor(new Date(cab.trial_ends_at).getTime() / 1000) : 0;
  const garderEssai = finEssai - Date.now() / 1000 > 48 * 3600;

  const session = await stripe<{ url: string }>("checkout/sessions", {
    mode: "subscription",
    ...(cab?.stripe_customer_id ? { customer: cab.stripe_customer_id } : { customer_email: pro.email }),
    client_reference_id: pro.cabinet_id,
    line_items: [process.env.STRIPE_PRICE_ID
      ? { price: process.env.STRIPE_PRICE_ID, quantity: quantite }
      : {
          quantity: quantite,
          price_data: {
            currency: "eur", unit_amount: PRIX_MENSUEL_HT * 100, recurring: { interval: "month" },
            tax_behavior: "exclusive",
            product_data: { name: `${conf.brand} — prise de rendez-vous en ligne` },
          },
        }],
    subscription_data: { metadata: { cabinet_id: pro.cabinet_id }, ...(garderEssai ? { trial_end: finEssai } : {}) },
    metadata: { cabinet_id: pro.cabinet_id },
    allow_promotion_codes: true,
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    locale: "fr",
    success_url: `${origin}/dashboard/abonnement?paiement=ok`,
    cancel_url: `${origin}/dashboard/abonnement`,
  });
  return NextResponse.json({ ok: true, url: session.url });
}
