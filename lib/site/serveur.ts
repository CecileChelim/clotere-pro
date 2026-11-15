import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROFESSIONS, motifsDepuisDomaines, type Profession } from "@/lib/professions-config";
import { contenuParDefaut, fusionContenu } from "@/lib/site/contenu";
import { slugSite, SLUGS_RESERVES } from "@/lib/site/slug";
import { palette } from "@/lib/site/palettes";
import { SECTIONS, type Contenu, type Formule, type SectionId, type SiteRendu, type Taille, type TemplateId } from "@/lib/site/types";
import type { AvisGoogle } from "@/lib/google";
import { HONORAIRES_MODES, PAIEMENT_MOYENS, SERVICES, labels } from "@/lib/honoraires";

/* Chargement d'un site (page publique, éditeur) et création à la fin du parcours. */

const anon = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const CABINET_COLS = "id, nom, adresse, code_postal, ville, telephone, barreau, siret, profession, offre_site, offre_rdv, trial_ends_at, subscription_status, google_rating, google_reviews_count, google_reviews_url, google_business_url, google_reviews, google_synced_at, google_place_id, google_place_url";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type SiteRow = {
  id: string; cabinet_id: string; professional_id: string | null; profession: Profession; slug: string; template: TemplateId; palette: string;
  sections: SectionId[]; contenu: Partial<Contenu> | null; taille: Taille | null; complement_adresse: string | null; photo_couverture: string | null; photo_portrait: string | null; email_contact?: string | null;
};

export function formuleDe(cab: { offre_rdv?: boolean | null } | null | undefined): Formule {
  return cab?.offre_rdv === false ? "contact" : "rdv";
}

/** Assemble les données d'affichage d'un site à partir des lignes Supabase. */
export function siteRendu(site: SiteRow, cab: any, pro: any, motifs: { id: string; libelle: string }[]): SiteRendu {
  const profession: Profession = site.profession === "comptable" ? "comptable" : "avocat";
  const formule = formuleDe(cab);
  const base = contenuParDefaut({
    profession, prenom: pro?.prenom ?? "", nom: pro?.nom ?? "", cabinet: cab?.nom ?? "", ville: cab?.ville ?? "",
    taille: site.taille ?? "seul", domaines: pro?.domaines ?? [], formule,
  });
  const avis = ((cab?.google_reviews ?? []) as AvisGoogle[]).filter((x) => x.note >= 4).map((x) => ({ auteur: x.auteur, note: x.note, texte: x.texte, quand: x.quand }));
  return {
    profession, template: site.template, palette: palette(site.palette).id,
    sections: (site.sections ?? []).filter((s) => SECTIONS.some((x) => x.id === s)),
    contenu: fusionContenu(base, site.contenu), formule, slug: site.slug, siteId: site.id,
    cabinet: { nom: cab?.nom ?? "", adresse: cab?.adresse ?? "", complement: site.complement_adresse, codePostal: cab?.code_postal ?? "", ville: cab?.ville ?? "", telephone: cab?.telephone ?? pro?.telephone ?? null, email: site.email_contact ?? null, barreau: cab?.barreau ?? null, siret: cab?.siret ?? null },
    honoraires: { modes: labels(HONORAIRES_MODES, pro?.honoraires_modes), paiement: labels(PAIEMENT_MOYENS, pro?.paiement_moyens), services: labels(SERVICES, pro?.services) },
    pro: { prenom: pro?.prenom ?? "", nom: pro?.nom ?? "", titre: PROFESSIONS[profession].titre, photo: site.photo_portrait ?? pro?.photo_url ?? null },
    couverture: site.photo_couverture,
    lienRdv: formule === "rdv" && pro?.slug ? `/rdv/${pro.slug}` : null,
    motifs,
    avis: {
      note: cab?.google_rating ? Number(cab.google_rating) : null, nb: cab?.google_reviews_count ?? null,
      url: cab?.google_reviews_url ?? cab?.google_business_url ?? null, liste: avis,
    },
  };
}

