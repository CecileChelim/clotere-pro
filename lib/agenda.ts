import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { chiffrer, dechiffrer } from "@/lib/chiffrement";

/* Synchronisation Google Calendar / Outlook (mêmes applications OAuth que Clotere notaire). */

export type Provider = "google" | "outlook";
export type Intervalle = { debut: string; fin: string };

export const OAUTH = {
  google: {
    auth: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/calendar.events",
    id: () => process.env.GOOGLE_CLIENT_ID!,
    secret: () => process.env.GOOGLE_CLIENT_SECRET!,
  },
  outlook: {
    auth: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    token: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scope: "offline_access Calendars.Read Calendars.ReadWrite",
    id: () => process.env.OUTLOOK_CLIENT_ID!,
    secret: () => process.env.OUTLOOK_CLIENT_SECRET!,
  },
} as const;

export const redirectUri = (origin: string, p: Provider) => `${origin}/api/agenda/callback/${p}`;

export function urlConsentement(p: Provider, origin: string, state: string) {
  const o = OAUTH[p];
  const q = new URLSearchParams({
    client_id: o.id(), redirect_uri: redirectUri(origin, p), response_type: "code", scope: o.scope, state,
    ...(p === "google" ? { access_type: "offline", prompt: "consent", include_granted_scopes: "true" } : { prompt: "select_account" }),
  });
  return `${o.auth}?${q}`;
}

async function jeton(p: Provider, body: Record<string, string>, origin?: string) {
  const o = OAUTH[p];
  const res = await fetch(o.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: o.id(), client_secret: o.secret(), ...body,
      ...(p === "outlook" ? { scope: o.scope } : {}),
      ...(origin ? { redirect_uri: redirectUri(origin, p) } : {}),
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`OAuth ${p} : ${json.error_description || json.error || res.status}`);
  return json as { access_token: string; refresh_token?: string; expires_in: number };
}

export async function enregistrerConnexion(proId: string, p: Provider, code: string, origin: string) {
  const t = await jeton(p, { grant_type: "authorization_code", code }, origin);
  if (!t.refresh_token) throw new Error("Aucun jeton de rafraîchissement renvoyé : réessayez la connexion.");
  const db = createAdminClient();
  const { error } = await db.from("agenda_connexions").upsert({
    professional_id: proId, provider: p, refresh_token: chiffrer(t.refresh_token), access_token: chiffrer(t.access_token),
    expires_at: new Date(Date.now() + (t.expires_in - 60) * 1000).toISOString(), updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Enregistrement impossible : ${error.message}`);
  await db.from("professionals").update({ google_calendar_connected: true, agenda_provider: p }).eq("id", proId);
}

export async function deconnecter(proId: string) {
  const db = createAdminClient();
  await db.from("agenda_connexions").delete().eq("professional_id", proId);
  await db.from("professionals").update({ google_calendar_connected: false, agenda_provider: null }).eq("id", proId);
}

/** Jeton d'accès valide (rafraîchi si besoin), ou null si l'agenda n'est pas connecté. */
async function acces(proId: string): Promise<{ p: Provider; token: string } | null> {
  const db = createAdminClient();
  const { data: c } = await db.from("agenda_connexions").select("*").eq("professional_id", proId).maybeSingle();
  if (!c) return null;
  const p = c.provider as Provider;
  if (c.access_token && c.expires_at && new Date(c.expires_at).getTime() > Date.now()) return { p, token: dechiffrer(c.access_token) };
  try {
    const t = await jeton(p, { grant_type: "refresh_token", refresh_token: dechiffrer(c.refresh_token) });
    await db.from("agenda_connexions").update({
      access_token: chiffrer(t.access_token), expires_at: new Date(Date.now() + (t.expires_in - 60) * 1000).toISOString(),
      ...(t.refresh_token ? { refresh_token: chiffrer(t.refresh_token) } : {}), updated_at: new Date().toISOString(),
    }).eq("professional_id", proId);
    return { p, token: t.access_token };
  } catch (e) {
    console.error("[agenda] rafraîchissement impossible", proId, e);
    return null;
  }
}

/** Plages occupées dans l'agenda du pro entre deux dates (événements non « disponibles »). */
export async function plagesOccupees(proId: string, debut: Date, fin: Date): Promise<Intervalle[]> {
  const a = await acces(proId);
  if (!a) return [];
  try {
    if (a.p === "google") {
      const q = new URLSearchParams({ timeMin: debut.toISOString(), timeMax: fin.toISOString(), singleEvents: "true", maxResults: "2500", fields: "items(start,end,transparency,status)" });
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${q}`, { headers: { Authorization: `Bearer ${a.token}` } });
      if (!res.ok) throw new Error(`Google ${res.status}`);
      const items = (await res.json()).items ?? [];
      return items
        .filter((e: { status?: string; transparency?: string }) => e.status !== "cancelled" && e.transparency !== "transparent")
        .map((e: { start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string } }) => ({
          debut: new Date(e.start.dateTime ?? `${e.start.date}T00:00:00`).toISOString(),
          fin: new Date(e.end.dateTime ?? `${e.end.date}T00:00:00`).toISOString(),
        }));
    }
    const q = new URLSearchParams({ startDateTime: debut.toISOString(), endDateTime: fin.toISOString(), $select: "start,end,showAs,isCancelled", $top: "500" });
    const res = await fetch(`https://graph.microsoft.com/v1.0/me/calendarView?${q}`, { headers: { Authorization: `Bearer ${a.token}`, Prefer: 'outlook.timezone="UTC"' } });
    if (!res.ok) throw new Error(`Outlook ${res.status}`);
    const items = (await res.json()).value ?? [];
    return items
      .filter((e: { showAs?: string; isCancelled?: boolean }) => !e.isCancelled && e.showAs !== "free")
      .map((e: { start: { dateTime: string }; end: { dateTime: string } }) => ({
        debut: new Date(e.start.dateTime + "Z").toISOString(), fin: new Date(e.end.dateTime + "Z").toISOString(),
      }));
  } catch (e) {
    console.error("[agenda] lecture impossible", proId, e);
    return [];
  }
}

