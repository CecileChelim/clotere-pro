import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { appliquerFormuleStripe } from "@/lib/abonnement-stripe";
import { notifierSlack } from "@/lib/slack";
import { PRIX } from "@/lib/tarifs";

// Passage de la formule « site + formulaire de contact » (69 €) à « site + prise de rendez-vous » (99 €).
// Pendant l'essai : immédiat. Abonnement en cours : l'abonnement Stripe est mis à jour au prorata.
export async function POST() {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  const { cab, pro } = ctx;
  if (pro.role === "membre") return NextResponse.json({ ok: false, error: "Seul le titulaire du cabinet peut changer d'offre." }, { status: 403 });
  if (cab.offre_rdv !== false) return NextResponse.json({ ok: true });

  const db = createAdminClient();
  const { count } = await db.from("professionals").select("id", { count: "exact", head: true }).eq("cabinet_id", cab.id);
  try {
    await appliquerFormuleStripe({ ...cab, offre_rdv: true }, count ?? 1, pro.profession);
  } catch (e) {
    console.error("[site] activation rdv", e);
    return NextResponse.json({ ok: false, error: "Le changement d'offre a échoué. Notre équipe vous rappelle sous 24 h." }, { status: 502 });
  }
  await db.from("cabinets").update({ offre_rdv: true }).eq("id", cab.id);
  await notifierSlack(pro.profession, `📅 Prise de rdv activée sur le site (${PRIX.siteRdv} € HT) : ${cab.nom}`, [["Contact", `${pro.prenom ?? ""} ${pro.nom ?? ""} · ${pro.email}`]]);
  return NextResponse.json({ ok: true });
}
