import "server-only";

/** Google Places API (New) : autocomplétion d'adresse / d'établissement et détail d'un lieu. */
const KEY = () => process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

export type Suggestion = { id: string; principal: string; secondaire: string };
export type LieuDetail = {
  nom: string | null; adresse: string; code_postal: string; ville: string;
  telephone: string | null; site: string | null; google_url: string | null; etablissement: boolean;
};

export async function autocompleter(input: string, session?: string): Promise<Suggestion[]> {
  const key = KEY();
  if (!key || input.trim().length < 3) return [];
  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
    body: JSON.stringify({ input, languageCode: "fr", includedRegionCodes: ["fr"], ...(session ? { sessionToken: session } : {}) }),
  });
  if (!res.ok) { console.error("[places] autocomplete", res.status, await res.text()); return []; }
  type S = { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }; text?: { text: string } } };
  const json = (await res.json()) as { suggestions?: S[] };
  return (json.suggestions ?? []).flatMap((s) => s.placePrediction ? [{
    id: s.placePrediction.placeId,
    principal: s.placePrediction.structuredFormat?.mainText?.text ?? s.placePrediction.text?.text ?? "",
    secondaire: s.placePrediction.structuredFormat?.secondaryText?.text ?? "",
  }] : []);
}

export async function detailLieu(id: string, session?: string): Promise<LieuDetail | null> {
  const key = KEY();
  if (!key || !/^[\w-]+$/.test(id)) return null;
  const url = `https://places.googleapis.com/v1/places/${id}?languageCode=fr${session ? `&sessionToken=${encodeURIComponent(session)}` : ""}`;
  const res = await fetch(url, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "displayName,addressComponents,types,nationalPhoneNumber,websiteUri,googleMapsUri" },
  });
  if (!res.ok) { console.error("[places] details", res.status, await res.text()); return null; }
  type C = { longText: string; shortText: string; types: string[] };
  const p = (await res.json()) as { displayName?: { text: string }; addressComponents?: C[]; types?: string[]; nationalPhoneNumber?: string; websiteUri?: string; googleMapsUri?: string };
  const comp = (t: string) => p.addressComponents?.find((c) => c.types.includes(t))?.longText ?? "";
  const types = p.types ?? [];
  const etablissement = types.includes("establishment") || types.includes("point_of_interest");
  return {
    nom: etablissement ? p.displayName?.text ?? null : null,
    adresse: [comp("street_number"), comp("route")].filter(Boolean).join(" ") || comp("premise"),
    code_postal: comp("postal_code"),
    ville: comp("locality") || comp("postal_town") || comp("administrative_area_level_2"),
    telephone: etablissement ? p.nationalPhoneNumber ?? null : null,
    site: etablissement ? p.websiteUri ?? null : null,
    google_url: etablissement ? p.googleMapsUri ?? null : null,
    etablissement,
  };
}
