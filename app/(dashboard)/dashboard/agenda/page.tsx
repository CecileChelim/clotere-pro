import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { AgendaSettings, type Onglet } from "@/components/pro/AgendaSettings";
import { EnTetePage } from "@/components/dashboard/EnTetePage";
import type { MotifDraft } from "@/lib/professions-config";
import { horairesDepuisRows } from "@/lib/horaires";
import { RdvPresentation } from "@/components/mon-site/Upsells";

export default async function DashboardAgendaPage({ searchParams }: { searchParams: Promise<{ agenda?: string; detail?: string; onglet?: string }> }) {
  const { agenda, detail, onglet } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/agenda");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: pro } = await db.from("professionals").select("id, slug, prenom, nom, email, telephone, profession, google_calendar_connected, agenda_provider, cabinet:cabinets(offre_rdv, nom, telephone)").eq("auth_user_id", user.id).maybeSingle();
  if (!pro) redirect("/inscription");
  const cab = Array.isArray(pro.cabinet) ? pro.cabinet[0] : pro.cabinet;
  if (cab?.offre_rdv === false) return <RdvPresentation page="agenda" />;
  const host = (await headers()).get("host") ?? "avocat.clotere.fr";
  const base = `${host.includes("localhost") ? "http" : "https"}://${host}`;

  const { data: rows } = await db.from("motifs").select("*").eq("professional_id", pro.id).order("ordre");
  const motifs: MotifDraft[] = (rows ?? []).map((r: Record<string, unknown>) => ({
    libelle: (r.libelle as string) ?? "", description: (r.description as string) ?? "", duree_min: (r.duree_min as number) ?? 30,
    modes: (r.modes as MotifDraft["modes"]) ?? ["visio", "telephone"], prix_type: "gratuit", prix_euros: null, actif: (r.actif as boolean) ?? true,
  }));

  const auj = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
  const [{ data: dispo }, { data: abs }] = await Promise.all([
    db.from("availability").select("jour_semaine, heure_debut, heure_fin, date").eq("professional_id", pro.id),
    db.from("absences").select("id, debut, fin, motif").eq("professional_id", pro.id).gte("fin", auj).order("debut"),
  ]);

  return (
    <div>
      <EnTetePage section="Agenda" titre="Agenda & prise de rendez-vous" />
      <AgendaSettings proId={pro.id} motifsInit={motifs} connected={!!pro.google_calendar_connected} provider={pro.agenda_provider ?? null} retour={agenda ?? null} detail={detail ?? null}
        horairesInit={horairesDepuisRows(dispo)} absencesInit={abs ?? []} ongletInit={(["motifs", "site", "linkedin", "mail", "google"].includes(onglet ?? "") ? onglet : "agenda") as Onglet}
        diffusion={{
          proId: pro.id, slug: pro.slug, base, nom: `${pro.profession === "avocat" ? "Maître " : ""}${pro.prenom} ${pro.nom}`,
          office: cab?.nom || `Cabinet ${pro.nom}`, cabinetNom: cab?.nom ?? null, telephone: cab?.telephone || pro.telephone,
          email: pro.email, metier: pro.profession === "comptable" ? "Expert-comptable" : "Avocat",
        }} />
    </div>
  );
}
