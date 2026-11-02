import { NextResponse } from "next/server";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { notifierSlack } from "@/lib/slack";
import { envoyerBienvenue } from "@/lib/emails-onboarding";

// Fin de l'inscription : e-mail de bienvenue au pro + notification dans le channel Slack du métier.
export async function POST() {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  const { pro, cab } = ctx;
  await envoyerBienvenue(pro.id);
  await notifierSlack(pro.profession, `🎉 Nouvelle inscription : ${cab.nom}`, [
    ["Contact", `${pro.prenom ?? ""} ${pro.nom ?? ""}`], ["E-mail", pro.email], ["Ville", cab.ville], ["Téléphone", cab.telephone],
    ["Fin d'essai", cab.trial_ends_at ? new Date(cab.trial_ends_at).toLocaleDateString("fr-FR") : null],
  ]);
  return NextResponse.json({ ok: true });
}
