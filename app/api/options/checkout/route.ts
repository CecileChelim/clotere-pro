import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { stripe } from "@/lib/stripe";
import { estOption, OPTIONS } from "@/lib/options";
import { PROFESSIONS } from "@/lib/professions-config";
import { notifierSlack } from "@/lib/slack";

// « Activer » une option payante (Visibilité, Avis) : page de paiement Stripe pour un abonnement dédié à l'option.
// L'option est activée par le webhook (checkout.session.completed) une fois le paiement validé.
export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  const { option } = (await req.json().catch(() => ({}))) as { option?: unknown };
  if (!estOption(option)) return NextResponse.json({ ok: false, error: "Option inconnue" }, { status: 400 });
  if (ctx.pro.role === "membre") return NextResponse.json({ ok: false, error: "Seul le titulaire du cabinet peut activer une option." }, { status: 403 });
  const { cab, pro } = ctx;
  if ((option === "avis" && (cab.offre_avis || cab.offre_visibilite)) || (option === "visibilite" && cab.offre_visibilite)) {
    return NextResponse.json({ ok: false, error: "Option déjà active" }, { status: 400 });
  }

  const conf = OPTIONS[option];
  const brand = PROFESSIONS[pro.profession === "comptable" ? "comptable" : "avocat"].brand;
  const prix = process.env[conf.envPrix];
  const prixLancement = conf.envPrixLancement ? process.env[conf.envPrixLancement] : undefined;
  const lignes: Record<string, unknown>[] = [prix
    ? { price: prix, quantity: 1 }
    : { quantity: 1, price_data: { currency: "eur", unit_amount: conf.prixMensuelHT * 100, recurring: { interval: "month" }, tax_behavior: "exclusive", product_data: { name: `${brand} — ${conf.produit}` } } }];
  if (conf.fraisLancementHT) {
    lignes.push(prixLancement
      ? { price: prixLancement, quantity: 1 }
      : { quantity: 1, price_data: { currency: "eur", unit_amount: conf.fraisLancementHT * 100, tax_behavior: "exclusive", product_data: { name: `${brand} — frais de lancement ${conf.nom}` } } });
  }

  try {
    const session = await stripe<{ url: string }>("checkout/sessions", {
      mode: "subscription",
      ...(cab.stripe_customer_id ? { customer: cab.stripe_customer_id } : { customer_email: pro.email }),
      client_reference_id: cab.id,
      line_items: lignes,
      subscription_data: { metadata: { cabinet_id: cab.id, option } },
      metadata: { cabinet_id: cab.id, option },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      locale: "fr",
      success_url: `${origin}${conf.retour}?option=ok`,
      cancel_url: `${origin}${conf.retour}`,
    });
    await notifierSlack(pro.profession, `🛒 Paiement de l'option ${conf.nom} ouvert : ${cab.nom}`, [["Contact", `${pro.prenom ?? ""} ${pro.nom ?? ""} · ${pro.email}`], ["Ville", cab.ville]]);
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    // Stripe indisponible : on garde au moins la demande pour rappeler le cabinet.
    console.error("[options] checkout", e);
    if (option === "visibilite") await createAdminClient().from("cabinets").update({ visibilite_demande_at: new Date().toISOString() }).eq("id", cab.id);
    await notifierSlack(pro.profession, `⚠️ Paiement impossible pour l'option ${conf.nom}, à rappeler : ${cab.nom}`, [["Contact", `${pro.prenom ?? ""} ${pro.nom ?? ""} · ${pro.email}`], ["Téléphone", cab.telephone], ["Erreur", String(e).slice(0, 200)]]);
    return NextResponse.json({ ok: false, error: "Le paiement n'a pas pu s'ouvrir. Notre équipe vous rappelle sous 24 h." }, { status: 502 });
  }
}
