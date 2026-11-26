import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { EnTetePage } from "@/components/dashboard/EnTetePage";
import { LeadsActivation, LeadsSuivi, type LeadLigne } from "@/components/dashboard/Leads";
import { debutMois, ilYa, prixLead, DELAI_CONTESTATION_H, STATUTS_FACTURABLES } from "@/lib/leads";
import { slugify } from "@/lib/slug";

/** Lien public de la page clotere.fr d'un pro (sans https://). */
export const lienFiche = (pro: { profession?: string | null; prenom?: string | null; nom?: string | null }) =>
  `clotere.fr/${pro.profession === "comptable" ? "comptable" : "avocat"}/${slugify(`${pro.prenom ?? ""} ${pro.nom ?? ""}`)}`;

/* Apport d'affaires : rendez-vous pris depuis la page clotere.fr, facturés à l'unité.
   Affiché dans « Apport d'affaires » (cabinets abonnés) et dans « Abonnement » (formule page). */
export async function ApportAffaires({ activation, bienvenue, retour, extra }: { activation?: string; bienvenue?: string; retour: string; extra?: React.ReactNode }) {
  const ctx = await cabinetConnecte();
  if (!ctx) redirect(`/login?next=${retour}`);
  const { cab, pro } = ctx;
  const profession = pro.profession === "comptable" ? "comptable" : "avocat";
  const prix = prixLead(profession);
  const titulaire = pro.role !== "membre";
  const fiche = lienFiche(pro);
  const section = cab.page_seule ? "Abonnement" : "Apport d'affaires";

  // Carte pas encore enregistrée : activation (abonnés) ou, en formule page, page déjà en ligne et carte demandée
  // pour consulter les demandes reçues.
  if (!cab.leads_carte_at) {
    const { count: enAttente } = cab.page_seule
      ? await createAdminClient().from("leads").select("id", { count: "exact", head: true }).eq("cabinet_id", cab.id).in("statut", STATUTS_FACTURABLES)
      : { count: 0 };
    return (
      <div>
        {cab.page_seule && !!enAttente && (
          <div className="mb-6 rounded-2xl bg-violet-50 px-5 py-4 text-sm text-violet-900 ring-1 ring-violet-200">
            <strong>Vous avez {enAttente} demande{enAttente > 1 ? "s" : ""} de rendez-vous en attente.</strong> Ajoutez votre carte pour {enAttente > 1 ? "les" : "la"} consulter et répondre au client. Sans carte sous 48 h, la prise de rendez-vous se met en pause sur votre page.
          </div>
        )}
        {cab.page_seule && !enAttente && (
          <div className="mb-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
            <strong>{bienvenue ? "Votre page est créée et en ligne." : "Votre page est en ligne."}</strong> Les clients peuvent déjà réserver depuis {fiche}.
            Vous ajouterez votre carte à la première demande reçue.
          </div>
        )}
        <EnTetePage section={section} titre={cab.page_seule ? "Apport d'affaires à la performance" : "Recevez des clients depuis Clotere"} />
        <LeadsActivation prix={prix} fiche={fiche} titulaire={titulaire} profession={profession} delaiH={DELAI_CONTESTATION_H} abonne={cab.subscription_status === "actif"} pageSeule={!!cab.page_seule} />
        {extra}
      </div>
    );
  }

  const depuis = ilYa(92);
  const { data: leads } = await createAdminClient().from("leads")
    .select("id, statut, client_label, motif, creneau_debut, contestable_jusqu, montant_ht_cents, raison, created_at")
    .eq("cabinet_id", cab.id).gte("created_at", depuis).order("created_at", { ascending: false }).limit(300);
  const lignes = (leads ?? []) as LeadLigne[];
  const duMois = lignes.filter((l) => l.created_at >= debutMois());
  const facturables = duMois.filter((l) => STATUTS_FACTURABLES.includes(l.statut));

  return (
    <div>
      {activation === "ok" && (
        <div className="mb-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
          <strong>C&apos;est activé.</strong> Votre fiche {fiche} accepte maintenant les demandes de rendez-vous. Il peut falloir quelques secondes pour que l&apos;activation apparaisse.
        </div>
      )}
      <EnTetePage section={section} titre="Rendez-vous apportés par Clotere"
        cta={cab.page_seule ? undefined : <a href={`https://${fiche}`} target="_blank" rel="noopener" className="btn-solid">Voir ma fiche ↗</a>} />
      <LeadsSuivi
        leads={lignes} titulaire={titulaire} prix={prix}
        mois={{ recus: duMois.length, facturables: facturables.length, nonFactures: duMois.length - facturables.length, montant: facturables.reduce((s, l) => s + l.montant_ht_cents, 0) / 100 }}
        reglages={{ actifs: !!cab.leads_actifs, ouverts: !!cab.leads_ouverts, plafond: cab.leads_plafond ?? null }}
      />
      {extra}
    </div>
  );
}
