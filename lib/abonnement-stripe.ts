import "server-only";
import { stripe } from "@/lib/stripe";
import { PROFESSIONS } from "@/lib/professions-config";
import { lignesTarif, prixPeriode, type LigneTarif, type Periode } from "@/lib/tarifs";

/* Lignes Stripe de l'abonnement de base, calculées depuis les modules du cabinet (widget, site + contact, site + rdv). */

type Cab = { offre_site?: boolean | null; offre_rdv?: boolean | null };

export function lignesStripe(cab: Cab, nbPros: number, periode: Periode, profession: string | null) {
  const brand = PROFESSIONS[profession === "comptable" ? "comptable" : "avocat"].brand;
  const lignes = lignesTarif(cab, nbPros);
  return lignes.map((l: LigneTarif) => {
    // Prix Stripe existant pour le widget au mois (STRIPE_PRICE_ID), sinon prix créé à la volée.
    if (l.code === "widget" && periode === "mois" && process.env.STRIPE_PRICE_ID) return { price: process.env.STRIPE_PRICE_ID, quantity: l.quantite };
    return {
      quantity: l.quantite,
      price_data: {
        currency: "eur", unit_amount: prixPeriode(l.prixMensuelHT, periode) * 100, recurring: { interval: periode === "an" ? "year" : "month" },
        tax_behavior: "exclusive", product_data: { name: `${brand} — ${l.libelle}` },
      },
    };
  });
}

type SubStripe = { id: string; status: string; items: { data: { id: string; price: { recurring?: { interval?: string } } }[] } };

/**
 * Le cabinet change de formule (ex. formulaire de contact → prise de rdv) alors qu'il a déjà un abonnement Stripe :
 * on remplace les lignes de l'abonnement (au prorata). Sans abonnement actif, rien à faire : le prochain paiement prendra la bonne formule.
 */
export async function appliquerFormuleStripe(cab: Cab & { stripe_subscription_id?: string | null; subscription_status?: string | null }, nbPros: number, profession: string | null) {
  if (!cab.stripe_subscription_id || !["actif", "impayé"].includes(cab.subscription_status ?? "")) return { modifie: false };
  const sub = await stripe<SubStripe>(`subscriptions/${cab.stripe_subscription_id}`);
  const periode: Periode = sub.items.data[0]?.price?.recurring?.interval === "year" ? "an" : "mois";
  const brand = PROFESSIONS[profession === "comptable" ? "comptable" : "avocat"].brand;
  // Les prix doivent exister avant d'être rattachés à un abonnement existant.
  const nouveaux = await Promise.all(lignesTarif(cab, nbPros).map(async (l) => {
    const prix = await stripe<{ id: string }>("prices", {
      currency: "eur", unit_amount: prixPeriode(l.prixMensuelHT, periode) * 100, recurring: { interval: periode === "an" ? "year" : "month" },
      tax_behavior: "exclusive", product_data: { name: `${brand} — ${l.libelle}` },
    });
    return { price: prix.id, quantity: l.quantite };
  }));
  await stripe(`subscriptions/${sub.id}`, {
    items: [...sub.items.data.map((i) => ({ id: i.id, deleted: true })), ...nouveaux],
    proration_behavior: "create_prorations",
  });
  return { modifie: true };
}
