/* Grille tarifaire de l'abonnement de base du cabinet (hors options Visibilité / Avis).
   - Widget de prise de rdv seul : 69 € HT / mois / professionnel
   - Site + formulaire de contact : 69 € HT / mois
   - Site + prise de rdv + actualités : 99 € HT / mois (rdv du titulaire inclus ; 69 € par professionnel en plus)
   - Paiement annuel : -10 % */

export const PRIX = { widget: 69, siteContact: 69, siteRdv: 99 } as const;
export const REMISE_ANNUELLE = 0.1;

export type Periode = "mois" | "an";
export type LigneTarif = { code: "widget" | "site_contact" | "site_rdv" | "pro_supp"; libelle: string; prixMensuelHT: number; quantite: number };

type Modules = { offre_site?: boolean | null; offre_rdv?: boolean | null };

export function lignesTarif(c: Modules | null | undefined, nbPros: number): LigneTarif[] {
  const nb = Math.max(1, nbPros);
  if (c?.offre_site) {
    if (c.offre_rdv === false) return [{ code: "site_contact", libelle: "Site internet + formulaire de contact", prixMensuelHT: PRIX.siteContact, quantite: 1 }];
    const lignes: LigneTarif[] = [{ code: "site_rdv", libelle: "Site internet + prise de rendez-vous en ligne", prixMensuelHT: PRIX.siteRdv, quantite: 1 }];
    if (nb > 1) lignes.push({ code: "pro_supp", libelle: "Prise de rendez-vous · professionnel supplémentaire", prixMensuelHT: PRIX.widget, quantite: nb - 1 });
    return lignes;
  }
  return [{ code: "widget", libelle: "Prise de rendez-vous en ligne", prixMensuelHT: PRIX.widget, quantite: nb }];
}

export const totalMensuel = (l: LigneTarif[]) => l.reduce((s, x) => s + x.prixMensuelHT * x.quantite, 0);

/** Prix unitaire facturé pour une période (annuel : 12 mois remisés de 10 %, arrondi à l'euro). */
export const prixPeriode = (mensuel: number, p: Periode) => (p === "an" ? Math.round(mensuel * 12 * (1 - REMISE_ANNUELLE)) : mensuel);

export const libelleFormule = (c: Modules | null | undefined) =>
  c?.offre_site ? (c.offre_rdv === false ? "Site internet · formulaire de contact" : "Site internet · prise de rendez-vous") : "Prise de rendez-vous en ligne";
