import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  // avocat.clotere.fr (et avocat.localhost en dev) : la racine affiche la landing avocat
  if (host.startsWith("avocat.") && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/avocat";
    return NextResponse.rewrite(url);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * On fait tourner le middleware sur tout sauf les assets statiques,
     * mais la protection effective (redirection /login) ne s'applique
     * qu'aux routes /dashboard/* — voir lib/supabase/middleware.ts.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
