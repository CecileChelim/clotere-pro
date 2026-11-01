import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { envoyerMailCompte, esc, pageMail, prevenirClotere, urlEspace, type Titulaire } from "@/lib/mail-compte";
import { infosCabinet, notifierSlack } from "@/lib/slack";
import { limiteRelecture, VALIDATION_AUTO_JOURS } from "@/lib/visibilite";

const dateFr = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });

async function titulaire(cabinetId: string): Promise<Titulaire | null> {
  const { data } = await createAdminClient().from("professionals").select("id, email, prenom, profession, role").eq("cabinet_id", cabinetId);
  return ((data ?? []).find((p) => p.role !== "membre") as Titulaire | undefined) ?? null;
}

/** Tâches horaires : prévient le cabinet des nouveaux articles à relire, valide automatiquement après 7 jours. */
export async function tachesVisibilite() {
  const db = createAdminClient();
  const res = { articlesNotifies: 0, articlesValidesAuto: 0 };

  // 1. Nouveaux articles à relire : un seul e-mail par cabinet.
  const { data: nouveaux } = await db.from("articles").select("id, cabinet_id, titre, pousse_le").eq("statut", "a_relire").is("notifie_le", null);
  const parCabinet = new Map<string, { id: string; titre: string; pousse_le: string }[]>();
  for (const a of nouveaux ?? []) parCabinet.set(a.cabinet_id, [...(parCabinet.get(a.cabinet_id) ?? []), a]);
  for (const [cabinetId, liste] of parCabinet) {
    const t = await titulaire(cabinetId);
    if (!t?.email) continue;
    const n = liste.length;
    const limite = limiteRelecture(liste[0].pousse_le);
    await envoyerMailCompte(t, `${n} article${n > 1 ? "s" : ""} à relire`, pageMail(t.profession ?? "avocat",
      `Vos articles du mois sont prêts`,
      `<p>Bonjour ${esc(t.prenom ?? "")},</p>
       <p>${n > 1 ? `Vos ${n} nouveaux articles sont prêts` : "Votre nouvel article est prêt"} :</p>
       <ul>${liste.map((a) => `<li><strong>${esc(a.titre)}</strong></li>`).join("")}</ul>
       <p>Relisez-les, corrigez si besoin, puis validez. Sans retour de votre part d'ici ${dateFr(limite)}, ils seront validés automatiquement pour respecter le calendrier de publication.</p>`,
      { href: `${urlEspace(t.profession)}/dashboard/visibilite`, label: "Relire mes articles" }), "articles_a_relire");
    await db.from("articles").update({ notifie_le: new Date().toISOString() }).in("id", liste.map((a) => a.id));
    res.articlesNotifies += n;
  }

  // 2. Validation automatique après 7 jours sans réponse.
  const seuil = new Date(Date.now() - VALIDATION_AUTO_JOURS * 86400000).toISOString();
  const { data: enRetard } = await db.from("articles").select("id, titre, cabinet_id").eq("statut", "a_relire").lte("pousse_le", seuil);
  for (const a of enRetard ?? []) {
    await db.from("articles").update({ statut: "valide", valide_auto: true, valide_le: new Date().toISOString() }).eq("id", a.id);
    const i = await infosCabinet(a.cabinet_id);
    await notifierSlack(i.profession, `🤖 Article validé automatiquement (7 jours sans réponse) : ${a.titre}`, [["Cabinet", i.cabinet]]);
    res.articlesValidesAuto++;
  }
  if (enRetard?.length) await prevenirClotere(`${enRetard.length} article(s) validé(s) automatiquement`, enRetard.map((a) => `<p>${esc(a.titre)}</p>`).join(""));
  return res;
}

/** Le cabinet de l'utilisateur connecté (et son profil), ou null. */
export async function cabinetConnecte() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const db = createAdminClient();
  const { data: pro } = await db.from("professionals").select("id, prenom, nom, email, profession, cabinet_id, role").eq("auth_user_id", user.id).maybeSingle();
  if (!pro?.cabinet_id) return null;
  const { data: cab } = await db.from("cabinets").select("*").eq("id", pro.cabinet_id).maybeSingle();
  return cab ? { pro, cab } : null;
}
