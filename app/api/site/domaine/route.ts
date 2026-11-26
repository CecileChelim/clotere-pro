import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { CIBLE_CNAME, IP_NETLIFY, declarerSurNetlify, normaliserDomaine, verifierDns } from "@/lib/site/domaine";

/* Nom de domaine du site (onglet Publication de « Mon site »).
   POST   { domaine }  : enregistre le domaine (statut « attente »)
   GET               : vérifie le DNS ; à la 1re réussite, déclare le domaine sur Netlify et passe en « connecte »
   DELETE            : déconnecte le domaine */

async function contexte() {
  const ctx = await cabinetConnecte();
  if (!ctx || ctx.pro.role === "membre") return null;
  const db = createAdminClient();
  const { data: site } = await db.from("sites")
    .select("id, domaine, domaine_statut, domaine_connecte_at").eq("cabinet_id", ctx.cab.id).maybeSingle();
  return site ? { db, site } : null;
}

const cibles = { cname: CIBLE_CNAME, ip: IP_NETLIFY };

export async function POST(req: Request) {
  const c = await contexte();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const { domaine: saisie } = (await req.json().catch(() => ({}))) as { domaine?: string };
  const domaine = normaliserDomaine(String(saisie ?? ""));
  if (!domaine) return NextResponse.json({ ok: false, error: "Ce nom de domaine n'est pas valide (exemple : cabinet-dupont.fr)." }, { status: 400 });

  const { data: pris } = await c.db.from("sites").select("id").eq("domaine", domaine).neq("id", c.site.id).maybeSingle();
  if (pris) return NextResponse.json({ ok: false, error: "Ce nom de domaine est déjà relié à un autre site." }, { status: 409 });

  if (c.site.domaine && c.site.domaine !== domaine && c.site.domaine_statut === "connecte") await declarerSurNetlify(c.site.domaine, "retrait");
  const { error } = await c.db.from("sites")
    .update({ domaine, domaine_statut: "attente", domaine_verifie_at: null, domaine_connecte_at: null }).eq("id", c.site.id);
  if (error) return NextResponse.json({ ok: false, error: "Enregistrement impossible, réessayez." }, { status: 500 });
  return NextResponse.json({ ok: true, domaine, statut: "attente", cibles });
}

export async function GET() {
  const c = await contexte();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  if (!c.site.domaine) return NextResponse.json({ ok: true, domaine: null, cibles });

  const verif = await verifierDns(c.site.domaine);
  const maintenant = new Date().toISOString();
  let statut = c.site.domaine_statut ?? "attente";
  let netlify: { ok: boolean; raison?: string } | null = null;
  if (verif.www.ok && statut !== "connecte") {
    netlify = await declarerSurNetlify(c.site.domaine, "ajout");
    if (!netlify.ok) console.warn("[domaine] déclaration Netlify :", netlify.raison);
    statut = "connecte";
  }
  await c.db.from("sites").update({
    domaine_statut: statut, domaine_verifie_at: maintenant,
    ...(statut === "connecte" && !c.site.domaine_connecte_at ? { domaine_connecte_at: maintenant } : {}),
  }).eq("id", c.site.id);
  return NextResponse.json({ ok: true, domaine: c.site.domaine, statut, verif, cibles });
}

export async function DELETE() {
  const c = await contexte();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  if (c.site.domaine && c.site.domaine_statut === "connecte") await declarerSurNetlify(c.site.domaine, "retrait");
  await c.db.from("sites").update({ domaine: null, domaine_statut: null, domaine_verifie_at: null, domaine_connecte_at: null }).eq("id", c.site.id);
  return NextResponse.json({ ok: true });
}
