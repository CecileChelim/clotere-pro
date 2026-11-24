"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Doc = { id: string; libelle: string; nom_fichier: string; taille: number; created_at: string };

const TAILLE_MAX = 10 * 1024 * 1024;
const fmtTaille = (o: number) => (o < 1024 * 1024 ? `${Math.max(1, Math.round(o / 1024))} Ko` : `${(o / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`);

/** Page de suivi : le client transmet des PDF au cabinet (demandés en général par e-mail). */
export function DepotDocuments({ token, initiaux, nomPro }: { token: string; initiaux: Doc[]; nomPro: string }) {
  const [docs, setDocs] = useState(initiaux);
  const [libelle, setLibelle] = useState("");
  const [fichier, setFichier] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const api = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/rdv/suivi/${token}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) throw new Error(j.error || "Une erreur est survenue");
    return j;
  };

  function choisir(f: File | null) {
    setError(""); setFlash("");
    if (f && f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) { setError("Seuls les fichiers PDF sont acceptés."); f = null; }
    else if (f && f.size > TAILLE_MAX) { setError("Ce fichier dépasse 10 Mo. Compressez-le ou découpez-le en plusieurs PDF."); f = null; }
    setFichier(f);
    if (!f && input.current) input.current.value = "";
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!fichier || !libelle.trim()) return;
    setBusy(true); setError(""); setFlash("");
    try {
      const { chemin, jeton } = await api({ action: "preparer", taille: fichier.size });
      const { error: up } = await createClient().storage.from("documents").uploadToSignedUrl(chemin, jeton, fichier, { contentType: "application/pdf" });
      if (up) throw new Error("L'envoi du fichier a échoué, réessayez.");
      const { document } = await api({ action: "enregistrer", chemin, libelle, nom: fichier.name });
      setDocs((l) => [...l, document]);
      setLibelle(""); choisir(null);
      setFlash(`✓ Document transmis à ${nomPro}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
    setBusy(false);
  }

  async function retirer(id: string) {
    if (!confirm("Retirer ce document ? Il ne sera plus accessible au cabinet.")) return;
    try { await api({ action: "retirer", id }); setDocs((l) => l.filter((d) => d.id !== id)); }
    catch (err) { setError(err instanceof Error ? err.message : "Une erreur est survenue"); }
  }

  return (
    <div className="border-t border-gray-100 px-6 py-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mes documents</p>
      <p className="mt-1 text-sm text-gray-500">Transmettez ici les documents demandés par {nomPro}. Ils sont supprimés définitivement à la clôture du dossier.</p>

      {docs.length > 0 && (
        <ul className="mt-4 divide-y divide-gray-100 rounded-xl ring-1 ring-gray-200">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[10px] font-bold text-red-600">PDF</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900">{d.libelle}</span>
                <span className="block truncate text-xs text-gray-500">{d.nom_fichier} · {fmtTaille(d.taille)}</span>
              </span>
              <button type="button" onClick={() => retirer(d.id)} className="shrink-0 text-xs text-gray-400 hover:text-red-600">Retirer</button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={envoyer} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm font-semibold text-gray-900">De quels documents s&apos;agit-il ?</span>
          <input type="text" value={libelle} onChange={(e) => setLibelle(e.target.value)} maxLength={200} required
            placeholder="Ex. : contrat de travail et 3 derniers bulletins de paie"
            className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-violet-600" />
        </label>
        <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 text-sm transition ${fichier ? "border-violet-300 bg-violet-50/50" : "border-gray-200 hover:border-gray-300"}`}>
          <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => choisir(e.target.files?.[0] ?? null)} />
          <span className="font-semibold text-violet-700">{fichier ? "Changer" : "Choisir un PDF"}</span>
          <span className="min-w-0 flex-1 truncate text-gray-500">{fichier ? `${fichier.name} · ${fmtTaille(fichier.size)}` : "PDF uniquement, 10 Mo maximum"}</span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {flash && <p className="text-sm text-emerald-700">{flash}</p>}
        <button type="submit" disabled={busy || !fichier || !libelle.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40">
          {busy ? "Envoi en cours…" : "Envoyer le document"}
        </button>
      </form>
    </div>
  );
}
