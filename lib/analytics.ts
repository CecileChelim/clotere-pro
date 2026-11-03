/* Google Analytics (gtag.js) — un identifiant GA4 par domaine.
   Le plan de taggage s'appuie sur des événements poussés dans window.dataLayer. */

const GA_PAR_DOMAINE: { test: (h: string) => boolean; id: string }[] = [
  { test: (h) => h.includes("comptelio"), id: "G-MKZYNEZMC1" },
  { test: (h) => h.startsWith("comptable."), id: "G-KCBN2ZJLCH" },
  { test: (h) => h.startsWith("avocat."), id: "G-B6YYPRYP6F" },
];

/** Identifiant GA du domaine, ou null (localhost, previews Netlify…) pour ne pas polluer les stats. */
export function gaIdFromHost(host: string | null | undefined): string | null {
  const h = (host ?? "").split(":")[0].toLowerCase();
  return GA_PAR_DOMAINE.find((d) => d.test(h))?.id ?? null;
}

declare global {
  interface Window { dataLayer?: unknown[] }
}

/** Pousse un événement dans le dataLayer (sans aucune donnée saisie par l'utilisateur). */
export function pushEvent(data: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

/* L'événement « inscription » doit partir à l'arrivée sur /dashboard : on pose un drapeau
   juste avant la redirection, lu puis effacé par <InscriptionTerminee /> sur le dashboard. */
export const FLAG_INSCRIPTION = "clotere-inscription-terminee";
