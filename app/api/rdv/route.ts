import { NextResponse } from "next/server";
import { baseUrl, creerDemande, ErreurRdv } from "@/lib/rdv/actions";
import { limiteAtteinte, tropDeDemandesClient } from "@/lib/antispam";

// Création d'une demande depuis la page publique de prise de rendez-vous.
export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (b.hp) return NextResponse.json({ ok: true }); // champ piège anti-robots
    if (await limiteAtteinte(req)) {
      return NextResponse.json({ ok: false, error: "Trop de demandes envoyées. Merci de réessayer un peu plus tard." }, { status: 429 });
    }
    if (typeof b.client_email === "string" && typeof b.professional_id === "string"
      && await tropDeDemandesClient(b.professional_id, b.client_email.trim().toLowerCase())) {
      return NextResponse.json({ ok: false, error: "Vous avez déjà des demandes en attente chez ce cabinet. Merci d'attendre leur réponse." }, { status: 429 });
    }
    const s = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
    const r = await creerDemande({
      professional_id: s(b.professional_id, 60),
      motif_id: b.motif_id ? s(b.motif_id, 60) : null,
      mode: ["visio", "telephone", "cabinet"].includes(b.mode) ? b.mode : "visio",
      creneau_debut: s(b.creneau_debut, 40),
      creneau_fin: s(b.creneau_fin, 40),
      client_nom: s(b.client_nom, 100),
      client_prenom: s(b.client_prenom, 100),
      client_email: s(b.client_email, 200).toLowerCase(),
      client_tel: s(b.client_tel, 30),
      message: s(b.message, 500) || null,
      suivi_existant: !!b.suivi_existant,
      deja_avocat: ["non", "oui", "changer"].includes(b.deja_avocat) ? b.deja_avocat : null,
      source: s(b.source, 20) || "direct",
    }, baseUrl(req));
    return NextResponse.json({ ok: true, suivi: `/suivi/${r.token_client}` });
  } catch (e) {
    const msg = e instanceof ErreurRdv ? e.message : "Erreur inattendue";
    if (!(e instanceof ErreurRdv)) console.error("[api/rdv]", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
