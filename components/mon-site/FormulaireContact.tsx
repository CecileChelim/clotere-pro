"use client";

import { useState } from "react";

/** Formulaire de contact du site (formule 69 €). Les messages arrivent dans l'espace du cabinet + par e-mail. */
export function FormulaireContact({ siteId, apercu, variante }: { siteId: string | null; apercu: boolean; variante: "clair" | "sombre" }) {
  const [etat, setEtat] = useState<"idle" | "envoi" | "ok" | "erreur">("idle");
  const [erreur, setErreur] = useState("");
  const sombre = variante === "sombre";
  const champ = `w-full px-4 py-3.5 text-sm outline-none transition ${sombre
    ? "bg-transparent ring-1 ring-white/20 placeholder:text-white/50 focus:ring-white/60"
    : "rounded-xl bg-white ring-1 ring-gray-200 placeholder:text-gray-400 focus:ring-gray-500"}`;

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (apercu || !siteId) return;
    setEtat("envoi"); setErreur("");
    const f = new FormData(e.currentTarget);
    const r = await fetch("/api/site/contact", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId, ...Object.fromEntries(f.entries()) }),
    }).catch(() => null);
    const j = (await r?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (j?.ok) { setEtat("ok"); return; }
    setEtat("erreur"); setErreur(j?.error ?? "L'envoi a échoué, réessayez dans un instant.");
  }

  if (etat === "ok") {
    return (
      <div className={`p-8 text-center ${sombre ? "ring-1 ring-white/20" : "rounded-2xl bg-white ring-1 ring-gray-200"}`} style={{ color: sombre ? "var(--s-sur-sombre)" : "#101828" }}>
        <p className="text-lg font-semibold">Message envoyé, merci !</p>
        <p className="mt-2 text-sm opacity-70">Nous revenons vers vous très vite.</p>
      </div>
    );
  }

  return (
    <form onSubmit={envoyer} className={`space-y-3 ${sombre ? "" : "rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 @3xl:p-8"}`} style={{ color: sombre ? "var(--s-sur-sombre)" : "#101828" }}>
      <div className="grid gap-3 @md:grid-cols-2">
        <input name="prenom" placeholder="Prénom" className={champ} autoComplete="given-name" />
        <input name="nom" required placeholder="Nom" className={champ} autoComplete="family-name" />
      </div>
      <input name="email" type="email" required placeholder="E-mail" className={champ} autoComplete="email" />
      <input name="telephone" type="tel" placeholder="Téléphone" className={champ} autoComplete="tel" />
      <input name="objet" placeholder="Objet de votre demande" className={champ} />
      <textarea name="message" required rows={4} placeholder="Votre message" className={champ} />
      {/* Piège à robots : champ invisible qui doit rester vide. */}
      <input name="site_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button type="submit" disabled={etat === "envoi"} className={`w-full px-5 py-3.5 text-sm font-semibold transition disabled:opacity-60 ${sombre ? "" : "rounded-xl"}`}
        style={{ background: "var(--s-accent)", color: "var(--s-sur-accent)" }}>
        {apercu ? "Envoyer ma demande (aperçu)" : etat === "envoi" ? "Envoi…" : "Envoyer ma demande"}
      </button>
      {etat === "erreur" && <p className="text-sm text-red-500">{erreur}</p>}
      <p className="text-xs opacity-60">Vos informations servent uniquement à répondre à votre demande.</p>
    </form>
  );
}
