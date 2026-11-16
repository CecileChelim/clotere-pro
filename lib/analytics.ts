/* Tracking : Google Tag Manager (un conteneur par domaine, voir GTM_PAR_DOMAINE) + événements poussés dans window.dataLayer.
   Les balises et déclencheurs sont configurés côté GTM. Aucun événement ne contient de donnée saisie par l'utilisateur. */

/** Conteneur GTM par domaine. Domaines absents (localhost, previews Netlify…) : aucun conteneur chargé. */
export const GTM_PAR_DOMAINE: Record<string, string> = {
  "notaire.clotere.fr": "GTM-KMRCC4F4",
  "avocat.clotere.fr": "GTM-WPCDXXT9",
  "comptable.clotere.fr": "GTM-5PZD9QC8",
};

/** Snippet GTM chargé selon le domaine (posé en tout début de <head>). */
export const SNIPPET_GTM = `(function(w,d){
var map=${JSON.stringify(GTM_PAR_DOMAINE)};
var id=map[w.location.hostname]; if(!id) return;
var s=d.createElement('script'); s.async=true;
s.src='https://www.googletagmanager.com/gtm.js?id='+id;
d.head.appendChild(s);
w.dataLayer=w.dataLayer||[];
function gtag(){w.dataLayer.push(arguments);}
gtag('js',new Date());
})(window,document);`;

declare global {
  interface Window { dataLayer?: unknown[] }
}

/** Pousse un événement dans le dataLayer (initialisé si besoin). */
export function pushEvent(data: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

/* Événements de fin de parcours, envoyés à l'arrivée sur le dashboard : on pose un drapeau juste avant la redirection,
   lu puis effacé par <FinDeParcours /> (une seule fois, même si la page est rechargée). */
export const FLAG_INSCRIPTION = "clotere-inscription-terminee"; // tunnel d'inscription (widget) → event « inscription »
export const FLAG_SITE_CREE = "clotere-site-cree";              // créateur de site → event « site_cree »