/** Site public par son slug (lecture anonyme). */
export async function chargerSitePublic(slug: string) {
  const db = anon();
  const { data: site } = await db.from("sites").select("*").eq("slug", slug).maybeSingle();
  if (!site) return null;
  const [{ data: cab }, { data: pro }] = await Promise.all([
    db.from("cabinets").select(CABINET_COLS).eq("id", site.cabinet_id).maybeSingle(),
    site.professional_id
      ? db.from("professionals").select("id, prenom, nom, slug, photo_url, telephone, domaines, honoraires_modes, paiement_moyens, services").eq("id", site.professional_id).maybeSingle()
      : db.from("professionals").select("id, prenom, nom, slug, photo_url, telephone, domaines, honoraires_modes, paiement_moyens, services").eq("cabinet_id", site.cabinet_id).eq("role", "titulaire").limit(1).maybeSingle(),
  ]);
  const { data: motifs } = pro ? await db.from("motifs").select("id, libelle").eq("professional_id", pro.id).eq("actif", true).order("ordre") : { data: [] };
  return { site: site as SiteRow, cab, pro, rendu: siteRendu(site as SiteRow, cab, pro, motifs ?? []) };
}

/** Site du cabinet de l'utilisateur connecté (espace pro). */
export async function chargerSiteCabinet(cabinetId: string) {
  const db = createAdminClient();
  const { data: site } = await db.from("sites").select("*").eq("cabinet_id", cabinetId).maybeSingle();
  if (!site) return null;
  const [{ data: cab }, { data: pro }] = await Promise.all([
    db.from("cabinets").select(CABINET_COLS).eq("id", cabinetId).maybeSingle(),
    db.from("professionals").select("id, prenom, nom, slug, photo_url, telephone, domaines, email, honoraires_modes, paiement_moyens, services").eq(site.professional_id ? "id" : "cabinet_id", site.professional_id ?? cabinetId).limit(1).maybeSingle(),
  ]);
  const { data: motifs } = pro ? await db.from("motifs").select("id, libelle").eq("professional_id", pro.id).eq("actif", true).order("ordre") : { data: [] };
  return { site: site as SiteRow, cab, pro, rendu: siteRendu(site as SiteRow, cab, pro, motifs ?? []) };
}

/** Slug libre : prenom-nom-ville, puis -2, -3… si déjà pris. */
export async function slugDisponible(prenom: string, nom: string, ville: string, codePostal: string, domainePrincipal?: string | null) {
  const db = createAdminClient();
  const base = slugSite(prenom, nom, ville, codePostal, domainePrincipal);
  for (let i = 1; i < 50; i++) {
    const s = i === 1 ? base : `${base}-${i}`;
    if (SLUGS_RESERVES.has(s)) continue;
    const { count } = await db.from("sites").select("id", { count: "exact", head: true }).eq("slug", s);
    if (!count) return s;
  }
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ---------------------------------------------------------------------------------------------- */
/* Création à la fin du parcours (« Enregistrer mon site »).                                       */

export type Brouillon = {
  profession: Profession;
  cabinet: { nom: string; adresse: string; code_postal: string; ville: string; complement: string; telephone: string; email: string };
  prenom: string; nom: string; taille: Taille; domaines: string[];
  template: TemplateId; sections: SectionId[]; formule: Formule; palette: string;
};

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function brouillonValide(x: any): Brouillon | null {
  if (!x || typeof x !== "object") return null;
  const profession: Profession = x.profession === "comptable" ? "comptable" : "avocat";
  const conf = PROFESSIONS[profession];
  const b: Brouillon = {
    profession,
    cabinet: {
      nom: str(x.cabinet?.nom), adresse: str(x.cabinet?.adresse), code_postal: str(x.cabinet?.code_postal, 10), ville: str(x.cabinet?.ville, 80),
      complement: str(x.cabinet?.complement, 120), telephone: str(x.cabinet?.telephone, 30), email: str(x.cabinet?.email, 160).toLowerCase(),
    },
    prenom: str(x.prenom, 60), nom: str(x.nom, 60),
    taille: ["seul", "petit", "cabinet"].includes(x.taille) ? x.taille : "seul",
    domaines: Array.isArray(x.domaines) ? x.domaines.filter((d: unknown) => conf.domaines.some((c) => c.id === d)) : [],
    template: ["light", "moderne", "performance"].includes(x.template) ? x.template : "light",
    sections: Array.isArray(x.sections) ? x.sections.filter((s: unknown) => SECTIONS.some((c) => c.id === s)) : [],
    formule: x.formule === "contact" ? "contact" : "rdv",
    palette: palette(x.palette).id,
  };
  if (!b.cabinet.nom || !b.prenom || !b.nom || !b.cabinet.ville || !b.cabinet.telephone || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.cabinet.email)) return null;
  if (b.formule === "contact") b.sections = b.sections.filter((s) => s !== "actualites");
  return b;
}

