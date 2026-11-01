import "server-only";

/* Notifications Slack via webhooks entrants : un channel par métier.
   SLACK_WEBHOOK_AVOCAT → channel avocats, SLACK_WEBHOOK_COMPTABLE → channel experts-comptables.
   Sans webhook configuré, rien n'est envoyé (simple ligne dans les logs). Ne bloque jamais l'action en cours. */

type Profession = string | null | undefined;

const webhook = (p: Profession) =>
  p === "comptable" ? process.env.SLACK_WEBHOOK_COMPTABLE : process.env.SLACK_WEBHOOK_AVOCAT;

export async function notifierSlack(profession: Profession, titre: string, champs: [string, string | null | undefined][] = [], lien?: { url: string; label: string }) {
  const url = webhook(profession);
  const lignes = champs.filter(([, v]) => v).map(([k, v]) => `*${k}* : ${v}`);
  if (!url) { console.log(`[slack:${profession ?? "avocat"}]`, titre, lignes.join(" · ")); return; }
  const blocks: unknown[] = [{ type: "section", text: { type: "mrkdwn", text: `*${titre}*${lignes.length ? "\n" + lignes.join("\n") : ""}` } }];
  if (lien) blocks.push({ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: lien.label }, url: lien.url }] });
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: titre, blocks }), signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) console.error("[slack]", res.status, await res.text());
  } catch (e) {
    console.error("[slack]", e);
  }
}

/** Retrouve le métier et le titulaire d'un cabinet (pour router la notification). */
export async function infosCabinet(cabinetId: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const db = createAdminClient();
  const [{ data: cab }, { data: pros }] = await Promise.all([
    db.from("cabinets").select("nom, ville").eq("id", cabinetId).maybeSingle(),
    db.from("professionals").select("prenom, nom, email, profession, role").eq("cabinet_id", cabinetId),
  ]);
  const t = (pros ?? []).find((p) => p.role !== "membre") ?? pros?.[0];
  return { cabinet: cab?.nom ?? "Cabinet", ville: cab?.ville ?? null, profession: t?.profession ?? "avocat", contact: t ? `${t.prenom ?? ""} ${t.nom ?? ""} · ${t.email}`.trim() : null, nb: pros?.length ?? 0 };
}
