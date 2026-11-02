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


const DETAILS = "id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,reviews";

/** Suit les redirections (maps.app.goo.gl, g.page…) sans charger les pages, pour obtenir l'URL Google Maps complète. */
async function urlFinale(url: string) {
  let u = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  for (let i = 0; i < 6; i++) {
    const m = u.match(/consent\.google\.[a-z.]+\/.*[?&]continue=([^&]+)/);
    if (m) { u = decodeURIComponent(m[1]); continue; }
    if (/\/maps\/place\/|[?&](placeid|place_id|query_place_id|cid)=/.test(u)) return u;
    try {
      const res = await fetch(u, { redirect: "manual", headers: { "User-Agent": "Mozilla/5.0 (compatible; Clotere/1.0)" }, signal: AbortSignal.timeout(5000) });
      const loc = res.headers.get("location");
      if (!loc) return u;
      u = new URL(loc, u).toString();
    } catch { return u; }
  }
  return u;
}

/** Extrait d'un lien Google Maps : identifiant de lieu, nom, coordonnées. */
function lireUrl(u: string) {
  const id = u.match(/[?&](?:placeid|place_id|query_place_id)=([A-Za-z0-9_-]{10,})/)?.[1];
  const nom = u.match(/\/maps\/place\/([^/@?]+)/)?.[1];
  const c = u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ?? u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  return {
    id,
    nom: nom ? decodeURIComponent(nom.replace(/\+/g, " ")) : undefined,
    lat: c ? Number(c[1]) : undefined, lng: c ? Number(c[2]) : undefined,
  };
}

async function details(key: string, id: string): Promise<Place | null> {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=fr`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": DETAILS },
  });
  return res.ok ? ((await res.json()) as Place) : null;
}

/** Trouve la fiche Google à partir du lien collé par le pro (fiche, partage maps.app.goo.gl, lien d'avis…). */
async function placeDepuisLien(key: string, lien: string): Promise<Place | null> {
  const infos = lireUrl(await urlFinale(lien));
  if (infos.id) return details(key, infos.id);
  if (!infos.nom) return null;
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELDS },
    body: JSON.stringify({
      textQuery: infos.nom, languageCode: "fr", regionCode: "FR",
      ...(infos.lat != null ? { locationBias: { circle: { center: { latitude: infos.lat, longitude: infos.lng }, radius: 300 } } } : {}),
    }),
  });
  if (!res.ok) return null;
  return (((await res.json()).places ?? []) as Place[])[0] ?? null;
}

/** Lien direct « Laisser un avis » sur Google, sinon la fiche. */
export function lienAvisGoogle(c: { google_place_id?: string | null; google_business_url?: string | null; google_reviews_url?: string | null } | null | undefined) {
  if (c?.google_place_id) return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(c.google_place_id)}`;
  return c?.google_business_url || c?.google_reviews_url || null;
}

export type AvisGoogle = { auteur: string; photo: string | null; note: number; quand: string; texte: string };

export async function synchroniserGoogle(cabinetId: string) {
  const key = KEY();
  if (!key) return { ok: false as const, raison: "GOOGLE_PLACES_API_KEY manquante" };
  const db = createAdminClient();
  const { data: cab } = await db.from("cabinets").select("id, nom, adresse, code_postal, ville, google_business_url, google_place_id, google_place_url").eq("id", cabinetId).maybeSingle();
  if (!cab) return { ok: false as const, raison: "Cabinet introuvable" };

  let match: Place | null = null;
  // 1. Le pro a donné le lien de sa fiche Google : c'est la source la plus fiable.
  if (cab.google_business_url) {
    match = cab.google_place_id && cab.google_place_url === cab.google_business_url
      ? await details(key, cab.google_place_id)
      : await placeDepuisLien(key, cab.google_business_url);
  } else if (cab.google_place_id) {
    match = await details(key, cab.google_place_id);
  }

  // 2. Sinon : recherche nom + adresse, avec vérification de correspondance.
  if (!match) {
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
    match = places.find((p) => {
      const adr = norm(p.formattedAddress);
      if (cab.code_postal && !adr.includes(cab.code_postal)) return false;
      const nomG = new Set(norm(p.displayName?.text).split(/[^a-z0-9]+/));
      return mots.some((w) => nomG.has(w)) || (!!numero && adr.startsWith(`${numero} `));
    }) ?? null;
  }
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
    google_place_url: cab.google_business_url ?? null,
    google_rating: match.rating ?? null,
    google_reviews_count: match.userRatingCount ?? null,
    google_reviews_url: match.googleMapsUri ?? null,
    google_reviews: avis,
    google_synced_at: new Date().toISOString(),
  }).eq("id", cabinetId);
  return { ok: true as const, note: match.rating, avis: match.userRatingCount };
}
