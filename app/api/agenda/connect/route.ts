import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { urlConsentement, type Provider } from "@/lib/agenda";

// Lance la connexion de l'agenda (Google ou Outlook) pour l'utilisateur connecté.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams.get("provider") as Provider;
  if (p !== "google" && p !== "outlook") return NextResponse.json({ error: "provider" }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/dashboard/agenda", url.origin));
  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(urlConsentement(p, url.origin, state));
  res.cookies.set("agenda_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: url.protocol === "https:", maxAge: 600, path: "/" });
  return res;
}
