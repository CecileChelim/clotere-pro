import Link from "next/link";
import { AvisCarte } from "@/components/avis/AvisCarte";
import { FicheGoogleForm } from "@/components/avis/FicheGoogleForm";
import { NouvelleDemande } from "@/components/avis/NouvelleDemande";
import { ArreterDemande } from "@/components/avis/ArreterDemande";
import { ActualiserAvis } from "@/components/avis/Actualiser";
import { CopierLien } from "@/components/avis/CopierLien";
import { DELAIS_RELANCE_JOURS, STATUT_DEMANDE, type AvisRow, type DemandeAvis } from "@/lib/avis";

export type DonneesAvis = {
  cabinet: { google_business_url: string | null; google_rating: number | null; google_reviews_count: number | null; google_reviews_url: string | null; google_synced_at: string | null };
  lienAvis: string | null;
  avis: AvisRow[];
  demandes: DemandeAvis[];
  onglet: "avis" | "demandes" | "reglages";
  filtre?: "a_repondre" | "tous";
};

const ONGLETS = [["avis", "Avis"], ["demandes", "Demandes d'avis"], ["reglages", "Réglages"]] as const;
const dateCourte = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "Europe/Paris" });
const dateHeure = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

/** Espace « Avis » d'un cabinet qui a l'option (ou Visibilité). */
export function EspaceAvis({ cabinet, lienAvis, avis, demandes, onglet, filtre = "tous" }: DonneesAvis) {
  const aRepondre = avis.filter((a) => a.statut === "a_repondre" && !a.reponse_google);
  const enCours = demandes.filter((d) => d.statut === "en_cours");
  const recus = demandes.filter((d) => d.statut === "avis_recu").length;
  const taux = demandes.length ? Math.round((recus / demandes.length) * 100) : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Avis</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-gray-950">Vos avis Google</h1>
        </div>
        {cabinet.google_business_url && <ActualiserAvis />}
      </div>

      {!cabinet.google_business_url ? (
        <div className="card mt-8 p-6 sm:p-8">
          <p className="text-lg font-medium text-gray-950">Commencez par le lien de votre fiche Google</p>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">On s&apos;en sert pour afficher vos avis, vous proposer des réponses et envoyer à vos clients un lien qui ouvre directement la fenêtre « Laisser un avis ».</p>
          <div className="mt-5"><FicheGoogleForm /></div>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["Note Google", cabinet.google_rating != null ? `${String(cabinet.google_rating).replace(".", ",")} ★` : "–", cabinet.google_reviews_count != null ? `${cabinet.google_reviews_count} avis au total` : ""],
              ["À répondre", String(aRepondre.length), aRepondre.length ? "réponses prêtes à publier" : "tout est à jour"],
              ["Demandes en cours", String(enCours.length), `${demandes.length} envoyée${demandes.length > 1 ? "s" : ""} au total`],
              ["Taux de réponse", taux != null ? `${taux} %` : "–", "des demandes ont donné un avis"],
            ].map(([l, v, d]) => (
              <div key={l} className="card p-5">
                <p className="text-sm text-gray-500">{l}</p>
                <p className="mt-1 text-3xl font-medium text-gray-950">{v}</p>
                <p className="mt-1 text-xs text-gray-500">{d}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-6 border-b border-gray-200">
            {ONGLETS.map(([id, label]) => (
              <Link key={id} href={id === "avis" ? "/dashboard/avis" : `/dashboard/avis?onglet=${id}`}
                className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${onglet === id ? "border-gray-950 text-gray-950" : "border-transparent text-gray-500 hover:text-gray-950"}`}>
                {label}
                {id === "avis" && aRepondre.length > 0 && <span className="rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-800">{aRepondre.length}</span>}
                {id === "demandes" && enCours.length > 0 && <span className="rounded-full bg-gray-100 px-1.5 text-xs font-semibold text-gray-700">{enCours.length}</span>}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            {onglet === "avis" && <ListeAvis avis={filtre === "a_repondre" ? aRepondre : avis} lienFiche={cabinet.google_reviews_url ?? cabinet.google_business_url} filtre={filtre} nbARepondre={aRepondre.length} synchro={cabinet.google_synced_at} />}
            {onglet === "demandes" && <Demandes demandes={demandes} />}
            {onglet === "reglages" && <Reglages cabinet={cabinet} lienAvis={lienAvis} />}
          </div>
        </>
      )}
    </div>
  );
}

function ListeAvis({ avis, lienFiche, filtre, nbARepondre, synchro }: { avis: AvisRow[]; lienFiche: string | null; filtre: string; nbARepondre: number; synchro: string | null }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[["tous", "Tous"], ["a_repondre", `À répondre (${nbARepondre})`]].map(([id, l]) => (
            <Link key={id} href={id === "tous" ? "/dashboard/avis" : "/dashboard/avis?filtre=a_repondre"}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${filtre === id ? "bg-gray-950 text-white ring-gray-950" : "bg-white text-gray-600 ring-gray-200 hover:text-gray-950"}`}>{l}</Link>
          ))}
        </div>
        {synchro && <p className="text-xs text-gray-400">Mis à jour le {dateHeure(synchro)}</p>}
      </div>
      {avis.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg font-medium text-gray-950">{filtre === "a_repondre" ? "Aucun avis en attente de réponse" : "Pas encore d'avis récupéré"}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">{filtre === "a_repondre" ? "Bravo, tout est à jour." : "Vos avis apparaîtront ici dès la prochaine actualisation."}</p>
        </div>
      ) : avis.map((a) => <AvisCarte key={a.id} avis={a} lienFiche={lienFiche} />)}
      <p className="text-xs text-gray-400">Source : Google. Les avis sont récupérés chaque jour et s&apos;ajoutent au fil de l&apos;eau ; vous publiez vous-même vos réponses depuis votre fiche.</p>
    </div>
  );
}

