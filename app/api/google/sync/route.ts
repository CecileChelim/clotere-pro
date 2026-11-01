import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { synchroniserGoogle } from "@/lib/google";

// Rafraîchit la note et les avis Google du cabinet de l'utilisateur connecté.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pro } = await (supabase as any).from("professionals").select("cabinet_id").eq("auth_user_id", user.id).maybeSingle();
  if (!pro?.cabinet_id) return NextResponse.json({ ok: false, raison: "Pas de cabinet" }, { status: 400 });
  const r = await synchroniserGoogle(pro.cabinet_id);
  if (!r.ok) console.warn("[google]", r.raison);
  return NextResponse.json(r);
}
