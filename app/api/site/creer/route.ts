import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { brouillonValide, creerSite } from "@/lib/site/serveur";
import { notifierSlack } from "@/lib/slack";
import { urlEspace } from "@/lib/mail-compte";
import { PRIX } from "@/lib/tarifs";

// Fin du créateur de site : l'utilisateur vient de s'inscrire (ou est déjà connecté) → cabinet, profil et site créés.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ ok: false, error: "Connectez-vous pour enregistrer votre site." }, { status: 401 });

  const b = brouillonValide(await req.json().catch(() => null));
  if (!b) return NextResponse.json({ ok: false, error: "Il manque des informations (nom du cabinet, prénom, nom, ville, téléphone ou e-mail)." }, { status: 400 });

  try {
    const r = await creerSite({ id: user.id, email: user.email }, b);
    if (!r.dejaExistant) {
      const url = `${urlEspace(b.profession)}/${r.slug}`;
      await notifierSlack(b.profession, `🌐 Nouveau site créé : ${b.cabinet.nom}`, [
        ["Contact", `${b.prenom} ${b.nom} · ${user.email}`], ["Ville", b.cabinet.ville],
        ["Formule", b.formule === "rdv" ? `Prise de rdv (${PRIX.siteRdv} € HT)` : `Formulaire de contact (${PRIX.siteContact} € HT)`],
        ["Template", b.template], ["Compte", r.nouveauCompte ? "nouveau (essai 7 jours)" : "client existant"],
      ], { url, label: "Voir le site" });
    }
    return NextResponse.json({ ok: true, slug: r.slug });
  } catch (e) {
    console.error("[site] création", e);
    // En local, on affiche la cause exacte pour pouvoir corriger.
    const detail = process.env.NODE_ENV === "development" ? ` (${e instanceof Error ? e.message : String(e)})` : "";
    return NextResponse.json({ ok: false, error: `La création du site a échoué. Réessayez, ou écrivez-nous à contact@clotere.fr.${detail}` }, { status: 500 });
  }
}
