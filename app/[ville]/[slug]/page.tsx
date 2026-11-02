import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { synchroniserGoogle, type AvisGoogle } from "@/lib/google";
import { etatAbonnement } from "@/lib/abonnement";
import { createClient } from "@supabase/supabase-js";
import { BookingFlow, type BookingPro } from "@/components/booking/BookingFlow";
import { horairesDepuisRows } from "@/lib/horaires";
import { PROFESSIONS } from "@/lib/professions-config";
import { chargerTaxonomie, selectionParDomaine } from "@/lib/taxonomie";
import { HONORAIRES_MODES, PAIEMENT_MOYENS, SERVICES, labels } from "@/lib/honoraires";

type Params = { params: Promise<{ ville: string; slug: string }> };

async function charger(slug: string) {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: pro, error } = await db
    .from("professionals")
    .select("id, prenom, nom, photo_url, bio, profession, ville, telephone, domaines, linkedin_url, honoraires_modes, paiement_moyens, services, cabinets(id, nom, adresse, code_postal, ville, site_web, telephone, google_rating, google_reviews_count, google_reviews_url, google_business_url, google_reviews, google_synced_at, google_place_id, google_place_url, trial_ends_at, subscription_status)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) console.error("[page rdv] erreur Supabase :", error.message);
  if (!pro) return null;
  const [{ data: motifs }, { data: dispo }, { data: ps }, taxo] = await Promise.all([
    db.from("motifs").select("id, libelle, description, duree_min, modes, actif, ordre").eq("professional_id", pro.id).eq("actif", true).order("ordre"),
    db.from("availability").select("jour_semaine, heure_debut, heure_fin, date").eq("professional_id", pro.id),
    db.from("pro_specialites").select("specialite_id").eq("professional_id", pro.id),
    chargerTaxonomie(db, pro.profession === "comptable" ? "comptable" : "avocat"),
  ]);
  const expertise = selectionParDomaine(taxo, (ps ?? []).map((x: { specialite_id: string }) => x.specialite_id))
    .map((d) => ({ domaine: d.label, specialites: d.specialites.map((x) => x.label) }));
  return { pro, motifs: motifs ?? [], horaires: horairesDepuisRows(dispo), expertise };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const d = await charger(slug);
  if (!d) return { title: "Prendre rendez-vous" };
  const titre = d.pro.profession === "avocat" ? "Maître " : "";
  return {
    title: `Prendre rendez-vous avec ${titre}${d.pro.prenom} ${d.pro.nom}`,
    description: `Réservez en ligne un rendez-vous avec ${titre}${d.pro.prenom} ${d.pro.nom}, en visio, par téléphone ou au cabinet.`,
  };
}

export default async function BookingPage({ params }: Params) {
  const { slug } = await params;
  const d = await charger(slug);
  if (!d) notFound();

  const cab = Array.isArray(d.pro.cabinets) ? d.pro.cabinets[0] : d.pro.cabinets;
  // Note et avis Google rafraîchis en arrière-plan au plus une fois par semaine.
  const ilYa = cab?.google_synced_at ? Date.now() - new Date(cab.google_synced_at).getTime() : Infinity;
  // Rafraîchi chaque semaine, ou tout de suite (max. toutes les 10 min) si le lien de fiche Google a changé.
  const ficheChangee = !!cab?.google_business_url && cab.google_business_url !== cab.google_place_url;
  if (cab?.id && (ilYa > 7 * 24 * 3600e3 || (ficheChangee && ilYa > 10 * 60e3))) {
    after(() => synchroniserGoogle(cab.id).then((r) => { if (!r.ok) console.warn("[google]", r.raison); }));
  }
  console.log("[page rdv] cabinet :", JSON.stringify(cab));
  const profession = d.pro.profession === "comptable" ? "comptable" : "avocat";
  const pro: BookingPro = {
    id: d.pro.id,
    nomAffiche: `${PROFESSIONS[profession].titre ? PROFESSIONS[profession].titre + " " : ""}${d.pro.prenom} ${d.pro.nom}`,
    initiales: `${d.pro.prenom?.[0] ?? ""}${d.pro.nom?.[0] ?? ""}`.toUpperCase(),
    photo: d.pro.photo_url,
    bio: d.pro.bio,
    cabinet: cab?.nom ?? null,
    adresse: cab ? [cab.adresse, [cab.code_postal, cab.ville].filter(Boolean).join(" ")].filter(Boolean).join(", ") : d.pro.ville,
    profession,
    telephone: cab?.telephone || d.pro.telephone || null,
    siteWeb: cab?.site_web ?? null,
    rating: cab?.google_rating ? Number(cab.google_rating) : null,
    reviews: cab?.google_reviews_count ?? null,
    reviewsUrl: cab?.google_reviews_url ?? cab?.google_business_url ?? null,
    linkedin: d.pro.linkedin_url ?? null,
    avis: ((cab?.google_reviews ?? []) as AvisGoogle[]).filter((a) => a.note >= 4).slice(0, 3),
    googleFiche: cab?.google_business_url ?? null,
    expertise: d.expertise,
    honoraires: {
      modes: labels(HONORAIRES_MODES, d.pro.honoraires_modes),
      paiement: labels(PAIEMENT_MOYENS, d.pro.paiement_moyens),
      services: labels(SERVICES, d.pro.services),
    },
  };

  return <BookingFlow pro={pro} motifs={d.motifs} horaires={d.horaires} indisponible={!etatAbonnement(cab).actif} />;
}
