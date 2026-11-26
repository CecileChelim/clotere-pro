"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CLE_BROUILLON } from "@/components/mon-site/Createur";
import { FLAG_SITE_CREE } from "@/lib/analytics";

/* Retour de la connexion Google ou du lien reçu par e-mail : on crée le site à partir du brouillon gardé dans le navigateur. */
export default function FinaliserPage() {
  const [erreur, setErreur] = useState("");
  // Une seule création, même si l'effet est rejoué (mode strict de React en local, retour arrière…).
  const lance = useRef(false);

  useEffect(() => {
    if (lance.current) return;
    lance.current = true;
    (async () => {
      let brouillon: unknown = null;
      try { brouillon = JSON.parse(localStorage.getItem(CLE_BROUILLON) ?? "null"); } catch { /* */ }
      if (!brouillon) { window.location.href = "/creer-mon-site"; return; }
      const r = await fetch("/api/site/creer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brouillon) }).catch(() => null);
      const j = (await r?.json().catch(() => null)) as { ok?: boolean; error?: string; paiement?: string | null } | null;
      if (j?.ok) {
        try {
          localStorage.removeItem(CLE_BROUILLON);
          sessionStorage.setItem(FLAG_SITE_CREE, (brouillon as { formule?: string }).formule === "contact" ? "contact" : "rdv");
        } catch { /* */ }
      // Formule page : paiement du site avant sa mise en ligne.
      if (j.paiement === "checkout") {
        const p = await fetch("/api/options/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ option: "site" }) }).catch(() => null);
        const pj = (await p?.json().catch(() => null)) as { url?: string } | null;
        if (pj?.url) { window.location.href = pj.url; return; }
      }
        window.location.href = "/dashboard/site?nouveau=1";
        return;
      }
      setErreur(j?.error ?? "La création du site a échoué.");
    })();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
      {erreur ? (
        <div>
          <p className="text-lg font-medium text-gray-950">{erreur}</p>
          <Link href="/creer-mon-site" className="btn-solid mt-6">Revenir au créateur de site</Link>
        </div>
      ) : (
        <p className="text-lg text-gray-700">Création de votre site…</p>
      )}
    </main>
  );
}
