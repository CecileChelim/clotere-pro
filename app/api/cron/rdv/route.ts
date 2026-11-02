import { NextResponse } from "next/server";
import { tachesPlanifiees } from "@/lib/rdv/actions";
import { relancesEssai } from "@/lib/abonnement-relances";
import { tachesVisibilite } from "@/lib/visibilite-serveur";
import { tachesOnboarding } from "@/lib/emails-onboarding";

// Relances 24 h, annulations automatiques 72 h, rappels de la veille, rappels de fin d'essai.
// À appeler toutes les heures (fonction planifiée Netlify) avec l'en-tête Authorization: Bearer <CRON_SECRET>.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, ...(await tachesPlanifiees()), ...(await relancesEssai()), ...(await tachesVisibilite()), ...(await tachesOnboarding()) });
}
