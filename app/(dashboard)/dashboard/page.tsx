import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AgendaSyncBanner } from "@/components/dashboard/AgendaSyncBanner";
import { AgendaSyncCard } from "@/components/dashboard/AgendaSyncCard";
import { DiffusionPromoCard } from "@/components/dashboard/DiffusionPromoCard";
import { BookingCard, type BookingCardData } from "@/components/dashboard/BookingCard";

// Rendez-vous d'exemple — à remplacer par une lecture de `bookings` une fois
// le formulaire public de prise de RDV branché (aucune réservation réelle
// n'existe encore à ce stade).
const EXAMPLE_BOOKING: BookingCardData = {
  dateLabel: "Jeudi 18 septembre",
  timeLabel: "14h00 – 14h30",
  motif: "Bilan patrimonial",
  typeRdv: "Visioconférence",
  clientNom: "Martine Girard",
  clientEmail: "martine.girard@example.com",
  clientTelephone: "06 12 34 56 78",
  message: "Je souhaite faire le point avant la fin d'année, notamment sur la transmission.",
  eventUrl: "#",
};

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const { data: professional } = await supabase
    .from("professionals")
    .select("google_calendar_connected")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const agendaConnected = professional?.google_calendar_connected ?? false;

  return (
    <div>
      {!agendaConnected && <AgendaSyncBanner />}

      <p className="eyebrow">Vue d&rsquo;ensemble</p>
      <h1 className="mt-2 font-serif text-3xl text-ink-2">Votre activité</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["Rendez-vous ce mois-ci", "Taux de confirmation", "Vues de votre fiche"].map((label) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-serif text-3xl text-ink-2">—</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="eyebrow mb-3">Prochain rendez-vous</p>
          <BookingCard booking={EXAMPLE_BOOKING} example />
        </div>

        <div className="space-y-4">
          {!agendaConnected && <AgendaSyncCard />}
          <DiffusionPromoCard />
        </div>
      </div>
    </div>
  );
}