/** Crée l'événement dans l'agenda du pro. Renvoie l'id et, pour une visio, le lien (Meet ou Teams). */
export async function creerEvenement(proId: string, ev: {
  titre: string; description: string; debut: string; fin: string; lieu?: string; clientEmail: string; clientNom: string; visio: boolean; refId: string;
}): Promise<{ id: string; visio: string | null } | null> {
  const a = await acces(proId);
  if (!a) return null;
  try {
    if (a.p === "google") {
      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none", {
        method: "POST", headers: { Authorization: `Bearer ${a.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: ev.titre, description: ev.description, location: ev.lieu,
          start: { dateTime: ev.debut }, end: { dateTime: ev.fin },
          attendees: [{ email: ev.clientEmail, displayName: ev.clientNom }],
          ...(ev.visio ? { conferenceData: { createRequest: { requestId: ev.refId, conferenceSolutionKey: { type: "hangoutsMeet" } } } } : {}),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(`Google ${res.status} ${JSON.stringify(j.error ?? j)}`);
      return { id: j.id, visio: j.hangoutLink ?? null };
    }
    const corps = (enLigne: boolean) => JSON.stringify({
      subject: ev.titre, body: { contentType: "Text", content: ev.description },
      start: { dateTime: ev.debut.replace(/\.\d{3}Z$|Z$/, ""), timeZone: "UTC" }, end: { dateTime: ev.fin.replace(/\.\d{3}Z$|Z$/, ""), timeZone: "UTC" },
      location: ev.lieu ? { displayName: ev.lieu } : undefined,
      attendees: [{ emailAddress: { address: ev.clientEmail, name: ev.clientNom }, type: "required" }],
      ...(enLigne ? { isOnlineMeeting: true, onlineMeetingProvider: "teamsForBusiness" } : {}),
    });
    const post = (b: string) => fetch("https://graph.microsoft.com/v1.0/me/events", { method: "POST", headers: { Authorization: `Bearer ${a.token}`, "Content-Type": "application/json" }, body: b });
    let res = await post(corps(ev.visio));
    if (!res.ok && ev.visio) res = await post(corps(false)); // comptes Outlook personnels : pas de Teams
    const j = await res.json();
    if (!res.ok) throw new Error(`Outlook ${res.status} ${JSON.stringify(j.error ?? j)}`);
    return { id: j.id, visio: j.onlineMeeting?.joinUrl ?? null };
  } catch (e) {
    console.error("[agenda] création impossible", proId, e);
    return null;
  }
}

export async function supprimerEvenement(proId: string, eventId: string) {
  const a = await acces(proId);
  if (!a || !eventId) return;
  const url = a.p === "google"
    ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}?sendUpdates=none`
    : `https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(eventId)}`;
  const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${a.token}` } });
  if (!res.ok && res.status !== 404 && res.status !== 410) console.error("[agenda] suppression impossible", res.status);
}

/** Créneaux déjà pris : rendez-vous Clotere en cours + agenda connecté. */
export async function plagesIndisponibles(proId: string, debut: Date, fin: Date, sauf?: string): Promise<Intervalle[]> {
  const db = createAdminClient();
  let q = db.from("bookings").select("id, creneau_debut, creneau_fin").eq("professional_id", proId)
    .in("statut", ["demandé", "confirmé", "proposé"]).gte("creneau_fin", debut.toISOString()).lte("creneau_debut", fin.toISOString());
  if (sauf) q = q.neq("id", sauf);
  const jour = (d: Date) => d.toISOString().slice(0, 10);
  const qAbs = db.from("absences").select("debut, fin").eq("professional_id", proId).gte("fin", jour(debut)).lte("debut", jour(fin));
  const [{ data: rdv }, agenda, { data: abs }] = await Promise.all([q, plagesOccupees(proId, debut, fin), qAbs]);
  const clotere = (rdv ?? []).map((b) => ({ debut: b.creneau_debut, fin: b.creneau_fin }));
  // Absence = journées entières (heure de Paris), du premier jour 00:00 au lendemain du dernier jour 00:00.
  const absences = (abs ?? []).map((a: { debut: string; fin: string }) => {
    const lendemain = new Date(`${a.fin}T12:00:00Z`); lendemain.setUTCDate(lendemain.getUTCDate() + 1);
    return { debut: minuitParis(a.debut).toISOString(), fin: minuitParis(jour(lendemain)).toISOString() };
  });
  return [...clotere, ...agenda, ...absences];
}

/** Minuit (heure de Paris) du jour AAAA-MM-JJ. */
function minuitParis(d: string) {
  const utc = new Date(`${d}T00:00:00Z`);
  const decalage = new Date(utc.toLocaleString("en-US", { timeZone: "Europe/Paris" })).getTime() - new Date(utc.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
  return new Date(utc.getTime() - decalage);
}

export const chevauche = (a: Intervalle, b: Intervalle) => new Date(a.debut) < new Date(b.fin) && new Date(b.debut) < new Date(a.fin);
