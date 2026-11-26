export type EtatAbonnement = { actif: boolean; essai: boolean; joursRestants: number; statut: string };

/** Le cabinet peut-il recevoir des rendez-vous ? Essai de 7 jours, puis abonnement Stripe actif. */
export function etatAbonnement(c: { subscription_status?: string | null; trial_ends_at?: string | null } | null | undefined): EtatAbonnement {
  const statut = c?.subscription_status ?? "essai";
  const fin = c?.trial_ends_at ? new Date(c.trial_ends_at).getTime() : 0;
  const joursRestants = Math.max(0, Math.ceil((fin - Date.now()) / 86400000));
  if (statut === "actif") return { actif: true, essai: false, joursRestants, statut };
  const essai = fin > Date.now();
  return { actif: essai, essai, joursRestants, statut };
}

export const PRIX_MENSUEL_HT = 69;

type CabAcces = { subscription_status?: string | null; trial_ends_at?: string | null; page_seule?: boolean | null; offre_widget?: boolean | null; site_paye?: boolean | null; offre_site?: boolean | null; offre_rdv?: boolean | null };

/** Site en ligne : abonnement de base actif, ou (formule page) abonnement « site » payé. */
export const siteEnLigne = (c: CabAcces | null | undefined) => !!c?.offre_site && (c?.page_seule ? !!c.site_paye : etatAbonnement(c).actif);

/** Prise de rdv directe (widget, site, lien) : abonnement de base actif, ou (formule page) widget payé ou site avec rdv payé. */
export const rdvDirectOuvert = (c: CabAcces | null | undefined) =>
  c?.page_seule ? !!(c.offre_widget || (c.site_paye && c.offre_rdv !== false)) : etatAbonnement(c).actif;
