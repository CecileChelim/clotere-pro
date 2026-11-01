import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRIX_MENSUEL_HT } from "@/lib/abonnement";
import { notifierSlack } from "@/lib/slack";
import { envoyerMailCompte as envoyer, pageMail as page, esc, type Titulaire } from "@/lib/mail-compte";
const dateFr = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });

/* Rappels de fin d'essai envoyés au titulaire du cabinet :
   - 2 jours avant la fin : « votre essai se termine le … » ;
   - à la fin : « votre page de prise de rendez-vous est en pause ». */

const base = (profession: string | null) =>
  process.env.NEXT_PUBLIC_SITE_URL || (profession === "comptable" ? "https://comptable.clotere.fr" : "https://avocat.clotere.fr");

export async function relancesEssai() {
  const db = createAdminClient();
  const now = Date.now();
  const res = { rappelsJ2: 0, finsEssai: 0 };
  const { data: cabs } = await db.from("cabinets")
    .select("id, trial_ends_at, rappel_essai_j2_at, rappel_essai_fin_at, abonnement_quantite")
    .eq("subscription_status", "essai")
    .lte("trial_ends_at", new Date(now + 2 * 86400000).toISOString())
    .gte("trial_ends_at", new Date(now - 7 * 86400000).toISOString());

  for (const c of cabs ?? []) {
    const fin = new Date(c.trial_ends_at).getTime();
    const { data: pros } = await db.from("professionals").select("id, email, prenom, profession, role").eq("cabinet_id", c.id);
    const t = (pros ?? []).find((p) => p.role !== "membre") as Titulaire | undefined;
    if (!t?.email) continue;
    const nb = Math.max(1, c.abonnement_quantite ?? pros?.length ?? 1);
    const url = `${base(t.profession)}/dashboard/abonnement`;
    const bonjour = `<p>Bonjour ${esc(t.prenom ?? "")},</p>`;

    if (fin <= now && !c.rappel_essai_fin_at) {
      await envoyer(t, "Votre essai est terminé : votre prise de rendez-vous est en pause", page(t.profession ?? "avocat",
        "Votre essai gratuit est terminé",
        `${bonjour}<p>Vos 7 jours d'essai sont terminés. <strong>Votre page de prise de rendez-vous est en pause</strong> : vos clients ne peuvent plus réserver en ligne.</p>
         <p>Ajoutez votre carte pour la réactiver immédiatement (${PRIX_MENSUEL_HT * nb} € HT par mois, sans engagement). Vos réglages, motifs et rendez-vous sont conservés.</p>`,
        { href: url, label: "Réactiver ma prise de rendez-vous" }), "essai_termine");
      await db.from("cabinets").update({ rappel_essai_fin_at: new Date().toISOString(), rappel_essai_j2_at: c.rappel_essai_j2_at ?? new Date().toISOString() }).eq("id", c.id);
      await notifierSlack(t.profession, `⏳ Essai terminé sans carte : page en pause`, [["Contact", `${t.prenom ?? ""} · ${t.email}`]]);
      res.finsEssai++;
    } else if (fin > now && !c.rappel_essai_j2_at) {
      await envoyer(t, `Votre essai se termine ${dateFr(c.trial_ends_at)}`, page(t.profession ?? "avocat",
        "Plus que 2 jours d'essai",
        `${bonjour}<p>Votre essai gratuit se termine <strong>${dateFr(c.trial_ends_at)}</strong>. Sans carte enregistrée, votre page de prise de rendez-vous sera mise en pause à cette date.</p>
         <p>Ajoutez votre carte dès maintenant : rien n'est prélevé avant la fin de l'essai, puis ${PRIX_MENSUEL_HT * nb} € HT par mois, sans engagement.</p>`,
        { href: url, label: "Ajouter ma carte" }), "essai_j2");
      await db.from("cabinets").update({ rappel_essai_j2_at: new Date().toISOString() }).eq("id", c.id);
      res.rappelsJ2++;
    }
  }
  return res;
}
