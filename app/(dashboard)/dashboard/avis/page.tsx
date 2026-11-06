import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { lienAvisGoogle } from "@/lib/google";
import { avisActif } from "@/lib/options";
import { AvisPresentation } from "@/components/avis/Presentation";
import { EspaceAvis } from "@/components/avis/EspaceAvis";
import type { AvisRow, DemandeAvis } from "@/lib/avis";

export const metadata = { title: "Avis Google" };

export default async function AvisPage({ searchParams }: { searchParams: Promise<{ onglet?: string; filtre?: string; option?: string }> }) {
  const { onglet: o, filtre, option } = await searchParams;
  const ctx = await cabinetConnecte();
  if (!ctx) redirect("/login?next=/dashboard/avis");
  const profession = ctx.pro.profession === "comptable" ? "comptable" : "avocat";
  if (!avisActif(ctx.cab)) {
    return (
      <>
        {option === "ok" && <div className="mb-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">Paiement reçu, merci ! L&apos;activation prend quelques secondes : rafraîchissez la page si elle ne s&apos;affiche pas.</div>}
        <AvisPresentation profession={profession} cabinet={ctx.cab.nom} note={ctx.cab.google_rating} nbAvis={ctx.cab.google_reviews_count} />
      </>
    );
  }

  const db = createAdminClient();
  const [{ data: avis }, { data: demandes }] = await Promise.all([
    db.from("avis_google").select("id, auteur, photo, note, texte, publie_le, quand, reponse_google, reponse_suggeree, statut")
      .eq("cabinet_id", ctx.cab.id).order("publie_le", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(200),
    db.from("demandes_avis").select("id, booking_id, client_nom, client_email, statut, historique, nb_relances, prochaine_relance_le, created_at")
      .eq("cabinet_id", ctx.cab.id).order("created_at", { ascending: false }).limit(200),
  ]);
  const onglet = o === "demandes" || o === "reglages" ? o : "avis";

  return (
    <EspaceAvis
      cabinet={{
        google_business_url: ctx.cab.google_business_url, google_rating: ctx.cab.google_rating, google_reviews_count: ctx.cab.google_reviews_count,
        google_reviews_url: ctx.cab.google_reviews_url, google_synced_at: ctx.cab.google_synced_at,
      }}
      lienAvis={lienAvisGoogle(ctx.cab)}
      avis={(avis ?? []) as AvisRow[]}
      demandes={(demandes ?? []) as DemandeAvis[]}
      onglet={onglet}
      filtre={filtre === "a_repondre" ? "a_repondre" : "tous"}
    />
  );
}