/**
 * Crée (ou rattache) le cabinet, le professionnel, ses motifs et le site.
 * - Nouvel utilisateur : cabinet + professionnel créés, essai de 7 jours.
 * - Utilisateur déjà inscrit (widget) : le site est rattaché à son cabinet.
 */
export async function creerSite(user: { id: string; email: string }, b: Brouillon) {
  const db = createAdminClient();
  const { data: existant } = await db.from("professionals").select("id, cabinet_id, prenom, nom, slug").eq("auth_user_id", user.id).maybeSingle();

  let cabinetId = existant?.cabinet_id as string | null;
  let proId = existant?.id as string | null;
  let nouveauCompte = false;

  if (!cabinetId) {
    nouveauCompte = true;
    const { data: cab, error } = await db.from("cabinets").insert({
      profession: b.profession, nom: b.cabinet.nom, adresse: b.cabinet.adresse || null, code_postal: b.cabinet.code_postal || null, ville: b.cabinet.ville,
      telephone: b.cabinet.telephone || null, owner_auth_user_id: user.id,
      offre_site: true, offre_site_depuis: new Date().toISOString().slice(0, 10), offre_rdv: b.formule === "rdv",
    }).select("id").single();
    if (error || !cab) throw new Error(`cabinet : ${error?.message}`);
    cabinetId = cab.id;
  } else {
    const { data: deja } = await db.from("sites").select("slug").eq("cabinet_id", cabinetId).maybeSingle();
    if (deja) return { slug: deja.slug as string, cabinetId, nouveauCompte: false, dejaExistant: true };
    // Client existant (widget) : on garde sa prise de rdv, le site s'ajoute.
    await db.from("cabinets").update({ offre_site: true, offre_site_depuis: new Date().toISOString().slice(0, 10) }).eq("id", cabinetId);
  }

  if (!proId) {
    const slugPro = `${slugSite(b.prenom, b.nom, "", "")}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: pro, error } = await db.from("professionals").insert({
      auth_user_id: user.id, prenom: b.prenom, nom: b.nom, email: user.email, telephone: b.cabinet.telephone || null,
      slug: slugPro, ville: b.cabinet.ville, cabinet: b.cabinet.nom, cabinet_id: cabinetId, role: "titulaire", profession: b.profession,
      domaines: b.domaines, onboarding_step: "horaires",
    }).select("id").single();
    if (error || !pro) throw new Error(`professionnel : ${error?.message}`);
    proId = pro.id;
    // Motifs de rendez-vous préparés à partir des domaines (utilisés si la prise de rdv est active).
    const motifs = motifsDepuisDomaines(b.profession, b.domaines);
    await db.from("motifs").insert(motifs.map((m, i) => ({
      professional_id: proId, libelle: m.libelle, description: m.description, duree_min: m.duree_min, modes: m.modes,
      prix_type: m.prix_type, prix_euros: null, actif: m.actif, ordre: i,
    })));
  }

  const slug = await slugDisponible(b.prenom, b.nom, b.cabinet.ville, b.cabinet.code_postal, b.domaines[0]);
  const contenu = contenuParDefaut({ profession: b.profession, prenom: b.prenom, nom: b.nom, cabinet: b.cabinet.nom, ville: b.cabinet.ville, taille: b.taille, domaines: b.domaines, formule: b.formule });
  const { error } = await db.from("sites").insert({
    cabinet_id: cabinetId, professional_id: proId, profession: b.profession, slug, template: b.template, palette: b.palette,
    sections: b.sections.length ? b.sections : ["contact"], contenu, taille: b.taille, complement_adresse: b.cabinet.complement || null, email_contact: b.cabinet.email,
  });
  if (error) throw new Error(`site : ${error.message}`);
  return { slug, cabinetId: cabinetId!, nouveauCompte, dejaExistant: false };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
