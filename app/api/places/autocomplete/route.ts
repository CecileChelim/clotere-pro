import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autocompleter } from "@/lib/places";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ suggestions: [] }, { status: 401 });
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 200);
  const s = req.nextUrl.searchParams.get("s") ?? undefined;
  return NextResponse.json({ suggestions: await autocompleter(q, s) });
}
