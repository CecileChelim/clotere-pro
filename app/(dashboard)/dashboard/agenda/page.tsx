import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AgendaSettings } from "@/components/pro/AgendaSettings";
import type { MotifDraft } from "@/lib/professions-config";
import { horairesDepuisRows } from "@/lib/horaires";

export default async function DashboardAgendaPage({ searchParams }: { searchParams: Promise<{ agenda?: string; detail?: string; onglet?: string }> }) {
  const { agenda, detail, onglet } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/agenda");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: pro } = await db.from("professionals").select("id, google_calendar_connected, agenda_provider").eq("auth_user_id", user.id).maybeSingle();
  if (!pro) redirect("/inscription");

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
      <p className="eyebrow">Agenda</p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight text-gray-950">Agenda & prise de rendez-vous</h1>
      <AgendaSettings proId={pro.id} motifsInit={motifs} connected={!!pro.google_calendar_connected} provider={pro.agenda_provider ?? null} retour={agenda ?? null} detail={detail ?? null}
        horairesInit={horairesDepuisRows(dispo)} absencesInit={abs ?? []} ongletInit={onglet === "motifs" ? "motifs" : "agenda"} />
    </div>
  );
}
