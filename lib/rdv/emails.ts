import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDateHeure, MODE_LABEL } from "./format";
import { adresseCabinet, libelleMotif, marque, nomClient, nomPro, type RdvComplet } from "./load";

/* ------------------------------------------------------------------ */
/* Envoi : Brevo si BREVO_API_KEY est défini, sinon simple journal.    */
/* ------------------------------------------------------------------ */
type Envoi = { to: string; sujet: string; html: string; type: string; rdv: RdvComplet; ics?: string };

export async function envoyer({ to, sujet, html, type, rdv, ics }: Envoi) {
  const db = createAdminClient();
  let envoye = false;
  let erreur: string | null = null;
  const key = process.env.BREVO_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: { name: process.env.EMAIL_FROM_NAME || marque(rdv), email: process.env.EMAIL_FROM || "contact@clotere.fr" },
          to: [{ email: to }],
          subject: sujet,
          htmlContent: html,
          ...(ics ? { attachment: [{ name: "rendez-vous.ics", content: Buffer.from(ics).toString("base64") }] } : {}),
        }),
      });
      envoye = res.ok;
      if (!res.ok) erreur = `Brevo ${res.status} : ${await res.text()}`;
    } catch (e) {
      erreur = String(e);
    }
  }
  const { error: e } = await db.from("emails").insert({ booking_id: rdv.id, professional_id: rdv.pro.id, destinataire: to, type, sujet, html, envoye, erreur });
  if (e) console.error("[email] journal impossible :", e.message);
  if (erreur) console.error("[email]", type, erreur);
}

/* ------------------------------------------------------------------ */
/* Mise en page commune                                               */
/* ------------------------------------------------------------------ */
// Couleur d'accent écrite en violet dans les fragments ; layout() la convertit en vert pour Comptelio.
const ACCENT = "#7c3aed";

const esc = (s: string | null | undefined) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const nl2br = (s: string) => esc(s).replace(/\n/g, "<br>");

function bouton(href: string, label: string, secondaire = false) {
  return `<a href="${href}" style="display:inline-block;margin:6px 8px 6px 0;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px;text-decoration:none;${
    secondaire ? "background:#ffffff;color:#111827;border:1px solid #d1d5db" : "background:${ACCENT};color:#ffffff"}">${label}</a>`;
}

function recap(r: RdvComplet, debut = r.creneau_debut) {
  const lignes = [
    ["Date", fmtDateHeure(debut)],
    ["Format", MODE_LABEL[r.mode ?? r.type_rdv] ?? r.type_rdv],
    ["Motif", libelleMotif(r)],
    ...(r.mode === "cabinet" && adresseCabinet(r) ? [["Adresse", adresseCabinet(r)]] : []),
  ];
  return `<table role="presentation" style="width:100%;border-collapse:collapse;margin:18px 0;background:#f5f3ff;border-radius:12px">
    ${lignes.map(([k, v]) => `<tr><td style="padding:10px 16px;color:#6b7280;font-size:14px;width:90px">${k}</td><td style="padding:10px 16px;color:#111827;font-size:14px;font-weight:600">${esc(v)}</td></tr>`).join("")}
  </table>`;
}

function layout(r: RdvComplet, titre: string, corps: string) {
  const vert = (html: string) => (r.pro.profession === "comptable" ? html.replaceAll("#7c3aed", "#146c43").replaceAll("#f5f3ff", "#eef6f1") : html);
  const cab = r.pro.cabinet?.nom || nomPro(r);
  return vert(`<!doctype html><html lang="fr"><body style="margin:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" style="background:#f3f4f6;padding:32px 12px"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr><td style="height:4px;background:${ACCENT}"></td></tr>
      <tr><td style="padding:24px 32px 0;font-size:15px;font-weight:700;color:#111827">${esc(cab)}</td></tr>
      <tr><td style="padding:16px 32px 32px;color:#374151;font-size:15px;line-height:1.6">
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#111827">${titre}</h1>
        ${corps}
      </td></tr>
    </table>
    <p style="max-width:560px;margin:16px auto 0;color:#9ca3af;font-size:12px;line-height:1.5;text-align:center">
      Prise de rendez-vous propulsée par ${esc(marque(r))}. Vos données sont chiffrées et transmises uniquement à ${esc(cab)}.
    </p>
  </td></tr></table></body></html>`);
}

const bonjour = (prenom: string | null, nom: string) => `<p>Bonjour ${esc(prenom || nom)},</p>`;
const citation = (txt: string) =>
  `<div style="margin:18px 0;padding:16px 18px;border-left:3px solid ${ACCENT};background:#fafafa;border-radius:8px;color:#111827">${nl2br(txt)}</div>`;

