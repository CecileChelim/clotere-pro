import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROFESSIONS } from "@/lib/professions-config";

/* E-mails liés au compte du cabinet (abonnement, visibilité), hors rendez-vous. */

export const esc = (s: string | null | undefined) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export type Titulaire = { id: string; email: string; prenom: string | null; profession: string | null };

export function pageMail(profession: string, titre: string, corps: string, cta: { href: string; label: string }) {
  const accent = profession === "comptable" ? "#146c43" : "#7c3aed";
  const brand = PROFESSIONS[profession === "comptable" ? "comptable" : "avocat"].brand;
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" style="background:#f3f4f6;padding:32px 12px"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
      <tr><td style="height:4px;background:${accent}"></td></tr>
      <tr><td style="padding:24px 32px 0;font-size:15px;font-weight:700;color:#111827">${esc(brand)}</td></tr>
      <tr><td style="padding:16px 32px 32px;color:#374151;font-size:15px;line-height:1.6">
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#111827">${titre}</h1>
        ${corps}
        <p style="margin:24px 0 0"><a href="${cta.href}" style="display:inline-block;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px;text-decoration:none;background:${accent};color:#ffffff">${cta.label}</a></p>
      </td></tr>
    </table>
    <p style="max-width:560px;margin:16px auto 0;color:#9ca3af;font-size:12px;text-align:center">${esc(brand)} · Clotere SAS</p>
  </td></tr></table></body></html>`;
}

export async function envoyerMailCompte(t: Titulaire, sujet: string, html: string, type: string) {
  const db = createAdminClient();
  let envoye = false, erreur: string | null = null;
  const key = process.env.BREVO_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: { name: PROFESSIONS[t.profession === "comptable" ? "comptable" : "avocat"].brand, email: process.env.EMAIL_FROM || "contact@clotere.fr" },
          to: [{ email: t.email }], subject: sujet, htmlContent: html,
        }),
      });
      envoye = res.ok;
      if (!res.ok) erreur = `Brevo ${res.status} : ${await res.text()}`;
    } catch (e) { erreur = String(e); }
  }
  await db.from("emails").insert({ booking_id: null, professional_id: t.id, destinataire: t.email, type, sujet, html, envoye, erreur });
  if (erreur) console.error("[email abonnement]", type, erreur);
}


export const urlEspace = (profession: string | null) =>
  process.env.NEXT_PUBLIC_SITE_URL || (profession === "comptable" ? "https://comptable.clotere.fr" : "https://avocat.clotere.fr");

/** Prévient l'équipe Clotere (ADMIN_EMAIL, sinon contact@clotere.fr). */
export async function prevenirClotere(sujet: string, html: string) {
  const key = process.env.BREVO_API_KEY;
  const to = process.env.ADMIN_EMAIL || "contact@clotere.fr";
  if (!key) { console.log("[admin]", sujet); return; }
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { name: "Clotere", email: process.env.EMAIL_FROM || "contact@clotere.fr" }, to: [{ email: to }], subject: sujet, htmlContent: html }),
    });
  } catch (e) { console.error("[admin]", e); }
}
