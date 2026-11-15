import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { palette } from "@/lib/site/palettes";
import { SECTIONS, type Contenu } from "@/lib/site/types";

// Enregistrement des modifications du site depuis l'espace pro (textes, sections, style, couleurs, photos).
const txt = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const url = (v: unknown) => (typeof v === "string" && /^https:\/\/[^\s]+$/.test(v) ? v.slice(0, 500) : null);

function nettoyerContenu(c: unknown): Partial<Contenu> {
  // Contenu libre mais borné : uniquement des chaînes, des listes et des objets peu profonds.
  const net = (v: unknown, prof = 0): unknown => {
    if (prof > 4) return null;
    if (typeof v === "string") return txt(v, 6000);
    if (Array.isArray(v)) return v.slice(0, 20).map((x) => net(x, prof + 1));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).slice(0, 30).map(([k, x]) => [k.slice(0, 40), net(x, prof + 1)]));
    return null;
  };
  return (net(c) ?? {}) as Partial<Contenu>;
}

export async function PATCH(req: Request) {
  const ctx = await cabinetConnecte();
  if (!ctx) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if ("template" in body && ["light", "moderne", "performance"].includes(body.template as string)) patch.template = body.template;
  if ("palette" in body) patch.palette = palette(body.palette as string).id;
  if ("sections" in body && Array.isArray(body.sections)) {
    patch.sections = (body.sections as string[]).filter((s) => SECTIONS.some((x) => x.id === s) && (s !== "actualites" || ctx.cab.offre_rdv !== false));
  }
  if ("contenu" in body) patch.contenu = nettoyerContenu(body.contenu);
  if ("email_contact" in body) { const m = txt(body.email_contact, 160).trim().toLowerCase(); patch.email_contact = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m) ? m : null; }
  if ("complement_adresse" in body) patch.complement_adresse = txt(body.complement_adresse, 120) || null;
  if ("photo_couverture" in body) patch.photo_couverture = url(body.photo_couverture);
  if ("photo_portrait" in body) patch.photo_portrait = url(body.photo_portrait);
  if (!Object.keys(patch).length) return NextResponse.json({ ok: false, error: "Rien à enregistrer" }, { status: 400 });

  const { error } = await createAdminClient().from("sites").update(patch).eq("cabinet_id", ctx.cab.id);
  if (error) { console.error("[site] enregistrement", error.message); return NextResponse.json({ ok: false, error: "L'enregistrement a échoué." }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
