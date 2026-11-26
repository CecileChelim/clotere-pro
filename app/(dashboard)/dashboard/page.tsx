import { lienAvisGoogle } from "@/lib/google";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LienResa } from "@/components/dashboard/LienResa";
import { createClient } from "@/lib/supabase/server";
import { AgendaSyncBanner } from "@/components/dashboard/AgendaSyncBanner";
import { BookingsList, type Booking } from "@/components/pro/BookingsList";
import { EnTetePage } from "@/components/dashboard/EnTetePage";
import { RdvPresentation } from "@/components/mon-site/Upsells";
import { lienFiche } from "@/components/dashboard/ApportAffaires";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ bienvenue?: string }> }) {
  const { bienvenue } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: pro } = await db.from("professionals").select("id, prenom, nom, slug, profession, google_calendar_connected, cabinet:cabinets(google_place_id, google_business_url, google_reviews_url, offre_rdv, offre_site, page_seule, leads_carte_at)").eq("auth_user_id", user.id).maybeSingle();
  if (!pro) redirect("/inscription");
  // Formule « site + formulaire de contact » : la prise de rdv est à activer.
  const cabPro = Array.isArray(pro.cabinet) ? pro.cabinet[0] : pro.cabinet;
  if (cabPro?.offre_rdv === false && !cabPro?.page_seule) return <RdvPresentation page="rendez-vous" />;
  // Formule page sans carte : les demandes s'affichent sans le client, jusqu'à l'ajout de la carte.
  const masque = !!cabPro?.page_seule && !cabPro?.leads_carte_at;

  const { data, error } = await db
    .from("bookings")
    .select("id, statut, creneau_debut, creneau_fin, mode, type_rdv, client_nom, client_prenom, client_email, client_tel, message, suivi_existant, deja_avocat, created_at, token_pro, source, motifs(libelle, duree_min)")
    .eq("professional_id", pro.id)
    .neq("statut", "supprimé")
    .order("creneau_debut", { ascending: true });
  if (error) console.error("[dashboard] erreur Supabase :", error.message);
  const bookings = ((data ?? []) as Booking[]).map((b) => masque
    ? { ...b, client_nom: "", client_prenom: null, client_email: "", client_tel: null, message: null, token_pro: "" }
    : b);

  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const kpis = [
    { label: "Demandes à valider", value: bookings.filter((b) => b.statut === "demandé").length },
    { label: "Rendez-vous à venir", value: bookings.filter((b) => b.statut === "confirmé" && new Date(b.creneau_debut) >= now).length },
    { label: "Demandes ce mois-ci", value: bookings.filter((b) => new Date(b.created_at) >= debutMois).length },
    {
      label: "Taux de confirmation",
      value: (() => {
        const traitees = bookings.filter((b) => ["confirmé", "refusé"].includes(b.statut));
        return traitees.length ? `${Math.round((traitees.filter((b) => b.statut === "confirmé").length / traitees.length) * 100)} %` : "—";
      })(),
    },
  ];

  const host = (await headers()).get("host") ?? "avocat.clotere.fr";
  const lienResa = `${host.includes("localhost") ? "http" : "https"}://${host}/rdv/${pro.slug}`;

  return (
    <div>
      {bienvenue && (
        <div className="mb-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
          <strong>Votre page est créée et en ligne.</strong> Les clients peuvent déjà réserver. Vous ajouterez votre carte à la première demande reçue.
        </div>
      )}
      {masque && bookings.some((b) => b.statut === "demandé") && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-50 px-5 py-4 text-sm text-violet-900 ring-1 ring-violet-200">
          <span><strong>Vous avez de nouvelles demandes.</strong> Ajoutez votre carte pour voir les clients et leur répondre.</span>
          <Link href="/dashboard/abonnement" className="rounded-full bg-gray-950 px-4 py-2 font-medium text-white hover:bg-gray-800">Ajouter ma carte</Link>
        </div>
      )}
      <EnTetePage section="Rendez-vous" titre={`Bonjour ${pro.prenom}`}
        cta={cabPro?.page_seule ? <a href={`https://${lienFiche(pro)}`} target="_blank" rel="noopener" className="btn-solid">Voir ma page Clotere ↗</a> : undefined} />
      <div className="mt-6">{cabPro?.page_seule
        ? <LienResa url={`https://${lienFiche(pro)}`} titre="Votre page Clotere" />
        : <LienResa url={lienResa} />}</div>
      {!pro.google_calendar_connected && <AgendaSyncBanner />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="mt-2 text-4xl font-medium tracking-tight text-gray-950">{k.value}</p>
          </div>
        ))}
      </div>

      <BookingsList initial={bookings} masque={masque} profession={pro.profession} avisPossible={!!lienAvisGoogle(Array.isArray(pro.cabinet) ? pro.cabinet[0] : pro.cabinet)} />
    </div>
  );
}
