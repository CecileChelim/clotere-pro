import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/* Récupère la note, le nombre d'avis et les derniers avis Google d'un cabinet
   (même méthode que pour les notaires : recherche texte nom + adresse, puis vérification de correspondance). */

const KEY = () => process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
const FIELDS = "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews";
const GENERIQUES = new Set(["cabinet", "avocat", "avocats", "maitre", "selarl", "sarl", "sas", "scp", "aarpi", "selas", "associes", "conseil", "expert", "comptable", "experts", "comptables", "the", "les", "des"]);
const norm = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Place = {
  id: string; displayName?: { text: string }; formattedAddress?: string; rating?: number; userRatingCount?: number; googleMapsUri?: string;
  reviews?: { rating: number; relativePublishTimeDescription?: string; text?: { text: string }; originalText?: { text: string };
    authorAttribution?: { displayName?: string; photoUri?: string } }[];
};

export type AvisGoogle = { auteur: string; photo: string | null; note: number; quand: string; texte: string };

export async function synchroniserGoogle(cabinetId: string) {
  const key = KEY();
  if (!key) return { ok: false as const, raison: "GOOGLE_PLACES_API_KEY manquante" };
  const db = createAdminClient();
  const { data: cab } = await db.from("cabinets").select("id, nom, adresse, code_postal, ville").eq("id", cabinetId).maybeSingle();
  if (!cab) return { ok: false as const, raison: "Cabinet introuvable" };

  const textQuery = [cab.nom, cab.adresse, cab.code_postal, cab.ville].filter(Boolean).join(" ");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELDS },
    body: JSON.stringify({ textQuery, languageCode: "fr", regionCode: "FR" }),
  });
  if (!res.ok) return { ok: false as const, raison: `Google Places ${res.status} : ${await res.text()}` };
  const places: Place[] = (await res.json()).places ?? [];

  // Même code postal + (un mot distinctif du nom OU même numéro de rue).
  const mots = norm(cab.nom).split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !GENERIQUES.has(w));
  const numero = norm(cab.adresse ?? "").match(/^(\d+)/)?.[1];
  const match = places.find((p) => {
    const adr = norm(p.formattedAddress);
    if (cab.code_postal && !adr.includes(cab.code_postal)) return false;
    const nomG = new Set(norm(p.displayName?.text).split(/[^a-z0-9]+/));
    return mots.some((w) => nomG.has(w)) || (!!numero && adr.startsWith(`${numero} `));
  });
  if (!match) {
    await db.from("cabinets").update({ google_synced_at: new Date().toISOString() }).eq("id", cabinetId);
    return { ok: false as const, raison: "Aucune fiche Google correspondante" };
  }

  const avis: AvisGoogle[] = (match.reviews ?? [])
    .filter((r) => (r.text?.text || r.originalText?.text))
    .map((r) => ({
      auteur: r.authorAttribution?.displayName ?? "Client",
      photo: r.authorAttribution?.photoUri ?? null,
      note: r.rating,
      quand: r.relativePublishTimeDescription ?? "",
      texte: (r.text?.text || r.originalText?.text || "").slice(0, 600),
    }));

  await db.from("cabinets").update({
    google_place_id: match.id,
    google_rating: match.rating ?? null,
    google_reviews_count: match.userRatingCount ?? null,
    google_reviews_url: match.googleMapsUri ?? null,
    google_reviews: avis,
    google_synced_at: new Date().toISOString(),
  }).eq("id", cabinetId);
  return { ok: true as const, note: match.rating, avis: match.userRatingCount };
}
