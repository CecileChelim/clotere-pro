"use client";

import { useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { MotifsEditor } from "./MotifsEditor";
import { PlagesDisponibilites } from "./PlagesDisponibilites";
import { AbsencesCard, type Absence } from "./AbsencesCard";
import type { MotifDraft } from "@/lib/professions-config";
import type { Horaires } from "@/lib/horaires";

type Onglet = "agenda" | "motifs";

export function AgendaSettings({ proId, motifsInit, connected, provider, retour, detail, horairesInit, absencesInit, ongletInit = "agenda" }: {
  proId: string; motifsInit: MotifDraft[]; connected: boolean; provider: string | null; retour: string | null; detail?: string | null;
  horairesInit: Horaires; absencesInit: Absence[]; ongletInit?: Onglet;
}) {
  const [onglet, setOnglet] = useState<Onglet>(ongletInit);
  const supabase = useMemo(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), []);
  const [motifs, setMotifs] = useState(motifsInit);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deco, setDeco] = useState(false);

  async function save() {
    const valides = motifs.filter((m) => m.libelle.trim());
    if (!valides.some((m) => m.actif)) { setStatus("error"); return; }
    setStatus("saving");
    const { error: e1 } = await supabase.from("motifs").delete().eq("professional_id", proId);
    const { error: e2 } = await supabase.from("motifs").insert(valides.map((m, i) => ({
      professional_id: proId, libelle: m.libelle.trim(), description: m.description.trim() || null, duree_min: m.duree_min,
      modes: m.modes, prix_type: "gratuit", prix_euros: null, actif: m.actif, ordre: i,
    })));
    setStatus(e1 || e2 ? "error" : "saved");
  }

  const changer = (o: Onglet) => {
    setOnglet(o);
    window.history.replaceState(null, "", o === "motifs" ? "/dashboard/agenda?onglet=motifs" : "/dashboard/agenda");
  };

  return (
    <div className="mt-6">
      <div className="flex gap-6 border-b border-gray-200">
        {([["agenda", "Agenda"], ["motifs", "Motifs de rendez-vous"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => changer(id)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition ${onglet === id ? "border-gray-950 text-gray-950" : "border-transparent text-gray-500 hover:text-gray-950"}`}>
            {label}
          </button>
        ))}
      </div>

      {onglet === "agenda" && (
      <div className="mt-8 space-y-6">
      <section>
        <div className="card p-6">
          {retour === "ok" && <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">✓ Agenda connecté. Vos disponibilités sont maintenant synchronisées.</p>}
          {retour === "erreur" && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">La connexion a échoué. Réessayez, ou contactez-nous si le problème persiste.{detail && <span className="mt-1 block font-mono text-xs text-red-600/80">{detail}</span>}</p>}
          {retour === "refuse" && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Vous avez refusé l&apos;accès à votre agenda : la synchronisation n&apos;est pas active.</p>}
          {connected ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">✓</span>
                <div>
                  <p className="text-lg font-medium text-gray-950">Agenda {provider === "outlook" ? "Outlook" : "Google"} synchronisé</p>
                  <p className="text-sm text-gray-600">Vos événements bloquent les créneaux, et chaque rendez-vous confirmé s&apos;ajoute à votre agenda{provider === "google" ? " avec un lien Google Meet pour les visios" : ""}.</p>
                </div>
              </div>
              <button type="button" disabled={deco} onClick={async () => { setDeco(true); await fetch("/api/agenda/disconnect", { method: "POST" }); window.location.href = "/dashboard/agenda"; }}
                className="btn-outline disabled:opacity-50">Déconnecter</button>
            </div>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-950">Connectez votre agenda</p>
              <p className="mt-1 text-sm text-gray-600">
                Vos rendez-vous existants bloquent automatiquement les créneaux, et chaque nouveau rendez-vous s&apos;ajoute à votre agenda.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="/api/agenda/connect?provider=google" className="btn-solid">Connecter Google Agenda</a>
                <a href="/api/agenda/connect?provider=outlook" className="btn-outline">Connecter Outlook</a>
              </div>
            </>
          )}
        </div>
      </section>
      <PlagesDisponibilites proId={proId} init={horairesInit} synchro={connected} />
      <AbsencesCard proId={proId} init={absencesInit} />
      </div>
      )}

      {onglet === "motifs" && (
      <section className="mt-8">
        <p className="mb-4 text-sm text-gray-600">
          L&apos;ordre ci-dessous est celui affiché à vos clients. « Suivi de dossier existant » est toujours proposé en premier.
        </p>
        <MotifsEditor motifs={motifs} onChange={(m) => { setMotifs(m); setStatus("idle"); }} />
        <div className="mt-6 flex items-center gap-4">
          <button type="button" onClick={save} disabled={status === "saving"} className="btn-solid disabled:opacity-60">
            {status === "saving" ? "Enregistrement…" : "Enregistrer les motifs"}
          </button>
          {status === "saved" && <span className="text-sm text-green-700">Motifs enregistrés.</span>}
          {status === "error" && <span className="text-sm text-red-600">Gardez au moins un motif actif et nommé.</span>}
        </div>
      </section>
      )}
    </div>
  );
}
