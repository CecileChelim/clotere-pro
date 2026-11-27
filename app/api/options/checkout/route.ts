import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { stripe } from "@/lib/stripe";
import { estOption, OPTIONS, prixSite } from "@/lib/options";
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
  if ((option === "avis" && (cab.offre_avis || cab.offre_visibilite)) || (option === "visibilite" && cab.offre_visibilite)
    || (option === "widget" && cab.offre_widget) || (option === "site" && (cab.site_paye || !cab.offre_site))) {
    return NextResponse.json({ ok: false, error: "Option déjà active" }, { status: 400 });
  }

  const conf = OPTIONS[option];
  const brand = PROFESSIONS[pro.profession === "comptable" ? "comptable" : "avocat"].brand;
  const prix = option === "site" ? undefined : process.env[conf.envPrix];
  const montant = option === "site" ? prixSite(cab) : conf.prixMensuelHT;
  const { count: nbPros } = option === "widget"
    ? await createAdminClient().from("professionals").select("id", { count: "exact", head: true }).eq("cabinet_id", cab.id)
    : { count: 1 };
  const quantite = Math.max(1, nbPros ?? 1);
  const prixLancement = conf.envPrixLancement ? process.env[conf.envPrixLancement] : undefined;
  const lignes: Record<string, unknown>[] = [prix
    ? { price: prix, quantity: quantite }
    : { quantity: quantite, price_data: { currency: "eur", unit_amount: montant * 100, recurring: { interval: "month" }, tax_behavior: "exclusive", product_data: { name: `${brand} — ${conf.produit}` } } }];
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
      // Prix en HT (tax_behavior exclusive) : Stripe Tax ajoute la TVA (20 % en France, autoliquidation UE avec n° de TVA).
      automatic_tax: { enabled: true },
      // Client Stripe existant : l'adresse et la raison sociale saisies au paiement sont enregistrées (requis pour le calcul de TVA).
      ...(cab.stripe_customer_id ? { customer_update: { address: "auto", name: "auto" } } : {}),
      locale: "fr",
      success_url: option === "site" ? `${origin}/dashboard/site?nouveau=1&paiement=ok` : `${origin}${conf.retour}?option=ok`,
      cancel_url: option === "site" || option === "widget" ? `${origin}/dashboard/abonnement` : `${origin}${conf.retour}`,
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
