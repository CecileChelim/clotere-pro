import { ics } from "@/lib/rdv/format";
import { adresseCabinet, libelleMotif, nomPro, rdvParTokenClient } from "@/lib/rdv/load";

// « Ajouter à mon agenda » depuis la page de suivi.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await rdvParTokenClient(token);
  if (!r || r.statut !== "confirmé") return new Response("Introuvable", { status: 404 });
  const body = ics({
    uid: r.id, debut: r.creneau_debut, fin: r.creneau_fin, titre: `Rendez-vous avec ${nomPro(r)}`,
    lieu: r.mode === "cabinet" ? adresseCabinet(r) : r.mode === "visio" ? "Visioconférence" : "Téléphone",
    description: libelleMotif(r),
  });
  return new Response(body, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="rendez-vous.ics"' } });
}
