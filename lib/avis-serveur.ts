import "server-only";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { esc, pageMail } from "@/lib/mail-compte";
import { adresseMetier, nomViaClotere } from "@/lib/expediteur";
import { lienAvisGoogle, synchroniserGoogle, type AvisPlaces } from "@/lib/google";
import { avisActif } from "@/lib/options";
import { notifierSlack } from "@/lib/slack";
import { CLOTURE_JOURS, DELAIS_RELANCE_JOURS, MAX_RELANCES, type DemandeAvis, type EnvoiDemande } from "@/lib/avis";

const JOUR = 86400000;
const norm = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

type Cab = { id: string; nom: string | null; google_place_id: string | null; google_business_url: string | null; google_reviews_url: string | null; offre_avis?: boolean | null; offre_visibilite?: boolean | null };
type Pro = { id: string; prenom: string | null; nom: string | null; email: string; profession: string | null; role: string | null };

async function contexte(cabinetId: string) {
  const db = createAdminClient();
  const [{ data: cab }, { data: pros }] = await Promise.all([
    db.from("cabinets").select("id, nom, google_place_id, google_business_url, google_reviews_url, offre_avis, offre_visibilite").eq("id", cabinetId).maybeSingle(),
    db.from("professionals").select("id, prenom, nom, email, profession, role").eq("cabinet_id", cabinetId),
  ]);
  const titulaire = ((pros ?? []).find((p) => p.role !== "membre") ?? pros?.[0]) as Pro | undefined;
  return cab && titulaire ? { cab: cab as Cab, pro: titulaire } : null;
}

const signature = (pro: Pro, cab: Cab) =>
  pro.profession === "avocat" ? `Maître ${[pro.prenom, pro.nom].filter(Boolean).join(" ")}` : (cab.nom || [pro.prenom, pro.nom].filter(Boolean).join(" "));

/* ------------------------------------------------------------------ */
/* Réponses suggérées                                                  */
/* ------------------------------------------------------------------ */

/** Réponse de secours, sans IA : courte, neutre, sans jamais évoquer le dossier (secret professionnel). */
function reponseModele(note: number, prenomAuteur: string, sig: string) {
  const bonjour = prenomAuteur ? `Bonjour ${prenomAuteur},` : "Bonjour,";
  if (note >= 4) return `${bonjour}\n\nMerci beaucoup pour votre confiance et pour ce message, qui nous touche. Toute l'équipe reste à votre disposition si vous avez besoin de nous à l'avenir.\n\n${sig}`;
  if (note === 3) return `${bonjour}\n\nMerci d'avoir pris le temps de partager votre avis. Vos remarques nous aident à améliorer notre accompagnement. N'hésitez pas à nous contacter directement si vous souhaitez en parler.\n\n${sig}`;
  return `${bonjour}\n\nNous sommes désolés que votre expérience n'ait pas été à la hauteur de vos attentes. Tenus au secret professionnel, nous ne pouvons pas répondre ici sur le fond, mais nous vous invitons à nous contacter directement pour en échanger.\n\n${sig}`;
}

