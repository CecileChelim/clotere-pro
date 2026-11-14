import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const SITES = { avocat: "https://avocat.clotere.fr", comptable: "https://comptable.clotere.fr" } as const;

/** Redirection permanente (301) vers un chemin du même hôte ou une URL absolue. */
function redirect301(request: NextRequest, cible: string) {
  const url = cible.startsWith("http") ? new URL(cible) : Object.assign(request.nextUrl.clone(), { pathname: cible });
  if (cible.startsWith("http")) url.search = request.nextUrl.search;
  return NextResponse.redirect(url, 301);
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0];
  const path = request.nextUrl.pathname;
  const avocat = host.startsWith("avocat.");
  const comptable = host.startsWith("comptable.") || host.includes("comptelio");
  const prod = host.endsWith("clotere.fr");

  // ── URLs canoniques (sitemap propre, pas de contenu dupliqué) ────────────
  // L'accueil est servi à la racine : /avocat et /comptable redirigent vers /.
  if (avocat && path === "/avocat") return redirect301(request, "/");
  if (comptable && path === "/comptable") return redirect301(request, "/");
  // Le blog comptable est servi sous /blog : /comptable/blog/… redirige vers /blog/….
  if (comptable && path.startsWith("/comptable/blog")) return redirect301(request, path.replace(/^\/comptable/, ""));
  // Les pages d'une profession n'existent que sur leur sous-domaine (en prod).
  if (prod && comptable && (/-avocat$/.test(path) || path === "/avocat")) return redirect301(request, `${SITES.avocat}${path === "/avocat" ? "" : path}`);
  if (prod && avocat && (/-expert-comptable$/.test(path) || path.startsWith("/comptable"))) {
    return redirect301(request, `${SITES.comptable}${path.replace(/^\/comptable/, "") || ""}`);
  }

  // ── Réécritures internes ─────────────────────────────────────────────────
  // avocat.clotere.fr / comptable.clotere.fr (et *.localhost en dev) : la racine affiche la landing du métier.
  if (path === "/" && (avocat || comptable)) {
    const url = request.nextUrl.clone();
    url.pathname = avocat ? "/avocat" : "/comptable";
    return NextResponse.rewrite(url);
  }
  // comptable : le blog est servi par /comptable/blog.
  if (comptable && (path === "/blog" || path.startsWith("/blog/"))) {
    const url = request.nextUrl.clone();
    url.pathname = `/comptable${path}`;
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
