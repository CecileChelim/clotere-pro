"use client";

import { useState } from "react";

const BUDGETS = ["Moins de 500 €", "500 à 1 000 €", "1 000 à 3 000 €", "Plus de 3 000 €", "Je ne sais pas encore"];

/** Demande de rappel Google Ads : budget envisagé + téléphone, notification Slack à l'équipe. */
export function RappelAds({ telephone, dejaDemande }: { telephone: string | null; dejaDemande: boolean }) {
  const [etat, setEtat] = useState<"idle" | "envoi" | "ok" | "erreur">(dejaDemande ? "ok" : "idle");
  const [budget, setBudget] = useState("");
  const [tel, setTel] = useState(telephone ?? "");

  if (etat === "ok") {
    return <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">✓ Demande reçue : nous vous rappelons sous 24 h ouvrées.</p>;
  }
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      setEtat("envoi");
      const r = await fetch("/api/google-ads/rappel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ budget, telephone: tel }) }).catch(() => null);
      setEtat(r?.ok ? "ok" : "erreur");
    }}>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-950">Budget publicitaire mensuel envisagé</label>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <button key={b} type="button" onClick={() => setBudget(b)}
              className={`rounded-full px-3.5 py-1.5 text-sm ring-1 transition ${budget === b ? "bg-gray-950 text-white ring-gray-950" : "bg-white text-gray-700 ring-gray-200 hover:ring-gray-400"}`}>{b}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-950">Téléphone pour vous rappeler</label>
        <input type="tel" required value={tel} onChange={(e) => setTel(e.target.value)} className="input" placeholder="06 12 34 56 78" />
      </div>
      <button type="submit" disabled={etat === "envoi"} className="btn-outline w-full disabled:opacity-50">{etat === "envoi" ? "Envoi…" : "Être rappelé"}</button>
      {etat === "erreur" && <p className="text-sm text-red-600">L&apos;envoi a échoué, réessayez ou réservez une démo.</p>}
    </form>
  );
}
