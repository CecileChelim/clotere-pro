import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { envoyerMailCompte, esc, pageMail, urlEspace } from "@/lib/mail-compte";

/* E-mails d'accueil des pros : bienvenue à la fin de l'inscription, puis « Bien démarrer » à J+2
   si l'agenda n'est pas connecté ou qu'aucune demande n'est encore arrivée. Chacun n'est envoyé qu'une fois. */

type Pro = { id: string; email: string; prenom: string | null; profession: string | null; slug: string; google_calendar_connected: boolean | null; cabinet_id: string | null };

const dateFr = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });

async function dejaEnvoye(proId: string, type: string) {
  const { count } = await createAdminClient().from("emails").select("id", { count: "exact", head: true }).eq("professional_id", proId).eq("type", type);
  return (count ?? 0) > 0;
}

function etape(n: number, titre: string, texte: string, lien?: { href: string; label: string }) {
  return `<tr><td style="padding:10px 0;vertical-align:top;width:34px"><span style="display:inline-block;width:24px;height:24px;border-radius:12px;background:#111827;color:#fff;font-size:13px;font-weight:700;text-align:center;line-height:24px">${n}</span></td>
    <td style="padding:10px 0"><strong style="color:#111827">${titre}</strong><br><span style="color:#4b5563">${texte}</span>${lien ? `<br><a href="${lien.href}" style="color:#7c3aed;font-weight:600;text-decoration:none">${lien.label} →</a>` : ""}</td></tr>`;
}

export async function envoyerBienvenue(proId: string) {
  if (await dejaEnvoye(proId, "bienvenue")) return;
  const db = createAdminClient();
  const { data: p } = await db.from("professionals").select("id, email, prenom, profession, slug, google_calendar_connected, cabinet_id").eq("id", proId).maybeSingle();
  if (!p?.email) return;
  const pro = p as Pro;
  const { data: cab } = pro.cabinet_id ? await db.from("cabinets").select("trial_ends_at").eq("id", pro.cabinet_id).maybeSingle() : { data: null };
  const base = urlEspace(pro.profession);
  const lien = `${base}/rdv/${pro.slug}`;
  const comptable = pro.profession === "comptable";
  const html = pageMail(pro.profession ?? "avocat", "Bienvenue ! Votre page de rendez-vous est en ligne",
    `<p>Bonjour ${esc(pro.prenom ?? "")},</p>
     <p>Votre compte est prêt. Vos futurs clients peuvent dès maintenant réserver un rendez-vous ${comptable ? "avec votre cabinet" : "avec vous"} sur cette page :</p>
     <p style="margin:16px 0;padding:14px 16px;border-radius:10px;background:#f5f3ff;font-family:monospace;font-size:14px"><a href="${lien}" style="color:#111827;text-decoration:none">${esc(lien.replace(/^https?:\/\//, ""))}</a></p>
     <p style="margin-top:20px;font-weight:600;color:#111827">Pour bien démarrer, trois étapes :</p>
     <table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px">
       ${etape(1, "Connectez votre agenda", "Google ou Outlook : vos rendez-vous existants bloquent les créneaux, et chaque nouveau rendez-vous s'y ajoute.", { href: `${base}/dashboard/agenda`, label: "Connecter mon agenda" })}
       ${etape(2, "Choisissez vos plages", "Ouvrez la réservation en ligne seulement quand vous le souhaitez, par exemple le matin.", { href: `${base}/dashboard/agenda`, label: "Régler mes plages" })}
       ${etape(3, "Diffusez votre lien", "Sur votre site, votre fiche Google, LinkedIn et votre signature mail : c'est là que viennent les demandes.", { href: `${base}/dashboard/diffusion`, label: "Voir comment faire" })}
     </table>
     ${cab?.trial_ends_at ? `<p style="margin-top:20px">Votre essai gratuit court jusqu'au <strong>${dateFr(cab.trial_ends_at)}</strong>. Aucune carte n'est demandée d'ici là.</p>` : ""}
     <p>Une question ? Répondez simplement à cet e-mail.</p>`,
    { href: `${base}/dashboard`, label: "Ouvrir mon espace" });
  await envoyerMailCompte(pro, "Bienvenue sur Clotere : votre page de rendez-vous est en ligne", html, "bienvenue");
}

/** À appeler toutes les heures : « Bien démarrer » à J+2 si l'agenda n'est pas connecté ou qu'aucune demande n'est arrivée. */
export async function tachesOnboarding() {
  const db = createAdminClient();
  const res = { bienDemarrer: 0 };
  const { data: pros } = await db.from("professionals")
    .select("id, email, prenom, profession, slug, google_calendar_connected, cabinet_id, created_at")
    .not("cabinet_id", "is", null)
    .lte("created_at", new Date(Date.now() - 2 * 86400000).toISOString())
    .gte("created_at", new Date(Date.now() - 5 * 86400000).toISOString());

  for (const p of (pros ?? []) as (Pro & { created_at: string })[]) {
    if (!p.email || await dejaEnvoye(p.id, "bien_demarrer")) continue;
    const { count: demandes } = await db.from("bookings").select("id", { count: "exact", head: true }).eq("professional_id", p.id);
    const sansAgenda = !p.google_calendar_connected;
    const sansDemande = (demandes ?? 0) === 0;
    if (!sansAgenda && !sansDemande) continue;
    const base = urlEspace(p.profession);
    const lien = `${base}/rdv/${p.slug}`;
    const conseils = [
      sansAgenda && etape(1, "Connectez votre agenda en 30 secondes", "Sans agenda connecté, vos clients risquent de réserver sur un créneau déjà pris.", { href: `${base}/dashboard/agenda`, label: "Connecter Google ou Outlook" }),
      sansDemande && etape(sansAgenda ? 2 : 1, "Mettez votre lien là où vos clients vous cherchent", "Le plus efficace : le bouton « Prendre rendez-vous » de votre fiche Google, puis votre site et votre signature mail.", { href: `${base}/dashboard/diffusion`, label: "Ajouter mon lien" }),
    ].filter(Boolean).join("");
    const html = pageMail(p.profession ?? "avocat", "Recevez vos premières demandes",
      `<p>Bonjour ${esc(p.prenom ?? "")},</p>
       <p>Votre page de rendez-vous est en ligne depuis deux jours. ${sansDemande ? "Pour recevoir vos premières demandes, il reste une ou deux choses à faire :" : "Une dernière chose pour en profiter pleinement :"}</p>
       <table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px">${conseils}</table>
       <p style="margin-top:16px;color:#6b7280;font-size:14px">Votre page : <a href="${lien}" style="color:#6b7280">${esc(lien.replace(/^https?:\/\//, ""))}</a></p>
       <p>Besoin d'un coup de main ? Répondez à cet e-mail, on s'en occupe avec vous.</p>`,
      { href: `${base}/dashboard`, label: "Ouvrir mon espace" });
    await envoyerMailCompte(p, "Recevez vos premières demandes de rendez-vous", html, "bien_demarrer");
    res.bienDemarrer++;
  }
  return res;
}
