/* Adresses d'envoi des e-mails (domaine clotere.fr authentifié dans Brevo).
   - avocat@clotere.fr / comptable@clotere.fr selon le métier (modifiables via EMAIL_FROM_AVOCAT / EMAIL_FROM_COMPTABLE)
   - les réponses des pros arrivent chez Clotere (ADMIN_EMAIL, sinon contact@clotere.fr) */

export const adresseClotere = () => process.env.ADMIN_EMAIL || "contact@clotere.fr";

export function adresseMetier(profession: string | null | undefined) {
  return profession === "comptable"
    ? process.env.EMAIL_FROM_COMPTABLE || "comptable@clotere.fr"
    : process.env.EMAIL_FROM_AVOCAT || "avocat@clotere.fr";
}

/** Nom affiché pour un e-mail envoyé à un client au nom d'un cabinet (78 caractères max chez la plupart des messageries). */
export const nomViaClotere = (cabinet: string) => `${cabinet.slice(0, 60)} via Clotere`;
