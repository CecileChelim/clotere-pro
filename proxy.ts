import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const SITES = { avocat: "https://avocat.clotere.fr", comptable: "https://comptable.clotere.fr" } as const;

/** Redirection permanente (301) vers un chemin du même hôte ou une URL absolue. */
function redirect301(request: NextRequest, cible: string) {
  const url = cible.startsWith("http") ? new URL(cible) : Object.assign(request.nextUrl.clone(), { pathname: cible });
  if (cible.startsWith("http")) url.search = request.nextUrl.search;
  return NextResponse.redirect(url, 301);
}

/* ── Domaines personnalisés des sites (dashboard › Mon site › Publication) ──
   www.cabinet-dupont.fr affiche le site ; cabinet-dupont.fr redirige vers www.
   Correspondance domaine -> slug gardée 5 min en mémoire. */
const HOTES_CLOTERE = /(^|\.)clotere\.fr$|netlify\.app$|^localhost$|\.localhost$|comptelio|^\d+\.\d+\.\d+\.\d+$/;
const cacheDomaines = new Map<string, { slug: string | null; expire: number }>();

async function slugDuDomaine(domaine: string): Promise<string | null> {
  const c = cacheDomaines.get(domaine);
  if (c && c.expire > Date.now()) return c.slug;
  let slug: string | null = null;
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sites?select=slug&domaine_statut=eq.connecte&domaine=eq.${encodeURIComponent(domaine)}&limit=1`;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (r.ok) slug = ((await r.json()) as { slug: string }[])[0]?.slug ?? null;
  } catch { /* domaine inconnu ou base indisponible : 404 standard */ }
  cacheDomaines.set(domaine, { slug, expire: Date.now() + 5 * 60e3 });
  return slug;
}

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0];
  const path = request.nextUrl.pathname;

  if (host && !HOTES_CLOTERE.test(host)) {
    const domaine = host.replace(/^www\./, "");
    const slug = await slugDuDomaine(domaine);
    if (slug) {
      if (!host.startsWith("www.")) return NextResponse.redirect(`https://www.${domaine}${path}${request.nextUrl.search}`, 301);
      if (path === `/${slug}`) return redirect301(request, "/");
      if (path === "/") {
        const url = request.nextUrl.clone();
        url.pathname = `/${slug}`;
        return NextResponse.rewrite(url);
      }
      // /rdv/…, /api/…, mentions légales : servis tels quels sur le domaine du cabinet.
    }
  }
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