/** Propose une réponse à un avis : IA (Mistral, sinon OpenAI) si une clé est configurée, sinon modèle. */
export async function genererReponse(avis: { auteur: string | null; note: number | null; texte: string | null }, pro: Pro, cab: Cab) {
  const sig = signature(pro, cab);
  const prenom = (avis.auteur ?? "").split(" ")[0] ?? "";
  const note = avis.note ?? 5;
  const metier = pro.profession === "comptable" ? "cabinet d'expertise comptable" : "cabinet d'avocats";
  const consignes = `Tu rédiges, en français, la réponse publique d'un ${metier} à un avis Google.
Règles impératives :
- 2 à 4 phrases, ton chaleureux et professionnel, vouvoiement, pas d'emoji, pas de formule commerciale.
- Ne jamais mentionner ni confirmer le dossier, les faits, la procédure, un montant ou un résultat, ni même que la personne est cliente (secret professionnel).
- Avis négatif : rester factuel et courtois, ne pas se justifier, inviter à contacter le cabinet directement.
- Commencer par « Bonjour ${prenom || ""} » (sans le nom de famille) et terminer par la signature : ${sig}
Réponds uniquement avec le texte de la réponse.`;
  const message = `Note : ${note}/5\nAvis : ${avis.texte?.trim() || "(note sans commentaire)"}`;

  const fournisseur = process.env.MISTRAL_API_KEY
    ? { url: "https://api.mistral.ai/v1/chat/completions", key: process.env.MISTRAL_API_KEY, model: process.env.MISTRAL_MODEL || "mistral-small-latest" }
    : process.env.OPENAI_API_KEY
      ? { url: "https://api.openai.com/v1/chat/completions", key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL || "gpt-4o-mini" }
      : null;
  if (fournisseur) {
    try {
      const res = await fetch(fournisseur.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${fournisseur.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: fournisseur.model, temperature: 0.5, max_tokens: 300, messages: [{ role: "system", content: consignes }, { role: "user", content: message }] }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const texte = ((await res.json()) as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content?.trim();
        if (texte) return texte;
      } else console.error("[avis] IA", res.status, await res.text());
    } catch (e) { console.error("[avis] IA", e); }
  }
  return reponseModele(note, prenom, sig);
}

/* ------------------------------------------------------------------ */
/* Synchronisation des avis Google                                     */
/* ------------------------------------------------------------------ */

const cleAvis = (r: AvisPlaces) => r.name || createHash("sha1").update(`${r.authorAttribution?.displayName ?? ""}|${r.text?.text ?? r.originalText?.text ?? ""}`).digest("hex");

/** Récupère les avis de la fiche Google, ajoute les nouveaux, propose une réponse et rapproche les demandes en cours. */
export async function synchroniserAvis(cabinetId: string) {
  const r = await synchroniserGoogle(cabinetId);
  if (!r.ok) return r;
  const ctx = await contexte(cabinetId);
  if (!ctx) return { ok: false as const, raison: "Cabinet introuvable" };
  const db = createAdminClient();
  const { data: existants } = await db.from("avis_google").select("cle").eq("cabinet_id", cabinetId);
  const connus = new Set((existants ?? []).map((a) => a.cle));
  let nouveaux = 0;

  for (const rev of r.reviews) {
    const cle = cleAvis(rev);
    if (connus.has(cle)) continue;
    const ligne = {
      cabinet_id: cabinetId, cle,
      auteur: rev.authorAttribution?.displayName ?? "Client", photo: rev.authorAttribution?.photoUri ?? null,
      note: rev.rating, texte: (rev.text?.text || rev.originalText?.text || "").slice(0, 2000) || null,
      publie_le: rev.publishTime ?? null, quand: rev.relativePublishTimeDescription ?? null,
    };
    const reponse = await genererReponse(ligne, ctx.pro, ctx.cab);
    const { data: ins } = await db.from("avis_google").insert({ ...ligne, reponse_suggeree: reponse, reponse_suggeree_le: new Date().toISOString() }).select("id, auteur").maybeSingle();
    nouveaux++;
    if (ins) await rapprocherDemande(cabinetId, ins.id, ins.auteur);
  }
  if (nouveaux) {
    await notifierSlack(ctx.pro.profession, `⭐ ${nouveaux} nouvel${nouveaux > 1 ? "s" : ""} avis Google : ${ctx.cab.nom}`, [["Note", r.note != null ? String(r.note) : null]]);
  }
  return { ok: true as const, note: r.note, total: r.avis, nouveaux };
}

/** Un nouvel avis dont l'auteur ressemble au nom d'un client relancé : la demande passe en « avis reçu ». */
async function rapprocherDemande(cabinetId: string, avisId: string, auteur: string | null) {
  const a = norm(auteur ?? "");
  if (!a) return;
  const db = createAdminClient();
  const { data: demandes } = await db.from("demandes_avis").select("id, client_nom").eq("cabinet_id", cabinetId).eq("statut", "en_cours");
  const motsA = new Set(a.split(" ").filter((w) => w.length >= 3));
  const d = (demandes ?? []).find((x) => {
    const mots = norm(x.client_nom ?? "").split(" ").filter((w) => w.length >= 3);
    return mots.length > 0 && mots.filter((w) => motsA.has(w)).length >= Math.min(2, mots.length);
  });
  if (d) await db.from("demandes_avis").update({ statut: "avis_recu", avis_id: avisId, prochaine_relance_le: null, updated_at: new Date().toISOString() }).eq("id", d.id);
}

/* ------------------------------------------------------------------ */
/* Demandes d'avis et relances                                          */
/* ------------------------------------------------------------------ */

async function envoyerAuClient(cab: Cab, pro: Pro, to: string, clientNom: string | null, relance: boolean) {
  const lien = lienAvisGoogle(cab);
  if (!lien) return false;
  const nomCab = cab.nom || [pro.prenom, pro.nom].filter(Boolean).join(" ");
  const prenom = (clientNom ?? "").split(" ")[0];
  const sujet = relance ? `Petit rappel : votre avis pour ${nomCab}` : `Votre avis compte pour ${nomCab}`;
  const html = pageMail(pro.profession ?? "avocat", relance ? "Un petit mot de votre part ?" : "Merci pour votre confiance",
    `<p>Bonjour${prenom ? ` ${esc(prenom)}` : ""},</p>
     ${relance
       ? `<p>Il y a quelques jours, nous vous demandions votre avis sur votre accompagnement par ${esc(nomCab)}. Si vous avez une minute, quelques mots sur Google aident d'autres personnes à trouver le bon interlocuteur.</p>`
       : `<p>Merci d'avoir fait confiance à ${esc(nomCab)}.</p><p>Si vous avez une minute, votre avis sur Google aide d'autres personnes à trouver le bon interlocuteur. Il suffit de quelques mots.</p>`}
     <p style="font-size:13px;color:#6b7280">Vous ne souhaitez pas laisser d'avis ? Ignorez simplement ce message.</p>`,
    { href: lien, label: "Laisser un avis sur Google" });
  const key = process.env.BREVO_API_KEY;
  let envoye = false, erreur: string | null = null;
  if (key) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: { name: nomViaClotere(nomCab), email: adresseMetier(pro.profession) },
          replyTo: { email: pro.email, name: [pro.prenom, pro.nom].filter(Boolean).join(" ") || nomCab },
          to: [{ email: to }], subject: sujet, htmlContent: html,
        }),
      });
      envoye = res.ok;
      if (!res.ok) erreur = `Brevo ${res.status} : ${await res.text()}`;
    } catch (e) { erreur = String(e); }
  } else console.log("[avis] e-mail (Brevo non configuré)", to, sujet);
  await createAdminClient().from("emails").insert({ booking_id: null, professional_id: pro.id, destinataire: to, type: relance ? "avis_relance" : "avis_demande", sujet, html, envoye, erreur });
  if (erreur) console.error("[avis] e-mail", erreur);
  return envoye;
}

