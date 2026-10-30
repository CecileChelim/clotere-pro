import { createClient } from "@/lib/supabase/server";
import { CopyLinkCard } from "@/components/dashboard/CopyLinkCard";
import { DiffusionGuide } from "@/components/dashboard/DiffusionGuide";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moneago.fr";

export default async function DashboardDiffusionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: professional } = user
    ? await supabase
        .from("professionals")
        .select("ville, slug")
        .eq("auth_user_id", user.id)
        .maybeSingle()
    : { data: null };

  const bookingUrl = professional
    ? `${SITE_URL}/${encodeURIComponent(
        (professional.ville ?? "").toLowerCase().replace(/\s+/g, "-")
      )}/${professional.slug}`
    : null;

  return (
    <div>
      <p className="eyebrow">Diffusez votre lien</p>
      <h1 className="mt-2 font-serif text-3xl text-ink-2">
        Publiez votre lien de prise de rendez-vous
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-body">
        Votre lien de réservation Moneago fonctionne partout où vous êtes visible en ligne.
        Copiez-le, puis suivez le guide ci-dessous pour l&rsquo;ajouter sur votre profil LinkedIn
        et sur votre fiche Google Business.
      </p>

      <div className="mt-8">
        {bookingUrl ? (
          <CopyLinkCard url={bookingUrl} />
        ) : (
          <div className="card p-6 text-sm text-muted">
            Complétez votre fiche professionnelle (ville et identifiant) pour obtenir votre lien
            de réservation.
          </div>
        )}
      </div>

      <DiffusionGuide />
    </div>
  );
}
