"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { markdownVersHtml, nbMots } from "@/lib/markdown";
import { limiteRelecture, moisLabel, STATUT_ARTICLE, type Article } from "@/lib/visibilite";

const prose = "text-[15px] leading-relaxed text-gray-700 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-gray-950 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-gray-950 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1 [&_strong]:text-gray-950";
const dateLongue = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });

export function RelectureArticle({ article: a }: { article: Article }) {
  const router = useRouter();
  const modifiable = a.statut === "a_relire" || a.statut === "modifs_demandees";
  const [titre, setTitre] = useState(a.titre);
  const [contenu, setContenu] = useState(a.contenu);
  const [edition, setEdition] = useState(false);
  const [demande, setDemande] = useState<string | null>(null);
  const [busy, setBusy] = useState<"" | "enregistrer" | "valider" | "modifs">("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const change = titre !== a.titre || contenu !== a.contenu;
  const html = useMemo(() => markdownVersHtml(contenu), [contenu]);
  const st = STATUT_ARTICLE[a.statut];

  async function agir(action: "enregistrer" | "valider" | "modifs") {
    setBusy(action); setMsg(null);
    const r = await fetch(`/api/visibilite/articles/${a.id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...(change ? { titre, contenu } : {}), ...(action === "modifs" ? { commentaire: demande } : {}) }),
    });
    const j = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) { setMsg({ ok: false, t: j.error || "Une erreur est survenue." }); return; }
    if (action === "enregistrer") { setMsg({ ok: true, t: "Corrections enregistrées." }); setEdition(false); router.refresh(); return; }
    router.push("/dashboard/visibilite");
    router.refresh();
  }

  return (
    <div>
      <Link href="/dashboard/visibilite" className="text-sm text-gray-500 hover:text-gray-950">← Visibilité</Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${st.classe}`}>{st.label}</span>
        <span className="text-sm capitalize text-gray-500">{moisLabel(a.mois)}</span>
        {a.mot_cle && <span className="text-sm text-gray-500">· Requête visée : « {a.mot_cle} »</span>}
        <span className="text-sm text-gray-400">· {nbMots(contenu)} mots</span>
      </div>

      {a.statut === "a_relire" && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Relisez, corrigez si besoin, puis validez. Sans retour d&apos;ici le {dateLongue(limiteRelecture(a.pousse_le))}, l&apos;article sera validé automatiquement.
        </p>
      )}
      {a.statut === "modifs_demandees" && a.commentaire_client && (
        <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-900 ring-1 ring-sky-200">
          <p className="font-medium">Vos remarques ont bien été transmises :</p>
          <p className="mt-1 whitespace-pre-line">{a.commentaire_client}</p>
        </div>
      )}
      {a.statut === "publie" && a.url_publication && (
        <p className="mt-4 text-sm">Publié : <a href={a.url_publication} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-950 underline">{a.url_publication}</a></p>
      )}

      <div className="card mt-6 p-6 sm:p-10">
        {edition ? (
          <div className="space-y-4">
            <input value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-xl font-medium text-gray-950 outline-none focus:border-gray-950" />
            <textarea value={contenu} onChange={(e) => setContenu(e.target.value)} rows={24}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm leading-relaxed text-gray-800 outline-none focus:border-gray-950" />
            <p className="text-xs text-gray-500">Mise en forme : « ## » pour un intertitre, « - » pour une liste, **texte** pour du gras.</p>
          </div>
        ) : (
          <article>
            <h1 className="text-3xl font-medium tracking-tight text-gray-950">{titre}</h1>
            <div className={`mt-6 ${prose}`} dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        )}
      </div>

      {modifiable && (
        <div className="sticky bottom-0 -mx-6 mt-6 border-t border-gray-100 bg-white/90 px-6 py-4 backdrop-blur sm:-mx-10 sm:px-10">
          {demande !== null ? (
            <div className="space-y-3">
              <textarea autoFocus value={demande} onChange={(e) => setDemande(e.target.value)} rows={3}
                placeholder="Ex. : préciser que nous intervenons aussi en visio, retirer le paragraphe sur…"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-950" />
              <div className="flex flex-wrap gap-3">
                <button type="button" disabled={!demande.trim() || !!busy} onClick={() => agir("modifs")} className="btn-solid disabled:opacity-50">{busy === "modifs" ? "Envoi…" : "Envoyer mes remarques"}</button>
                <button type="button" onClick={() => setDemande(null)} className="px-2 text-sm text-gray-500 hover:text-gray-950">Annuler</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" disabled={!!busy} onClick={() => agir("valider")} className="btn-solid disabled:opacity-50">
                {busy === "valider" ? "Validation…" : change ? "Valider avec mes corrections" : "Valider l'article"}
              </button>
              {edition ? (
                <button type="button" disabled={!change || !!busy} onClick={() => agir("enregistrer")} className="btn-outline disabled:opacity-50">{busy === "enregistrer" ? "…" : "Enregistrer sans valider"}</button>
              ) : (
                <button type="button" onClick={() => setEdition(true)} className="btn-outline">Corriger le texte</button>
              )}
              {edition && <button type="button" onClick={() => setEdition(false)} className="text-sm text-gray-500 hover:text-gray-950">Aperçu</button>}
              <button type="button" onClick={() => setDemande("")} className="text-sm font-medium text-gray-600 underline underline-offset-2 hover:text-gray-950">Demander des modifications</button>
              {msg && <span className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.t}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
