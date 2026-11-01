import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/* Appels Stripe sans SDK (API REST, paramètres encodés en formulaire). */

function encoder(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    if (v === undefined || v === null) return [];
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) return v.flatMap((x, i) => (typeof x === "object" ? encoder(x as Record<string, unknown>, `${key}[${i}]`) : [`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(x))}`]));
    if (typeof v === "object") return encoder(v as Record<string, unknown>, key);
    return [`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`];
  });
}

export async function stripe<T = Record<string, unknown>>(path: string, params?: Record<string, unknown>, method: "GET" | "POST" = params ? "POST" : "GET"): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante");
  const body = params ? encoder(params).join("&") : undefined;
  const res = await fetch(`https://api.stripe.com/v1/${path}${method === "GET" && body ? `?${body}` : ""}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: method === "POST" ? body : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Stripe ${res.status} : ${json?.error?.message ?? "erreur"}`);
  return json as T;
}

/** Vérifie la signature d'un webhook Stripe (en-tête Stripe-Signature). */
export function webhookValide(payload: string, entete: string | null, secret: string, toleranceSec = 300) {
  if (!entete) return false;
  const parts = Object.fromEntries(entete.split(",").map((p) => p.split("=") as [string, string]).filter(([k]) => k === "t"));
  const t = parts.t;
  const signatures = entete.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!t || !signatures.length || Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;
  const attendu = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return signatures.some((s) => s.length === attendu.length && timingSafeEqual(Buffer.from(s), Buffer.from(attendu)));
}
