"use client";

import { useState } from "react";
import { DateTile } from "@/components/rdv/DateTile";

export type Booking = {
  id: string; statut: string; creneau_debut: string; creneau_fin: string; mode: string | null; type_rdv: string;
  client_nom: string; client_prenom: string | null; client_email: string; client_tel: string | null;
  message: string | null; suivi_existant: boolean | null; deja_avocat: string | null; created_at: string; token_pro: string;
  motifs: { libelle: string; duree_min?: number } | null;
};

const MODE: Record<string, string> = { visio: "Visio", telephone: "Téléphone", tel: "Téléphone", cabinet: "Au cabinet" };
const DEJA: Record<string, string> = { non: "Pas encore d'avocat", oui: "A déjà un avocat", changer: "Veut changer d'avocat" };
const STATUT: Record<string, { label: string; cls: string }> = {
  "demandé": { label: "À valider", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  "confirmé": { label: "Confirmé", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  "refusé": { label: "Refusé", cls: "bg-gray-100 text-gray-500 ring-gray-200" },
  "proposé": { label: "Créneaux proposés", cls: "bg-violet-50 text-violet-700 ring-violet-200" },
  "annulé": { label: "Annulé", cls: "bg-gray-100 text-gray-500 ring-gray-200" },
};

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const fmtHeure = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function BookingsList({ initial, profession = "avocat" }: { initial: Booking[]; profession?: string }) {
  const metier = profession === "comptable" ? "d'expert-comptable" : "d'avocat";
  const items = initial;
  const [tab, setTab] = useState<"a_venir" | "a_valider" | "passes">("a_venir");

  const now = Date.now();
  const futur = (b: Booking) => new Date(b.creneau_debut).getTime() >= now;
  const lists = {
    // Tous les prochains rendez-vous, validés ou non, par ordre chronologique.
    a_venir: items.filter((b) => ["demandé", "proposé", "confirmé"].includes(b.statut) && futur(b)),
    a_valider: items.filter((b) => b.statut === "demandé" && futur(b)),
    passes: items.filter((b) => ["refusé", "annulé"].includes(b.statut) || !futur(b)).reverse(),
  };
  const TABS = [["a_venir", "Prochains rendez-vous"], ["a_valider", "À valider"], ["passes", "Passés & refusés"]] as const;

  const list = lists[tab];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === id ? "bg-gray-950 text-white shadow-md" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:text-gray-950"}`}>
            {label}
            <span className={`ml-2 rounded-full px-1.5 text-xs ${tab === id ? "bg-white/20" : "bg-gray-100"}`}>{lists[id].length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-sm text-gray-500">
          {tab === "passes" ? "Rien à afficher pour le moment." : tab === "a_valider" ? "Aucune demande en attente de validation." : "Aucun rendez-vous à venir. Les nouvelles demandes apparaîtront ici."}
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((b) => {
            const st = STATUT[b.statut] ?? STATUT["demandé"];
            return (
              <li key={b.id} className="card overflow-hidden">
                <div className="flex items-start gap-4 p-5 sm:gap-5 sm:p-6">
                  <DateTile iso={b.creneau_debut} size="sm" muted={["refusé", "annulé"].includes(b.statut)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-gray-950 first-letter:uppercase">{fmtDate(b.creneau_debut)} à {fmtHeure(b.creneau_debut).replace(":", "h")}</p>
                    <p className="mt-0.5 text-sm text-gray-600">{MODE[b.mode ?? b.type_rdv] ?? b.type_rdv}{b.motifs?.duree_min ? ` · ${b.motifs.duree_min} min` : ""}</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{b.suivi_existant ? "Suivi de dossier existant" : b.motifs?.libelle ?? "Rendez-vous"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${st.cls}`}>{st.label}</span>
                </div>

                <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                  <p className="font-semibold text-gray-950">
                    {[b.client_prenom, b.client_nom].filter(Boolean).join(" ")}
                    {!b.suivi_existant && b.deja_avocat === "non" && <span className="ml-2 text-xs font-medium text-emerald-600">Nouveau client</span>}
                    {!b.suivi_existant && b.deja_avocat === "changer" && <span className="ml-2 text-xs font-medium text-amber-600">Souhaite changer {metier}</span>}
                    {b.suivi_existant && <span className="ml-2 text-xs font-medium text-gray-500">Client existant</span>}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {b.client_tel && (
                      <a href={`tel:${b.client_tel.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-violet-600 hover:underline">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                        {b.client_tel}
                      </a>
                    )}
                    <a href={`mailto:${b.client_email}`} className="inline-flex items-center gap-2 text-violet-600 hover:underline">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                      {b.client_email}
                    </a>
                  </div>
                </div>

                {b.message && (
                  <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                    <p className="line-clamp-3 whitespace-pre-line text-[15px] leading-relaxed text-gray-800">« {b.message} »</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-3.5 sm:px-6">
                  <p className="text-sm text-gray-500">
                    {b.statut === "demandé" ? "En attente de votre réponse" : b.statut === "proposé" ? "En attente du choix du client" : b.statut === "confirmé" ? "Confirmation envoyée au client" : ""}
                  </p>
                  <a href={`/gestion/${b.token_pro}`} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${b.statut === "demandé" ? "bg-gray-950 text-white hover:bg-gray-800" : "bg-white text-gray-950 ring-1 ring-black/15 hover:bg-gray-50"}`}>
                    {b.statut === "demandé" ? "Répondre à la demande" : "Voir le rendez-vous"}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
