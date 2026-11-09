import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/* ------------------------------------------------------------------ */
/* Envoi de TOUS les e-mails transactionnels de clotere-pro.           */
/* - Google Workspace (SMTP Gmail) par défaut : compte GMAIL_USER       */
/*   (cecile@clotere.fr) + mot de passe d'application GMAIL_PASS.       */
/* - Adresse d'expédition : EMAIL_FROM (défaut contact@clotere.fr).     */
/*   contact@ doit être un alias « Envoyer des e-mails en tant que »    */
/*   du Gmail de GMAIL_USER ; sinon Google remplace automatiquement     */
/*   l'expéditeur par GMAIL_USER : l'e-mail part quand même.            */
/* - Le nom affiché (« Cabinet X via Clotere », marque du métier…) est  */
/*   conservé ; seule l'adresse est forcée.                             */
/* - Brevo seulement si MAIL_PROVIDER=brevo (et BREVO_API_KEY défini).  */
/* ------------------------------------------------------------------ */

type Adresse = { email: string; name?: string };
export type Mail = {
  nomExpediteur: string;
  to: string | Adresse;
  replyTo?: Adresse;
  sujet: string;
  html: string;
  pieces?: { nom: string; contenu: string | Buffer }[];
};

let transport: Transporter | null = null;
function google() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });
  }
  return transport;
}

export const mailConfigure = () =>
  (process.env.MAIL_PROVIDER === "brevo" && !!process.env.BREVO_API_KEY) || (!!process.env.GMAIL_USER && !!process.env.GMAIL_PASS);

const adresseEnvoi = () => process.env.EMAIL_FROM || "contact@clotere.fr";

/** Envoie l'e-mail. Renvoie { envoye, erreur } (ne lève jamais d'exception). */
export async function envoyerMail(m: Mail): Promise<{ envoye: boolean; erreur: string | null }> {
  const to: Adresse = typeof m.to === "string" ? { email: m.to } : m.to;
  try {
    if (process.env.MAIL_PROVIDER === "brevo" && process.env.BREVO_API_KEY) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: { name: m.nomExpediteur, email: process.env.EMAIL_FROM_BREVO || adresseEnvoi() },
          ...(m.replyTo ? { replyTo: m.replyTo } : {}),
          to: [to],
          subject: m.sujet,
          htmlContent: m.html,
          ...(m.pieces?.length
            ? { attachment: m.pieces.map((p) => ({ name: p.nom, content: Buffer.from(p.contenu).toString("base64") })) }
            : {}),
        }),
      });
      return res.ok ? { envoye: true, erreur: null } : { envoye: false, erreur: `Brevo ${res.status} : ${await res.text()}` };
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.log("[mail] non configuré (GMAIL_USER / GMAIL_PASS manquants) :", to.email, m.sujet);
      return { envoye: false, erreur: null };
    }
    await google().sendMail({
      from: { name: m.nomExpediteur, address: adresseEnvoi() },
      to: to.name ? { name: to.name, address: to.email } : to.email,
      ...(m.replyTo ? { replyTo: m.replyTo.name ? { name: m.replyTo.name, address: m.replyTo.email } : m.replyTo.email } : {}),
      subject: m.sujet,
      html: m.html,
      ...(m.pieces?.length ? { attachments: m.pieces.map((p) => ({ filename: p.nom, content: p.contenu })) } : {}),
    });
    return { envoye: true, erreur: null };
  } catch (e) {
    return { envoye: false, erreur: `Google SMTP : ${e instanceof Error ? e.message : String(e)}` };
  }
}
