import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

// Espace de facturation Stripe : factures, carte bancaire, résiliation.
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pro } = await (supabase as any).from("professionals").select("cabinet_id, role").eq("auth_user_id", user.id).maybeSingle();
  if (!pro?.cabinet_id || pro.role === "membre") return NextResponse.json({ ok: false }, { status: 403 });
  const { data: cab } = await createAdminClient().from("cabinets").select("stripe_customer_id").eq("id", pro.cabinet_id).single();
  if (!cab?.stripe_customer_id) return NextResponse.json({ ok: false, error: "Aucun abonnement" }, { status: 400 });
  const s = await stripe<{ url: string }>("billing_portal/sessions", { customer: cab.stripe_customer_id, return_url: `${origin}/dashboard/abonnement`, locale: "fr" });
  return NextResponse.json({ ok: true, url: s.url });
}