function Demandes({ demandes }: { demandes: DemandeAvis[] }) {
  return (
    <div className="space-y-6">
      <NouvelleDemande />
      <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600 ring-1 ring-black/5">
        Quand vous clôturez un rendez-vous « Dossier mené à bien », le client reçoit une demande d&apos;avis. Sans avis, il est relancé après {DELAIS_RELANCE_JOURS[0]} jours, puis une dernière fois {DELAIS_RELANCE_JOURS[1]} jours plus tard.
      </div>
      {demandes.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg font-medium text-gray-950">Aucune demande d&apos;avis pour l&apos;instant</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">Elles apparaîtront ici avec leurs relances.</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100">
          {demandes.map((d) => {
            const st = STATUT_DEMANDE[d.statut];
            return (
              <div key={d.id} className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[1.1fr_1.6fr_auto] lg:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-950">{d.client_nom || d.client_email}</p>
                  <p className="truncate text-xs text-gray-500">{d.client_email}{d.booking_id ? " · rendez-vous Clotere" : " · ajouté à la main"}</p>
                </div>
                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  {d.historique.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {i > 0 && <span className="h-px w-4 bg-gray-300" />}
                      <span className={`rounded-full px-2 py-0.5 ring-1 ${h.envoye ? "bg-white text-gray-700 ring-gray-200" : "bg-red-50 text-red-700 ring-red-200"}`} title={h.envoye ? "E-mail envoyé" : "Échec d'envoi"}>
                        {h.type === "demande" ? "Demande" : `Relance ${d.historique.slice(0, i + 1).filter((x) => x.type === "relance").length}`} · {dateCourte(h.le)}
                      </span>
                    </li>
                  ))}
                  {d.statut === "en_cours" && d.prochaine_relance_le && d.nb_relances < 2 && (
                    <li className="flex items-center gap-2 text-gray-400"><span className="h-px w-4 bg-gray-200" /><span className="rounded-full border border-dashed border-gray-300 px-2 py-0.5">Relance {d.nb_relances + 1} prévue le {dateCourte(d.prochaine_relance_le)}</span></li>
                  )}
                </ol>
                <div className="flex items-center gap-3 lg:justify-end">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${st.classe}`}>{st.label}</span>
                  {d.statut === "en_cours" && <ArreterDemande id={d.id} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Reglages({ cabinet, lienAvis }: { cabinet: DonneesAvis["cabinet"]; lienAvis: string | null }) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <p className="font-medium text-gray-950">Votre fiche Google</p>
        <p className="mt-1 text-sm text-gray-600">Le lien de partage de votre fiche. Changez-le si vous avez plusieurs établissements ou si la fiche affichée n&apos;est pas la bonne.</p>
        <div className="mt-4"><FicheGoogleForm initial={cabinet.google_business_url} compact /></div>
      </div>
      {lienAvis && (
        <div className="card p-6">
          <p className="font-medium text-gray-950">Votre lien « Laisser un avis »</p>
          <p className="mt-1 text-sm text-gray-600">Il ouvre directement la fenêtre d&apos;avis de votre fiche. Ajoutez-le à votre signature e-mail, vos factures ou un QR code à l&apos;accueil.</p>
          <div className="mt-4"><CopierLien lien={lienAvis} /></div>
        </div>
      )}
      <div className="rounded-2xl bg-gray-50 p-5 text-sm leading-relaxed text-gray-600 ring-1 ring-black/5">
        <p className="font-medium text-gray-950">Les règles qu&apos;on respecte pour vous</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Tous vos clients reçoivent le même lien Google : pas de filtrage des clients satisfaits (interdit par Google).</li>
          <li>Aucune contrepartie proposée en échange d&apos;un avis.</li>
          <li>Les e-mails et les réponses proposées ne mentionnent jamais le dossier.</li>
        </ul>
      </div>
    </div>
  );
}