/* ------------------------------------------------------------------ */
/* Modèles                                                             */
/* ------------------------------------------------------------------ */
type Liens = { suivi: string; gerer: string; reserver: string };

export const mails = {
  /** Client — demande reçue, en attente de validation. */
  demandeClient: (r: RdvComplet, l: Liens) => ({
    sujet: `Votre demande de rendez-vous avec ${nomPro(r)} est bien reçue`,
    html: layout(r, "Votre demande est en cours de validation", `${bonjour(r.client_prenom, r.client_nom)}
      <p>Votre demande de rendez-vous a bien été transmise à <strong>${esc(nomPro(r))}</strong>. Le rendez-vous n'est pas encore confirmé : vous recevrez un email dès sa validation, en général sous 24 h ouvrées.</p>
      ${recap(r)}
      ${bouton(l.suivi, "Suivre mon rendez-vous")}
      <p style="font-size:13px;color:#6b7280">Un empêchement ? Vous pouvez annuler depuis la page de suivi.</p>`),
  }),

  /** Pro — nouvelle demande à traiter. */
  demandePro: (r: RdvComplet, l: Liens) => ({
    sujet: `Nouvelle demande de rendez-vous : ${nomClient(r)} — ${fmtDateHeure(r.creneau_debut)}`,
    html: layout(r, "Nouvelle demande de rendez-vous", `<p><strong>${esc(nomClient(r))}</strong> souhaite un rendez-vous${r.suivi_existant ? " (client existant)" : ""}.</p>
      ${recap(r)}
      ${r.deja_avocat ? `<p style="font-size:14px"><strong>Déjà un ${r.pro.profession === "avocat" ? "avocat" : "expert-comptable"} ?</strong> ${esc({ non: "Non, pas encore", oui: "Oui", changer: "Oui, mais souhaite en changer" }[r.deja_avocat] ?? r.deja_avocat)}</p>` : ""}
      ${r.message ? citation(r.message) : ""}
      <p style="font-size:14px">${esc(r.client_email)}${r.client_tel ? ` · ${esc(r.client_tel)}` : ""}</p>
      ${bouton(l.gerer, "Gérer la demande")}
      <p style="font-size:13px;color:#6b7280">Validez, refusez ou proposez d'autres créneaux en un clic, sans vous connecter.</p>`),
  }),

  /** Client — rendez-vous confirmé (+ message de l'avocat). */
  confirmeClient: (r: RdvComplet, l: Liens) => ({
    sujet: `Rendez-vous confirmé avec ${nomPro(r)} — ${fmtDateHeure(r.creneau_debut)}`,
    html: layout(r, "Votre rendez-vous est confirmé ✓", `${bonjour(r.client_prenom, r.client_nom)}
      <p><strong>${esc(nomPro(r))}</strong> a confirmé votre rendez-vous.</p>
      ${recap(r)}
      ${r.message_pro ? `<p style="margin-bottom:0"><strong>Message de ${esc(nomPro(r))} :</strong></p>${citation(r.message_pro)}` : ""}
      ${r.mode === "visio" ? (r.visio_url
        ? `<p style="font-size:14px"><strong>Lien de la visioconférence :</strong><br><a href="${r.visio_url}" style="color:${ACCENT}">${esc(r.visio_url)}</a></p>`
        : `<p style="font-size:14px">Le lien de visioconférence vous sera communiqué par le cabinet avant le rendez-vous.</p>`) : ""}
      ${r.mode === "telephone" ? `<p style="font-size:14px">${esc(nomPro(r))} vous appellera au ${esc(r.client_tel)} à l'heure prévue.</p>` : ""}
      ${bouton(l.suivi, "Voir mon rendez-vous")}
      <p style="font-size:13px;color:#6b7280">L'invitation est jointe à cet email pour l'ajouter à votre agenda. Annulation possible jusqu'à 24 h avant depuis la page de suivi.</p>`),
  }),

  /** Client — créneau refusé. */
  refuseClient: (r: RdvComplet, l: Liens) => ({
    sujet: `Votre demande de rendez-vous avec ${nomPro(r)}`,
    html: layout(r, "Ce créneau n'est malheureusement pas disponible", `${bonjour(r.client_prenom, r.client_nom)}
      <p>${esc(nomPro(r))} ne peut pas vous recevoir le ${esc(fmtDateHeure(r.creneau_debut))}.</p>
      ${r.message_pro ? citation(r.message_pro) : ""}
      <p>Vous pouvez choisir un autre créneau en ligne :</p>
      ${bouton(l.reserver, "Choisir un autre créneau")}`),
  }),

  /** Client — 3 créneaux proposés. */
  proposeClient: (r: RdvComplet, l: Liens) => ({
    sujet: `${nomPro(r)} vous propose d'autres créneaux`,
    html: layout(r, "Choisissez un nouveau créneau", `${bonjour(r.client_prenom, r.client_nom)}
      <p>${esc(nomPro(r))} n'est pas disponible le ${esc(fmtDateHeure(r.creneau_debut))} et vous propose les créneaux suivants :</p>
      <ul style="padding-left:18px">${(r.creneaux_proposes ?? []).map((c) => `<li style="margin:4px 0"><strong>${esc(fmtDateHeure(c.debut))}</strong></li>`).join("")}</ul>
      ${r.message_pro ? citation(r.message_pro) : ""}
      ${bouton(l.suivi, "Choisir mon créneau")}
      <p style="font-size:13px;color:#6b7280">Un clic sur le créneau qui vous convient suffit à confirmer le rendez-vous.</p>`),
  }),

  /** Pro — le client a choisi un créneau proposé. */
  choixPro: (r: RdvComplet, l: Liens) => ({
    sujet: `${nomClient(r)} a choisi un créneau — ${fmtDateHeure(r.creneau_debut)}`,
    html: layout(r, "Rendez-vous confirmé", `<p><strong>${esc(nomClient(r))}</strong> a choisi l'un des créneaux que vous avez proposés. Le rendez-vous est confirmé.</p>
      ${recap(r)}${bouton(l.gerer, "Voir le rendez-vous")}`),
  }),

  /** Annulation — envoyé à l'autre partie. */
  annuleClient: (r: RdvComplet, l: Liens, par: "pro" | "auto") => ({
    sujet: `Rendez-vous annulé avec ${nomPro(r)}`,
    html: layout(r, "Votre rendez-vous est annulé", `${bonjour(r.client_prenom, r.client_nom)}
      <p>${par === "auto"
        ? `Votre demande de rendez-vous n'a pas pu être traitée à temps par ${esc(nomPro(r))}. Nous sommes désolés.`
        : `${esc(nomPro(r))} a annulé votre rendez-vous du ${esc(fmtDateHeure(r.creneau_debut))}.`}</p>
      ${r.message_pro && par === "pro" ? citation(r.message_pro) : ""}
      ${bouton(l.reserver, "Reprendre rendez-vous")}`),
  }),
  annulePro: (r: RdvComplet, l: Liens) => ({
    sujet: `Annulation : ${nomClient(r)} — ${fmtDateHeure(r.creneau_debut)}`,
    html: layout(r, "Un client a annulé son rendez-vous", `<p><strong>${esc(nomClient(r))}</strong> a annulé son rendez-vous. Le créneau est de nouveau disponible.</p>
      ${r.annulation_raison ? `<p style="font-size:14px"><strong>Raison :</strong> ${esc(({ plus_besoin: "N'en a plus besoin", imprevu: "Un imprévu", autre_pro: "A trouvé quelqu'un d'autre", autre: "Autre raison" } as Record<string, string>)[r.annulation_raison] ?? r.annulation_raison)}</p>` : ""}
      ${recap(r)}${bouton(l.gerer, "Voir la demande", true)}`),
  }),

  /** Pro — relance (demande sans réponse depuis 24 h). */
  relancePro: (r: RdvComplet, l: Liens) => ({
    sujet: `Rappel : ${nomClient(r)} attend votre réponse`,
    html: layout(r, "Une demande attend votre réponse", `<p>La demande de <strong>${esc(nomClient(r))}</strong> n'a pas encore été traitée. Sans réponse sous 48 h, elle sera automatiquement annulée.</p>
      ${recap(r)}${bouton(l.gerer, "Gérer la demande")}`),
  }),

  /** Rappel la veille. */
  rappelClient: (r: RdvComplet, l: Liens) => ({
    sujet: `Rappel : votre rendez-vous demain avec ${nomPro(r)}`,
    html: layout(r, "Votre rendez-vous, c'est demain", `${bonjour(r.client_prenom, r.client_nom)}${recap(r)}${bouton(l.suivi, "Voir mon rendez-vous")}`),
  }),
  rappelPro: (r: RdvComplet, l: Liens) => ({
    sujet: `Demain : ${nomClient(r)} — ${fmtDateHeure(r.creneau_debut)}`,
    html: layout(r, "Rendez-vous de demain", `<p>Rendez-vous avec <strong>${esc(nomClient(r))}</strong>.</p>${recap(r)}${r.message ? citation(r.message) : ""}${bouton(l.gerer, "Voir le rendez-vous", true)}`),
  }),
};

export function liens(r: RdvComplet, base: string): Liens {
  return { suivi: `${base}/suivi/${r.token_client}`, gerer: `${base}/gestion/${r.token_pro}`, reserver: `${base}/rdv/${r.pro.slug}` };
}
