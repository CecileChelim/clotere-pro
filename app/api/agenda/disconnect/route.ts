import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deconnecter } from "@/lib/agenda";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pro } = await (supabase as any).from("professionals").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!pro) return NextResponse.json({ ok: false }, { status: 400 });
  await deconnecter(pro.id);
  return NextResponse.json({ ok: true });
}
