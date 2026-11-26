import { NextResponse } from "next/server";
import { tachesPlanifiees } from "@/lib/rdv/actions";
import { relancesEssai } from "@/lib/abonnement-relances";
import { tachesVisibilite } from "@/lib/visibilite-serveur";
import { tachesOnboarding } from "@/lib/emails-onboarding";
import { tachesAvis } from "@/lib/avis-serveur";
import { tachesLeads } from "@/lib/leads-serveur";

// Facturation des leads clotere.fr (fin du délai de contestation, lignes Stripe, facture mensuelle, plafonds).
// Relances 24 h, annulations automatiques 72 h, rappels de la veille, purge des rdv annulés ou refusés depuis 30 jours, rappels de fin d'essai, relances des demandes d'avis.
// À appeler toutes les heures (fonction planifiée Netlify) avec l'en-tête Authorization: Bearer <CRON_SECRET>.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ...(await tachesPlanifiees()), ...(await relancesEssai()), ...(await tachesVisibilite()), ...(await tachesOnboarding()), ...(await tachesAvis()), ...(await tachesLeads()) });
}
