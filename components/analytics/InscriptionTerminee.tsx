"use client";

import { useEffect } from "react";
import { FLAG_INSCRIPTION, pushEvent } from "@/lib/analytics";

// Arrivée sur /dashboard après la dernière étape de l'inscription.
export function InscriptionTerminee() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(FLAG_INSCRIPTION)) {
        sessionStorage.removeItem(FLAG_INSCRIPTION);
        pushEvent({ event: "inscription" });
      }
    } catch { /* stockage indisponible : on ignore */ }
  }, []);
  return null;
}
