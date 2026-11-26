import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoutonStripe } from "@/components/dashboard/AbonnementActions";
import { etatAbonnement } from "@/lib/abonnement";
import { PRIX, libelleFormule, lignesTarif, prixPeriode, totalMensuel } from "@/lib/tarifs";
import { ApportAffaires } from "@/components/dashboard/ApportAffaires";
import { ActiverOption } from "@/components/options/ActiverOption";
import { prixSite } from "@/lib/options";

export default async function AbonnementPage({ searchParams }: { searchParams: Promise<{ paiement?: string; activation?: string }> }) {
  const { paiement, activation } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/abonnement");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: pro } = await db.from("professionals").select("cabinet_id, role").eq("auth_user_id", user.id).maybeSingle();
  const { data: cab } = pro?.cabinet_id
    ? await db.from("cabinets").select("*").eq("id", pro.cabinet_id).maybeSingle()
    : { data: null };
  const { count } = pro?.cabinet_id ? await db.from("professionals").select("id", { count: "exact", head: true }).eq("cabinet_id", pro.cabinet_id) : { count: 1 };
  // Formule page : l'apport d'affaires à la performance, et le widget de prise de rdv s'il est souscrit (ou proposé).
  if (cab?.page_seule) {
    const widget = !!cab.offre_widget;
    // Chaque offre a son propre abonnement Stripe : le portail permet de résilier l'une sans l'autre.
    const gerer = pro?.role !== "membre" ? <BoutonStripe action="portal" className="btn-outline">Gérer ou résilier</BoutonStripe> : null;
    const Ligne = ({ nom, statut, detail, action }: { nom: string; statut: string; detail: string; action: React.ReactNode }) => (
      <div className="flex flex-wrap items-start justify-between gap-4 py-5 first:pt-0 last:pb-0">
        <div>
          <p className="text-sm text-gray-500">{nom}</p>
          <p className="mt-1 text-2xl font-medium text-gray-950">{statut}</p>
          <p className="mt-1 text-sm text-gray-600">{detail}</p>
        </div>
        {action}
      </div>
    );
    const carteWidget = (
      <div className="card mt-8 divide-y divide-gray-100 p-6 sm:p-8">
        {paiement === "ok" && (
          <p className="mb-5 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
            ✓ Merci ! Votre paiement est enregistré. Il peut falloir quelques secondes pour qu&apos;il apparaisse ci-dessous.
          </p>
        )}
        <Ligne nom="Widget de prise de rendez-vous" statut={widget ? "Actif" : "Non souscrit"}
          detail={`${PRIX.widget} € HT / mois par professionnel · site internet, fiche Google, LinkedIn, signature e-mail · sans engagement.`}
          action={widget ? gerer : <a href="/dashboard/widget" className="btn-solid">Activer le widget</a>} />
        <Ligne nom="Site internet" statut={!cab.offre_site ? "Non créé" : cab.site_paye ? "En ligne" : "En attente de paiement"}
          detail={cab.offre_site
            ? `${prixSite(cab)} € HT / mois · ${cab.offre_rdv === false ? "formulaire de contact" : "prise de rendez-vous et actualités"} · sans engagement.`
            : `Votre site en 10 minutes, à partir de ${PRIX.siteContact} € HT / mois, payé à sa mise en ligne.`}
          action={!cab.offre_site ? <a href="/dashboard/site" className="btn-solid">Créer mon site</a>
            : cab.site_paye ? gerer
            : <ActiverOption option="site" label="Payer et mettre en ligne" className="btn-solid" />} />
      </div>
    );
    return <ApportAffaires activation={activation} retour="/dashboard/abonnement" extra={carteWidget} />;
  }
  const e = etatAbonnement(cab);
  const nb = Math.max(1, count ?? 1);
  const lignes = lignesTarif(cab, nb);
  const mensuel = totalMensuel(lignes);
  const annuel = prixPeriode(mensuel, "an");
  const auMois = cab?.abonnement_periode !== "an";
  const titulaire = pro?.role !== "membre";
  const debutEssai = cab?.trial_ends_at ? new Date(new Date(cab.trial_ends_at).getTime() - 7 * 86400000).toISOString() : null;
  const essaiPreserve = !!cab?.trial_ends_at && new Date(cab.trial_ends_at).getTime() - Date.now() > 48 * 3600e3;
  const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "");

  return (
    <div>
      <p className="eyebrow">Abonnement</p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight text-gray-950">Votre abonnement</h1>

      {paiement === "ok" && (
        <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          ✓ Merci ! Votre abonnement est enregistré. Il peut falloir quelques secondes pour qu&apos;il apparaisse ci-dessous.
        </p>
      )}

      {!cab ? (
        <div className="card mt-8 p-6 sm:p-8">
          <p className="text-[15px] text-gray-700">Votre cabinet n&apos;est pas encore enregistré : terminez votre inscription pour démarrer votre essai gratuit.</p>
          <a href="/inscription" className="btn-solid mt-5">Terminer mon inscription</a>
        </div>
      ) : (
      <div className="card mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Statut</p>
            <p className="mt-1 text-2xl font-medium text-gray-950">
              {cab.subscription_status === "actif" ? "Abonnement actif"
                : cab.subscription_status === "impayé" ? "Paiement en échec"
                : e.essai ? `Essai gratuit · ${e.joursRestants} jour${e.joursRestants > 1 ? "s" : ""} restant${e.joursRestants > 1 ? "s" : ""}`
                : "Essai terminé"}
            </p>
            {e.essai && cab.subscription_status !== "actif" && (
              <p className="mt-1 text-sm text-gray-600">Démarré à votre inscription le {date(debutEssai)}, jusqu&apos;au {date(cab.trial_ends_at)} inclus.</p>
            )}
            {!e.essai && !e.actif && <p className="mt-1 text-sm text-gray-600">Terminé le {date(cab.trial_ends_at)} : {cab.offre_site ? "votre site est hors ligne" : "votre page de prise de rendez-vous est en pause"}.</p>}
            {cab.subscription_status === "actif" && cab.abonnement_fin_periode && <p className="mt-1 text-sm text-gray-600">Prochaine échéance le {date(cab.abonnement_fin_periode)}.</p>}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Tarif</p>
            {auMois || cab.subscription_status !== "actif"
              ? <p className="mt-1 text-2xl font-medium text-gray-950">{mensuel} € <span className="text-sm font-normal text-gray-500">HT / mois</span></p>
              : <p className="mt-1 text-2xl font-medium text-gray-950">{annuel} € <span className="text-sm font-normal text-gray-500">HT / an</span></p>}
            <p className="text-sm text-gray-500">{libelleFormule(cab)}</p>
            {lignes.map((l) => <p key={l.code} className="text-xs text-gray-400">{l.libelle} : {l.prixMensuelHT} €{l.quantite > 1 ? ` × ${l.quantite}` : ""}</p>)}
          </div>
        </div>

        {e.essai && cab.subscription_status !== "actif" && (
          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-violet-600" style={{ width: `${Math.min(100, Math.max(4, ((7 - e.joursRestants) / 7) * 100))}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-gray-500"><span>Inscription</span><span>Fin de l&apos;essai · {date(cab.trial_ends_at)}</span></div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-100 pt-6">
          {!titulaire ? (
            <p className="text-sm text-gray-600">L&apos;abonnement est géré par le titulaire du compte cabinet.</p>
          ) : cab.stripe_customer_id && cab.subscription_status !== "résilié" && cab.subscription_status !== "essai" ? (
            <BoutonStripe action="portal">Gérer l&apos;abonnement et les factures</BoutonStripe>
          ) : e.essai ? (
            <>
              <div className="flex flex-wrap gap-3">
                <BoutonStripe action="checkout" corps={{ periode: "mois" }}>Payer au mois · {mensuel} € HT</BoutonStripe>
                <BoutonStripe action="checkout" corps={{ periode: "an" }} className="btn-outline disabled:opacity-50">Payer à l&apos;année · {annuel} € HT (-10 %)</BoutonStripe>
              </div>
              <p className="mt-3 max-w-xl text-sm text-gray-500">
                {essaiPreserve
                  ? <>Votre essai continue : aucun prélèvement avant le {date(cab.trial_ends_at)}. Ensuite {mensuel} € HT par mois (ou {annuel} € HT par an), sans engagement.</>
                  : <>Votre essai se termine dans moins de 48 h : la première échéance est prélevée à la validation. Sans engagement.</>}
              </p>
              <p className="mt-2 max-w-xl text-sm text-gray-500">Sans carte à la fin de l&apos;essai, {cab.offre_site ? "votre site est mis hors ligne" : "votre page de rendez-vous est mise en pause"}. Vous recevrez un rappel par e-mail 2 jours avant.</p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-3">
                <BoutonStripe action="checkout" corps={{ periode: "mois" }}>{cab.offre_site ? "Remettre mon site en ligne" : "Réactiver la prise de rendez-vous"} · {mensuel} € HT / mois</BoutonStripe>
                <BoutonStripe action="checkout" corps={{ periode: "an" }} className="btn-outline disabled:opacity-50">À l&apos;année · {annuel} € HT (-10 %)</BoutonStripe>
              </div>
              <p className="mt-3 text-sm text-gray-500">Prélevé dès aujourd&apos;hui. Sans engagement, résiliable à tout moment.</p>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
