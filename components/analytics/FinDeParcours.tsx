"use client";

import { useEffect } from "react";
import { FLAG_INSCRIPTION, FLAG_SITE_CREE, pushEvent } from "@/lib/analytics";

/** Sur le dashboard : envoie « inscription » ou « site_cree » si l'utilisateur arrive tout juste de son parcours. */
export function FinDeParcours() {
  useEffect(() => {
    try {
      for (const [flag, event] of [[FLAG_INSCRIPTION, "inscription"], [FLAG_SITE_CREE, "site_cree"]] as const) {
        const valeur = sessionStorage.getItem(flag);
        if (!valeur) continue;
        sessionStorage.removeItem(flag);
        pushEvent(event === "site_cree" ? { event, formule: valeur } : { event });
      }
    } catch { /* stockage indisponible : on ignore */ }
  }, []);
  return null;
}
