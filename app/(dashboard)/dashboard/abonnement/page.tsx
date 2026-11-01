import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoutonStripe } from "@/components/dashboard/AbonnementActions";
import { etatAbonnement, PRIX_MENSUEL_HT } from "@/lib/abonnement";

export default async function AbonnementPage({ searchParams }: { searchParams: Promise<{ paiement?: string }> }) {
  const { paiement } = await searchParams;
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
  const e = etatAbonnement(cab);
  const nb = cab?.abonnement_quantite ?? Math.max(1, count ?? 1);
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
            {!e.essai && !e.actif && <p className="mt-1 text-sm text-gray-600">Terminé le {date(cab.trial_ends_at)} : votre page de prise de rendez-vous est en pause.</p>}
            {cab.subscription_status === "actif" && cab.abonnement_fin_periode && <p className="mt-1 text-sm text-gray-600">Prochaine échéance le {date(cab.abonnement_fin_periode)}.</p>}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Tarif</p>
            <p className="mt-1 text-2xl font-medium text-gray-950">{PRIX_MENSUEL_HT * nb} € <span className="text-sm font-normal text-gray-500">HT / mois</span></p>
            <p className="text-sm text-gray-500">{PRIX_MENSUEL_HT} € × {nb} professionnel{nb > 1 ? "s" : ""}</p>
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
              <BoutonStripe action="checkout">Ajouter ma carte bancaire</BoutonStripe>
              <p className="mt-3 max-w-xl text-sm text-gray-500">
                {essaiPreserve
                  ? <>Votre essai continue : aucun prélèvement avant le {date(cab.trial_ends_at)}. Ensuite {PRIX_MENSUEL_HT * nb} € HT par mois, sans engagement.</>
                  : <>Votre essai se termine dans moins de 48 h : le premier mois ({PRIX_MENSUEL_HT * nb} € HT) est prélevé à la validation. Sans engagement.</>}
              </p>
              <p className="mt-2 max-w-xl text-sm text-gray-500">Sans carte à la fin de l&apos;essai, votre page de rendez-vous est mise en pause. Vous recevrez un rappel par e-mail 2 jours avant.</p>
            </>
          ) : (
            <>
              <BoutonStripe action="checkout">Réactiver la prise de rendez-vous</BoutonStripe>
              <p className="mt-3 text-sm text-gray-500">{PRIX_MENSUEL_HT * nb} € HT par mois, prélevé dès aujourd&apos;hui. Sans engagement, résiliable à tout moment.</p>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
