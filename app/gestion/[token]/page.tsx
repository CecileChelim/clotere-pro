import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GererRdv } from "@/components/rdv/GererRdv";
import { SupprimerRdv } from "@/components/rdv/SupprimerRdv";
import { lienAvisGoogle } from "@/lib/google";
import { RdvShell, StatutBadge } from "@/components/rdv/RdvShell";
import { DateTile } from "@/components/rdv/DateTile";
import { fmtDateHeure, MODE_LABEL } from "@/lib/rdv/format";
import { emailsDuRdv, libelleMotif, marque, nomClient, nomPro, rdvParTokenPro } from "@/lib/rdv/load";
import { messageModele, messageRefusModele } from "@/lib/rdv/modeles";

export const metadata: Metadata = { title: "Gérer la demande de rendez-vous", robots: { index: false, follow: false } };

const EVENEMENTS: Record<string, { label: string; vers: "client" | "pro" }> = {
  demande_client: { label: "Accusé de réception de la demande", vers: "client" },
  demande_pro: { label: "Notification de nouvelle demande", vers: "pro" },
  confirme_client: { label: "Confirmation du rendez-vous", vers: "client" },
  refuse_client: { label: "Refus du créneau", vers: "client" },
  propose_client: { label: "Proposition de nouveaux créneaux", vers: "client" },
  choix_pro: { label: "Le client a choisi un créneau", vers: "pro" },
  annule_client: { label: "Annulation du rendez-vous", vers: "client" },
  deplace_client: { label: "Rendez-vous déplacé (nouveau créneau)", vers: "client" },
  annule_pro: { label: "Annulation par le client", vers: "pro" },
  relance_pro: { label: "Relance : demande sans réponse", vers: "pro" },
  rappel_client: { label: "Rappel la veille", vers: "client" },
  rappel_pro: { label: "Rappel la veille", vers: "pro" },
};


