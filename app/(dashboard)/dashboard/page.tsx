import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LienResa } from "@/components/dashboard/LienResa";
import { createClient } from "@/lib/supabase/server";
import { AgendaSyncBanner } from "@/components/dashboard/AgendaSyncBanner";
import { BookingsList, type Booking } from "@/components/pro/BookingsList";
import { MarketingPromoCard } from "@/components/dashboard/MarketingPromoCard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: pro } = await db.from("professionals").select("id, prenom, slug, profession, google_calendar_connected").eq("auth_user_id", user.id).maybeSingle();
  if (!pro) redirect("/inscription");

  const { data, error } = await db
    .from("bookings")
    .select("id, statut, creneau_debut, creneau_fin, mode, type_rdv, client_nom, client_prenom, client_email, client_tel, message, suivi_existant, deja_avocat, created_at, token_pro, motifs(libelle, duree_min)")
    .eq("professional_id", pro.id)
    .order("creneau_debut", { ascending: true });
  if (error) console.error("[dashboard] erreur Supabase :", error.message);
  const bookings = (data ?? []) as Booking[];

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
      <LienResa url={lienResa} />
      {!pro.google_calendar_connected && <AgendaSyncBanner />}

      <p className="eyebrow">Rendez-vous</p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight text-gray-950">Bonjour {pro.prenom}</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-sm text-gray-500">{k.label}</p>
            <p className="mt-2 text-4xl font-medium tracking-tight text-gray-950">{k.value}</p>
          </div>
        ))}
      </div>

      <BookingsList initial={bookings} profession={pro.profession} />

      <MarketingPromoCard profession={pro.profession} />
    </div>
  );
}
