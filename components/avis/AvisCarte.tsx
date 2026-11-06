"use client";

import { useState } from "react";
import { etoiles, type AvisRow } from "@/lib/avis";

const dateAvis = (a: AvisRow) =>
  a.publie_le ? new Date(a.publie_le).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : a.quand ?? "";

/** Un avis Google, avec la réponse du cabinet ou la réponse proposée par Clotere. */
export function AvisCarte({ avis, lienFiche }: { avis: AvisRow; lienFiche: string | null }) {
  const [a, setA] = useState(avis);
  const [texte, setTexte] = useState(avis.reponse_suggeree ?? "");
  const [occupe, setOccupe] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  async function action(nom: string, extra: Record<string, unknown> = {}) {
    setOccupe(nom);
    const r = await fetch(`/api/avis/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: nom, ...extra }) }).catch(() => null);
    const json = (await r?.json().catch(() => null)) as { ok?: boolean; avis?: AvisRow } | null;
    if (json?.ok && json.avis) { setA(json.avis); if (nom === "regenerer") setTexte(json.avis.reponse_suggeree ?? ""); }
    setOccupe(null);
  }

  async function copierEtOuvrir() {
    await navigator.clipboard.writeText(texte).catch(() => {});
    setCopie(true);
    setTimeout(() => setCopie(false), 2500);
    if (texte !== a.reponse_suggeree) action("enregistrer", { reponse: texte });
    if (lienFiche) window.open(lienFiche, "_blank", "noopener,noreferrer");
  }

  const aRepondre = a.statut === "a_repondre" && !a.reponse_google;

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        {a.photo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={a.photo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
          : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">{(a.auteur ?? "?")[0]}</span>}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-medium text-gray-950">{a.auteur ?? "Client"}</p>
            <p className="text-sm text-amber-500">{etoiles(a.note)}</p>
            <p className="text-xs text-gray-400">{dateAvis(a)}</p>
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${aRepondre ? "bg-amber-50 text-amber-800 ring-amber-200" : a.statut === "ignore" ? "bg-gray-100 text-gray-600 ring-gray-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"}`}>
              {aRepondre ? "À répondre" : a.statut === "ignore" ? "Ignoré" : "Répondu"}
            </span>
          </div>
          {a.texte ? <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-gray-700">{a.texte}</p> : <p className="mt-2 text-sm italic text-gray-400">Note sans commentaire</p>}

          {a.reponse_google ? (
            <div className="mt-4 border-l-2 border-gray-200 pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Votre réponse</p>
              <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{a.reponse_google}</p>
            </div>
          ) : aRepondre ? (
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Réponse proposée par Clotere</p>
                <p className="text-[11px] text-gray-400">Modifiable · sans détail du dossier</p>
              </div>
              <textarea value={texte} onChange={(e) => setTexte(e.target.value)} rows={Math.min(8, Math.max(4, texte.split("\n").length + 1))}
                className="mt-2 w-full resize-y rounded-xl border-0 bg-white p-3 text-sm leading-relaxed text-gray-800 ring-1 ring-gray-200 focus:ring-2 focus:ring-gray-950" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={copierEtOuvrir} className="rounded-full bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                  {copie ? "✓ Copiée, collez-la sur Google" : "Copier et répondre sur Google"}
                </button>
                <button type="button" onClick={() => action("repondu", { reponse: texte })} disabled={!!occupe} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-950 ring-1 ring-gray-300 hover:ring-gray-400 disabled:opacity-50">
                  {occupe === "repondu" ? "…" : "J'ai répondu"}
                </button>
                <button type="button" onClick={() => action("regenerer")} disabled={!!occupe} className="rounded-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-950 disabled:opacity-50">
                  {occupe === "regenerer" ? "Rédaction…" : "↻ Autre proposition"}
                </button>
                <button type="button" onClick={() => action("ignorer")} disabled={!!occupe} className="ml-auto px-2 py-2 text-xs text-gray-400 hover:text-gray-700 disabled:opacity-50">Ne pas répondre</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => action("a_repondre")} className="mt-3 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-700">Remettre « à répondre »</button>
          )}
        </div>
      </div>
    </div>
  );
}