export default async function GestionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await rdvParTokenPro(token);
  if (!r) notFound();
  const echanges = await emailsDuRdv(r.id);

  return (
    <RdvShell cabinet={r.pro.cabinet?.nom || nomPro(r)} marque={marque(r)} profession={r.pro.profession}>
      <div className="rounded-3xl border border-gray-200 bg-white">
        {/* Rendez-vous */}
        <div className="flex items-start gap-5 p-6">
          <DateTile iso={r.creneau_debut} muted={["refusé", "annulé"].includes(r.statut)} />
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-xl font-bold text-gray-900 first-letter:uppercase sm:text-2xl">{fmtDateHeure(r.creneau_debut)}</p>
            <p className="mt-1 text-[15px] text-gray-600">
              {MODE_LABEL[r.mode ?? r.type_rdv] ?? r.type_rdv}{r.motif?.duree_min ? ` · ${r.motif.duree_min} min` : ""}
            </p>
            <p className="mt-0.5 text-[15px] font-medium text-gray-900">{libelleMotif(r)}</p>
            {r.visio_url && <a href={r.visio_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-medium text-violet-600 hover:underline">Lien de la visio ›</a>}
          </div>
          <StatutBadge statut={r.statut} />
        </div>

        {/* Client */}
        <div className="border-t border-gray-100 px-6 py-5">
          <p className="text-lg font-semibold text-gray-900">
            {nomClient(r)}
            {!r.suivi_existant && r.deja_avocat === "non" && <span className="ml-2 align-middle text-xs font-medium text-emerald-600">Nouveau client</span>}
            {!r.suivi_existant && r.deja_avocat === "changer" && <span className="ml-2 align-middle text-xs font-medium text-amber-600">Souhaite changer d&apos;{r.pro.profession === "avocat" ? "avocat" : "expert-comptable"}</span>}
            {r.suivi_existant && <span className="ml-2 align-middle text-xs font-medium text-gray-500">Client existant</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            {r.client_tel && (
              <a href={`tel:${r.client_tel.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-violet-600 hover:underline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                {r.client_tel}
              </a>
            )}
            <a href={`mailto:${r.client_email}`} className="inline-flex items-center gap-2 text-violet-600 hover:underline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              {r.client_email}
            </a>
          </div>
        </div>

        {/* Message */}
        <div className="border-t border-gray-100 px-6 py-5">
          {r.message
            ? <p className="whitespace-pre-line text-[15px] leading-relaxed text-gray-800">« {r.message} »</p>
            : <p className="text-sm text-gray-400">Pas de message joint à la demande.</p>}
        </div>

        {/* Actions */}
        <div className="rounded-b-3xl border-t border-gray-100 bg-gray-50/70 px-6 py-5">
          {r.statut === "supprimé" && <p className="text-sm text-gray-600">Vous avez supprimé ce rendez-vous. Il n&apos;apparaît plus dans votre liste.</p>}
          {r.statut === "refusé" && <p className="text-sm text-gray-600">Vous avez refusé cette demande. Le client a reçu un lien pour choisir un autre créneau.</p>}
          {r.statut === "annulé" && <p className="text-sm text-gray-600">Ce rendez-vous a été annulé{r.annule_par === "client" ? ` par le client${r.annulation_raison ? ` (${({ plus_besoin: "n'en a plus besoin", imprevu: "imprévu", autre_pro: "a trouvé quelqu'un d'autre", autre: "autre raison" } as Record<string, string>)[r.annulation_raison] ?? r.annulation_raison})` : ""}` : r.annule_par === "auto" ? " automatiquement (sans réponse sous 72 h)" : ""}.</p>}
          {r.statut === "confirmé" ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">✓ Le client a reçu la confirmation{r.message_pro ? " avec votre message" : ""} et l&apos;invitation agenda.</p>
              <GererRdv token={token} statut={r.statut} modele={messageModele(r)} modeleRefus={messageRefusModele(r)} creneauxProposes={null} creneauActuel={r.creneau_debut} />
            </div>
          ) : r.statut !== "supprimé" && (
          <GererRdv token={token} statut={r.statut} modele={messageModele(r)} modeleRefus={messageRefusModele(r)} creneauActuel={r.creneau_debut}
            creneauxProposes={r.creneaux_proposes?.map((c) => fmtDateHeure(c.debut)) ?? null} />
          )}
          {r.statut !== "supprimé" && (
            <div className="mt-4 flex justify-end border-t border-gray-200/70 pt-3">
              <SupprimerRdv token={token} clientPrenom={r.client_prenom || r.client_nom} avisPossible={!!lienAvisGoogle(r.pro.cabinet)}
                aVenirConfirme={r.statut === "confirmé" && new Date(r.creneau_debut).getTime() > Date.now()} />
            </div>
          )}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Échanges</h2>
        <p className="mt-1 text-sm text-gray-500">Demande reçue le {fmtDateHeure(r.created_at)}. Cliquez sur un email pour voir son contenu.</p>
        {echanges.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">Aucun échange pour le moment.</p>
        ) : (
          <ol className="relative mt-5 space-y-4 border-l-2 border-gray-200 pl-6">
            {[...echanges].reverse().map((m) => {
              const ev = EVENEMENTS[m.type] ?? { label: m.sujet, vers: m.destinataire === r.client_email ? "client" : "pro" };
              const client = ev.vers === "client";
              return (
                <li key={m.id} className="relative">
                  <span className={`absolute -left-[31px] top-4 h-4 w-4 rounded-full border-2 border-white ${client ? "bg-violet-600" : "bg-gray-400"}`} />
                  <details className="group overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${client ? "bg-violet-50 text-violet-700 ring-1 ring-violet-100" : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"}`}>
                            {client ? "Envoyé au client" : "Envoyé à vous"}
                          </span>
                          <span className="text-xs text-gray-500 first-letter:uppercase">{fmtDateHeure(m.created_at)}</span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-gray-900">{ev.label}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{m.destinataire}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.envoye ? "bg-emerald-50 text-emerald-700" : m.erreur ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                          {m.envoye ? "Envoyé" : m.erreur ? "Échec" : "Mode test"}
                        </span>
                        <span className="text-gray-400 transition group-open:rotate-90">›</span>
                      </span>
                    </summary>
                    <iframe srcDoc={m.html} title={m.sujet} className="h-[560px] w-full border-t border-gray-100 bg-gray-100" />
                  </details>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </RdvShell>
  );
}
