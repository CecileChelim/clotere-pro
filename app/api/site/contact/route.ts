import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { limiteAtteinte } from "@/lib/antispam";
import { envoyerMail } from "@/lib/envoi-mail";
import { esc, pageMail, urlEspace } from "@/lib/mail-compte";
import { etatAbonnement } from "@/lib/abonnement";

// Formulaire de contact d'un site (formule 69 €) : message enregistré dans l'espace du cabinet + e-mail au titulaire.
const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (s(body.site_web, 200)) return NextResponse.json({ ok: true }); // piège à robots rempli : on ignore sans le dire
  const siteId = s(body.siteId, 60);
  const msg = { prenom: s(body.prenom, 80), nom: s(body.nom, 80), email: s(body.email, 160), telephone: s(body.telephone, 40), objet: s(body.objet, 160), message: s(body.message, 4000) };
  if (!siteId || !msg.nom || !msg.message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(msg.email)) {
    return NextResponse.json({ ok: false, error: "Merci de renseigner votre nom, un e-mail valide et votre message." }, { status: 400 });
  }
  if (await limiteAtteinte(req)) return NextResponse.json({ ok: false, error: "Trop de messages envoyés, réessayez plus tard." }, { status: 429 });

  const db = createAdminClient();
  const { data: site } = await db.from("sites").select("id, cabinet_id, profession, professional_id").eq("id", siteId).maybeSingle();
  if (!site) return NextResponse.json({ ok: false, error: "Site introuvable." }, { status: 404 });
  const { data: cab } = await db.from("cabinets").select("nom, trial_ends_at, subscription_status").eq("id", site.cabinet_id).maybeSingle();
  if (!etatAbonnement(cab).actif) return NextResponse.json({ ok: false, error: "Ce formulaire est momentanément indisponible." }, { status: 403 });

  const { error } = await db.from("site_messages").insert({ site_id: site.id, cabinet_id: site.cabinet_id, ...msg, prenom: msg.prenom || null, telephone: msg.telephone || null, objet: msg.objet || null });
  if (error) { console.error("[site contact]", error.message); return NextResponse.json({ ok: false, error: "L'envoi a échoué, réessayez dans un instant." }, { status: 500 }); }

  const { data: pros } = await db.from("professionals").select("id, email, prenom, role, profession").eq("cabinet_id", site.cabinet_id);
  const t = (pros ?? []).find((p) => p.role !== "membre") ?? pros?.[0];
  if (t?.email) {
    const qui = `${msg.prenom} ${msg.nom}`.trim();
    const html = pageMail(site.profession, `Nouveau message de ${esc(qui)}`,
      `<p>Bonjour ${esc(t.prenom ?? "")},</p>
       <p>Vous avez reçu un message depuis votre site internet.</p>
       <p style="margin:16px 0;padding:16px;background:#f9fafb;border-radius:12px">
         <strong>${esc(qui)}</strong><br>${esc(msg.email)}${msg.telephone ? `<br>${esc(msg.telephone)}` : ""}
         ${msg.objet ? `<br><br><strong>Objet :</strong> ${esc(msg.objet)}` : ""}
         <br><br>${esc(msg.message).replace(/\n/g, "<br>")}
       </p>
       <p>Répondez directement à cet e-mail pour lui écrire.</p>`,
      { href: `${urlEspace(site.profession)}/dashboard/site?onglet=messages`, label: "Voir mes messages" });
    const { erreur } = await envoyerMail({ nomExpediteur: `${cab?.nom ?? "Votre site"} via Clotere`, to: t.email, replyTo: { email: msg.email, name: qui }, sujet: `Nouveau message : ${msg.objet || qui}`, html });
    if (erreur) console.error("[site contact] e-mail", erreur);
  }
  return NextResponse.json({ ok: true });
}
