import "server-only";
import { promises as dns } from "node:dns";

/* Nom de domaine personnalisé du site d'un cabinet.
   Le pro ajoute chez son hébergeur de domaine :
     - www  CNAME  <site>.netlify.app          (obligatoire)
     - @    A      75.2.60.5                   (load balancer Netlify, pour le domaine nu)
   puis on vérifie la résolution DNS et on déclare le domaine sur Netlify (HTTPS automatique). */

export const IP_NETLIFY = "75.2.60.5";
export const CIBLE_CNAME = `${process.env.NETLIFY_SITE_NAME || "clotere-pro"}.netlify.app`;

/** "https://www.Cabinet-Tellier.fr/" -> "cabinet-tellier.fr" ; null si invalide. */
export function normaliserDomaine(saisie: string): string | null {
  const d = saisie.trim().toLowerCase()
    .replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").replace(/\.$/, "");
  if (!/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(d)) return null;
  if (/(^|\.)clotere\.fr$|netlify\.app$/.test(d)) return null;
  return d;
}

export type Verification = {
  www: { ok: boolean; trouve: string[] };
  racine: { ok: boolean; trouve: string[] };
};

async function essai<T>(f: () => Promise<T[]>): Promise<T[]> {
  try { return await f(); } catch { return []; }
}

/** Vérifie les deux enregistrements. www suffit pour connecter le site ; la racine est conseillée. */
export async function verifierDns(domaine: string): Promise<Verification> {
  const [cnameWww, aWww, aRacine] = await Promise.all([
    essai(() => dns.resolveCname(`www.${domaine}`)),
    essai(() => dns.resolve4(`www.${domaine}`)),
    essai(() => dns.resolve4(domaine)),
  ]);
  const cible = CIBLE_CNAME.toLowerCase();
  const wwwOk = cnameWww.some((c) => c.toLowerCase().replace(/\.$/, "") === cible) || aWww.includes(IP_NETLIFY);
  return {
    www: { ok: wwwOk, trouve: cnameWww.length ? cnameWww : aWww },
    racine: { ok: aRacine.includes(IP_NETLIFY), trouve: aRacine },
  };
}

/** Déclare le domaine sur le site Netlify (alias), ce qui déclenche le certificat HTTPS.
    Sans NETLIFY_API_TOKEN / NETLIFY_SITE_ID, ne fait rien (à déclarer à la main dans Netlify). */
export async function declarerSurNetlify(domaine: string, action: "ajout" | "retrait"): Promise<{ ok: boolean; raison?: string }> {
  const token = process.env.NETLIFY_API_TOKEN, site = process.env.NETLIFY_SITE_ID;
  if (!token || !site) return { ok: false, raison: "NETLIFY_API_TOKEN / NETLIFY_SITE_ID non configurés" };
  const api = `https://api.netlify.com/api/v1/sites/${site}`;
  const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const r = await fetch(api, { headers: h });
  if (!r.ok) return { ok: false, raison: `Netlify ${r.status}` };
  const { domain_aliases = [] } = (await r.json()) as { domain_aliases?: string[] };
  const voulus = [domaine, `www.${domaine}`];
  const alias = action === "ajout"
    ? [...new Set([...domain_aliases, ...voulus])]
    : domain_aliases.filter((a) => !voulus.includes(a));
  const p = await fetch(api, { method: "PATCH", headers: h, body: JSON.stringify({ domain_aliases: alias }) });
  return p.ok ? { ok: true } : { ok: false, raison: `Netlify ${p.status}` };
}
