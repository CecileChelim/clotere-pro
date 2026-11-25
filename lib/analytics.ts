/* Tracking : Google Tag Manager (un conteneur par domaine, voir GTM_PAR_DOMAINE) + événements poussés dans window.dataLayer.
   Les balises et déclencheurs sont configurés côté GTM. Aucun événement ne contient de donnée saisie par l'utilisateur. */

/** Conteneur GTM par domaine. Domaines absents (localhost, previews Netlify…) : aucun conteneur chargé. */
export const GTM_PAR_DOMAINE: Record<string, string> = {
  "notaire.clotere.fr": "GTM-KMRCC4F4",
  "avocat.clotere.fr": "GTM-WPCDXXT9",
  "comptable.clotere.fr": "GTM-5PZD9QC8",
};

/** Domaines où le bandeau cookies Axeptio est affiché (+ localhost pour tester). */
export const AXEPTIO_DOMAINES = ["avocat.clotere.fr", "comptable.clotere.fr", "localhost"];

/** Réglages Axeptio (projet Clotere) avec Google Consent Mode v2 : tout refusé par défaut, mis à jour au clic. */
const AXEPTIO_SETTINGS = {
  clientId: "6992ea28e0ccf683b60f8e18",
  cookiesVersion: "a404a9ad-7fcf-4ba5-a7e7-d50ce0f04ac4",
  googleConsentMode: {
    default: {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    },
  },
};

/** Snippet posé en tout début de <head>, dans cet ordre :
    1. consentement par défaut (refusé) dans le dataLayer, AVANT GTM ;
    2. bandeau Axeptio (met à jour le consentement au clic) ;
    3. conteneur GTM du domaine. */
export const SNIPPET_GTM = `(function(w,d){
var h=w.location.hostname;
w.dataLayer=w.dataLayer||[];
function gtag(){w.dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
if(${JSON.stringify(AXEPTIO_DOMAINES)}.indexOf(h)!==-1){
w.axeptioSettings=${JSON.stringify(AXEPTIO_SETTINGS)};
var a=d.createElement('script'); a.async=true; a.src='https://static.axept.io/sdk.js';
d.head.appendChild(a);
}
var map=${JSON.stringify(GTM_PAR_DOMAINE)};
var id=map[h]; if(!id) return;
w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var s=d.createElement('script'); s.async=true;
s.src='https://www.googletagmanager.com/gtm.js?id='+id;
d.head.appendChild(s);
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