const dans = (jours: number) => new Date(Date.now() + jours * JOUR).toISOString();

/** Enregistre une demande d'avis. Si `dejaEnvoye`, l'e-mail est parti ailleurs (clôture d'un rendez-vous). */
export async function creerDemandeAvis(p: { cabinetId: string; bookingId?: string | null; clientNom: string | null; clientEmail: string; dejaEnvoye?: boolean }) {
  const ctx = await contexte(p.cabinetId);
  if (!ctx) throw new Error("Cabinet introuvable");
  if (!lienAvisGoogle(ctx.cab)) throw new Error("Renseignez d'abord le lien de votre fiche Google.");
  const db = createAdminClient();
  const email = p.clientEmail.trim().toLowerCase();
  const { data: dejaEnCours } = await db.from("demandes_avis").select("id").eq("cabinet_id", p.cabinetId).eq("client_email", email).eq("statut", "en_cours").maybeSingle();
  if (dejaEnCours) throw new Error("Une demande est déjà en cours pour ce client.");
  const envoye = p.dejaEnvoye ? true : await envoyerAuClient(ctx.cab, ctx.pro, email, p.clientNom, false);
  const historique: EnvoiDemande[] = [{ type: "demande", le: new Date().toISOString(), envoye }];
  const { data } = await db.from("demandes_avis").insert({
    cabinet_id: p.cabinetId, booking_id: p.bookingId ?? null, client_nom: p.clientNom?.trim() || null, client_email: email,
    historique, prochaine_relance_le: avisActif(ctx.cab) ? dans(DELAIS_RELANCE_JOURS[0]) : null,
  }).select("*").single();
  return data as DemandeAvis;
}

/** Tâche horaire : relances des demandes, clôture des demandes sans réponse, synchronisation quotidienne des avis. */
export async function tachesAvis() {
  const db = createAdminClient();
  const res = { avisRelances: 0, avisDemandesCloses: 0, avisSynchronises: 0 };
  const maintenant = new Date().toISOString();

  const { data: dues } = await db.from("demandes_avis").select("*").eq("statut", "en_cours").lte("prochaine_relance_le", maintenant).limit(200);
  for (const d of (dues ?? []) as (DemandeAvis & { cabinet_id: string })[]) {
    if (d.nb_relances >= MAX_RELANCES) {
      await db.from("demandes_avis").update({ statut: "terminee", prochaine_relance_le: null, updated_at: maintenant }).eq("id", d.id);
      res.avisDemandesCloses++;
      continue;
    }
    const ctx = await contexte(d.cabinet_id);
    if (!ctx || !avisActif(ctx.cab)) { await db.from("demandes_avis").update({ prochaine_relance_le: null }).eq("id", d.id); continue; }
    const envoye = await envoyerAuClient(ctx.cab, ctx.pro, d.client_email, d.client_nom, true);
    const n = d.nb_relances + 1;
    await db.from("demandes_avis").update({
      nb_relances: n, historique: [...(d.historique ?? []), { type: "relance", le: maintenant, envoye }],
      prochaine_relance_le: dans(n < MAX_RELANCES ? DELAIS_RELANCE_JOURS[n] : CLOTURE_JOURS), updated_at: maintenant,
    }).eq("id", d.id);
    res.avisRelances++;
  }

  // Avis Google : une synchronisation par jour pour les cabinets qui ont l'option.
  const hier = new Date(Date.now() - JOUR).toISOString();
  const { data: cabs } = await db.from("cabinets").select("id, offre_avis, offre_visibilite, google_synced_at")
    .or("offre_avis.eq.true,offre_visibilite.eq.true").or(`google_synced_at.is.null,google_synced_at.lt.${hier}`).limit(30);
  for (const c of cabs ?? []) {
    const r = await synchroniserAvis(c.id);
    if (r.ok) res.avisSynchronises++;
  }
  return res;
}
