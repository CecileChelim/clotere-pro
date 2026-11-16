"use client";

import { useEffect, useState } from "react";

type PhotoUnsplash = { id: string; alt: string; vignette: string; url: string; auteur: string; lienAuteur: string; download: string };

/** Choix d'une photo de couverture : suggestions de recherche + résultats Unsplash. */
export function ChoixUnsplash({ suggestions, onChoix }: { suggestions: string[]; onChoix: (url: string, auteur: string, lienAuteur: string) => void }) {
  const [q, setQ] = useState(suggestions[0] ?? "bureau");
  const [saisie, setSaisie] = useState("");
  const [photos, setPhotos] = useState<PhotoUnsplash[]>([]);
  const [etat, setEtat] = useState<"chargement" | "ok" | "sansCle" | "erreur">("chargement");

  useEffect(() => {
    let annule = false;
    fetch(`/api/unsplash?q=${encodeURIComponent(q)}`)
      .then(async (r) => ({ status: r.status, j: (await r.json().catch(() => ({}))) as { photos?: PhotoUnsplash[] } }))
      .then(({ status, j }) => {
        if (annule) return;
        if (status === 501) { setEtat("sansCle"); return; }
        setPhotos(j.photos ?? []); setEtat(j.photos ? "ok" : "erreur");
      })
      .catch(() => !annule && setEtat("erreur"));
    return () => { annule = true; };
  }, [q]);

  const lienUnsplash = `https://unsplash.com/fr/s/photos/${encodeURIComponent(q.replace(/\s+/g, "-"))}?orientation=landscape`;

  return (
    <div className="mt-3 rounded-xl bg-gray-50 p-3 ring-1 ring-black/5">
      <p className="text-xs font-medium text-gray-700">Pas de photo ? Choisissez-en une parmi des photos libres de droits</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button key={s} type="button" onClick={() => { setEtat("chargement"); setQ(s); }}
            className={`rounded-full px-2.5 py-1 text-xs ring-1 ${q === s ? "bg-gray-950 text-white ring-gray-950" : "bg-white text-gray-700 ring-gray-200 hover:ring-gray-400"}`}>{s}</button>
        ))}
      </div>
      <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (saisie.trim()) { setEtat("chargement"); setQ(saisie.trim()); } }}>
        <input value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder="Autre recherche (ex. Lyon, bureau lumineux…)"
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-gray-950" />
        <button type="submit" className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-gray-200 hover:ring-gray-400">Chercher</button>
      </form>

      {etat === "sansCle" ? (
        <p className="mt-3 text-xs text-gray-600">
          Trouvez une photo sur <a href={lienUnsplash} target="_blank" rel="noopener noreferrer" className="font-medium underline">Unsplash</a> (gratuite, libre de droits),
          téléchargez-la puis ajoutez-la avec le bouton ci-dessus.
        </p>
      ) : etat === "chargement" ? (
        <p className="mt-3 text-xs text-gray-500">Recherche…</p>
      ) : etat === "erreur" || !photos.length ? (
        <p className="mt-3 text-xs text-gray-500">Aucune photo trouvée. Essayez une autre recherche, ou <a href={lienUnsplash} target="_blank" rel="noopener noreferrer" className="underline">cherchez sur Unsplash</a>.</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {photos.map((p) => (
              <button key={p.id} type="button" title={`Photo de ${p.auteur}`} className="group relative aspect-[4/3] overflow-hidden rounded-md ring-1 ring-black/5 hover:ring-2 hover:ring-gray-950"
                onClick={() => {
                  onChoix(p.url, p.auteur, p.lienAuteur);
                  fetch("/api/unsplash", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ download: p.download }) }).catch(() => {});
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.vignette} alt={p.alt} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">Photos <a href="https://unsplash.com/?utm_source=clotere&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a> · crédit affiché dans vos mentions légales</p>
        </>
      )}
    </div>
  );
}
