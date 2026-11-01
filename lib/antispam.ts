import "server-only";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const LIMITES = [
  { fenetreMin: 10, max: 3 },        // 3 demandes en 10 minutes
  { fenetreMin: 24 * 60, max: 10 },  // 10 demandes par jour
];

export function ipDe(req: Request) {
  return (req.headers.get("x-nf-client-connection-ip")
    || req.headers.get("x-forwarded-for")?.split(",")[0]
    || req.headers.get("x-real-ip")
    || "inconnue").trim();
}

/** Enregistre une tentative et indique si l'IP a dépassé une limite. L'IP est hachée (RGPD). */
export async function limiteAtteinte(req: Request): Promise<boolean> {
  const db = createAdminClient();
  const ip_hash = createHash("sha256").update(`${ipDe(req)}|${process.env.AGENDA_ENC_KEY ?? "clotere"}`).digest("hex");
  for (const l of LIMITES) {
    const depuis = new Date(Date.now() - l.fenetreMin * 60000).toISOString();
    const { count } = await db.from("rdv_tentatives").select("id", { count: "exact", head: true }).eq("ip_hash", ip_hash).gte("created_at", depuis);
    if ((count ?? 0) >= l.max) return true;
  }
  await db.from("rdv_tentatives").insert({ ip_hash });
  // Ménage : on ne garde pas les tentatives au-delà de 48 h.
  if (Math.random() < 0.05) await db.from("rdv_tentatives").delete().lt("created_at", new Date(Date.now() - 48 * 3600e3).toISOString());
  return false;
}

/** Même client (email) : 3 demandes en attente maximum chez un même pro. */
export async function tropDeDemandesClient(proId: string, email: string) {
  const { count } = await createAdminClient().from("bookings").select("id", { count: "exact", head: true })
    .eq("professional_id", proId).eq("client_email", email).eq("statut", "demandé");
  return (count ?? 0) >= 3;
}
