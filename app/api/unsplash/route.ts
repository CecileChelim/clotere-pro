import { NextResponse, type NextRequest } from "next/server";
import { cabinetConnecte } from "@/lib/visibilite-serveur";

/* Recherche de photos de couverture sur Unsplash (API officielle, clé UNSPLASH_ACCESS_KEY).
   GET ?q=… : résultats paysage. POST { download } : signale l'utilisation de la photo à Unsplash (obligatoire). */

const API = "https://api.unsplash.com";
const cle = () => process.env.UNSPLASH_ACCESS_KEY;

type Photo = { id: string; alt_description: string | null; urls: { small: string; regular: string }; user: { name: string; links: { html: string } }; links: { download_location: string } };

export async function GET(req: NextRequest) {
  if (!(await cabinetConnecte())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!cle()) return NextResponse.json({ ok: false, sansCle: true }, { status: 501 });
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 80) || "bureau";
  const r = await fetch(`${API}/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape&content_filter=high`, {
    headers: { Authorization: `Client-ID ${cle()}`, "Accept-Version": "v1" },
  }).catch(() => null);
  if (!r?.ok) return NextResponse.json({ ok: false }, { status: 502 });
  const j = (await r.json()) as { results: Photo[] };
  const utm = "?utm_source=clotere&utm_medium=referral";
  return NextResponse.json({
    ok: true,
    photos: j.results.map((p) => ({
      id: p.id, alt: p.alt_description ?? "", vignette: p.urls.small, url: p.urls.regular,
      auteur: p.user.name, lienAuteur: `${p.user.links.html}${utm}`, download: p.links.download_location,
    })),
  });
}

export async function POST(req: Request) {
  if (!(await cabinetConnecte()) || !cle()) return NextResponse.json({ ok: false }, { status: 401 });
  const { download } = (await req.json().catch(() => ({}))) as { download?: string };
  if (typeof download !== "string" || !download.startsWith(`${API}/photos/`)) return NextResponse.json({ ok: false }, { status: 400 });
  await fetch(download, { headers: { Authorization: `Client-ID ${cle()}` } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
