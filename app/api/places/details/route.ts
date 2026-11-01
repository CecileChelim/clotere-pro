import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detailLieu } from "@/lib/places";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ lieu: null }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id") ?? "";
  const s = req.nextUrl.searchParams.get("s") ?? undefined;
  return NextResponse.json({ lieu: await detailLieu(id, s) });
}
