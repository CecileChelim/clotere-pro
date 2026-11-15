import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autocompleter } from "@/lib/places";
import { limiteIp } from "@/lib/antispam";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Sans compte : seulement depuis le créateur de site, avec une limite par IP (coût Google).
  if (!user && (req.nextUrl.searchParams.get("src") !== "createur" || await limiteIp(req, "places", [{ fenetreMin: 10, max: 120 }, { fenetreMin: 24 * 60, max: 600 }]))) return NextResponse.json({ suggestions: [] }, { status: 401 });
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 200);
  const s = req.nextUrl.searchParams.get("s") ?? undefined;
  return NextResponse.json({ suggestions: await autocompleter(q, s) });
}
