import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { enregistrerConnexion, type Provider } from "@/lib/agenda";

// Retour de Google / Microsoft après consentement.
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = new URL(req.url);
  const retour = (statut: string, detail?: string) =>
    NextResponse.redirect(new URL(`/dashboard/agenda?agenda=${statut}${detail ? `&detail=${encodeURIComponent(detail.slice(0, 200))}` : ""}`, url.origin));
  console.log("[agenda] retour", provider, Object.fromEntries([...url.searchParams].filter(([k]) => k !== "code")));
  if (provider !== "google" && provider !== "outlook") return retour("erreur", `Fournisseur inconnu : ${provider}`);

  const state = (await cookies()).get("agenda_oauth_state")?.value;
  if (!state || state !== url.searchParams.get("state")) return retour("erreur", "Session de connexion expirée (cookie state) : relancez la connexion depuis cette page.");
  const code = url.searchParams.get("code");
  if (!code) {
    const err = url.searchParams.get("error");
    return err === "access_denied" ? retour("refuse") : retour("erreur", `Google/Microsoft n'a pas renvoyé de code : ${err ?? "inconnu"} ${url.searchParams.get("error_description") ?? ""}`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?next=/dashboard/agenda", url.origin));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pro } = await (supabase as any).from("professionals").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!pro) return retour("erreur", "Profil introuvable pour ce compte.");

  try {
    await enregistrerConnexion(pro.id, provider as Provider, code, url.origin);
  } catch (e) {
    console.error("[agenda] callback", e);
    return retour("erreur", e instanceof Error ? e.message : String(e));
  }
  const res = retour("ok");
  res.cookies.delete("agenda_oauth_state");
  return res;
}
