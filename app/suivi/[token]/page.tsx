import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RdvShell, StatutBadge } from "@/components/rdv/RdvShell";
import { SuiviActions } from "@/components/rdv/SuiviActions";
import { DateTile } from "@/components/rdv/DateTile";
import { peutAnnulerClient } from "@/lib/rdv/actions";
import { fmtDateHeure, MODE_LABEL } from "@/lib/rdv/format";
import { adresseCabinet, libelleMotif, marque, nomPro, rdvParTokenClient } from "@/lib/rdv/load";

export const metadata: Metadata = { title: "Mon rendez-vous", robots: { index: false, follow: false } };

const ICONES: Record<string, string> = {
  telephone: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  visio: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  cabinet: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
  tel: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
};

const TITRES: Record<string, string> = {
  "demandé": "Votre demande est en cours de validation",
  "confirmé": "Votre rendez-vous est confirmé",
  "refusé": "Ce créneau n'est pas disponible",
  "proposé": "De nouveaux créneaux vous sont proposés",
  "annulé": "Ce rendez-vous est annulé",
  "supprimé": "Ce rendez-vous est clôturé",
};

export default async function SuiviPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const r = await rdvParTokenClient(token);
  if (!r) notFound();
  const tel = r.pro.cabinet?.telephone || r.pro.telephone;

  return (
    <RdvShell cabinet={r.pro.cabinet?.nom || nomPro(r)} marque={marque(r)} profession={r.pro.profession}>
      <StatutBadge statut={r.statut} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-[28px]">{TITRES[r.statut] ?? "Mon rendez-vous"}</h1>
      {r.statut === "demandé" && <p className="mt-2 text-[15px] text-gray-500">{nomPro(r)} doit encore valider votre demande. Vous recevrez un email dès sa réponse.</p>}

      <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white">
        {/* Rendez-vous */}
        <div className="flex items-start gap-5 p-6">
          <DateTile iso={r.creneau_debut} muted={["refusé", "annulé", "supprimé"].includes(r.statut)} />
          <div className="min-w-0 flex-1 pt-1">
            <span className="inline-block rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
              {libelleMotif(r).replace(/^(1ère|Première) consultation – /, "")}
            </span>
            <p className="mt-2 text-xl font-bold text-gray-900 first-letter:uppercase">{fmtDateHeure(r.creneau_debut)}</p>
            <p className="mt-1.5 flex items-center gap-2 text-[15px] text-gray-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  {(ICONES[r.mode ?? r.type_rdv] ?? ICONES.visio).split(" M").map((d, i) => <path key={i} d={i ? "M" + d : d} />)}
                </svg>
              </span>
              {MODE_LABEL[r.mode ?? r.type_rdv] ?? r.type_rdv}{r.motif?.duree_min ? ` · ${r.motif.duree_min} min` : ""}
            </p>
            {r.visio_url && r.statut === "confirmé" && (
              <a href={r.visio_url} target="_blank" rel="noopener noreferrer" className="mt-2 ml-9 inline-flex items-center rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-violet-700">Rejoindre la visio</a>
            )}
            {r.mode === "cabinet" && adresseCabinet(r) && <p className="mt-1 pl-9 text-sm text-gray-500">{adresseCabinet(r)}</p>}
            {(r.mode === "telephone" || r.mode === "tel") && r.client_tel && <p className="mt-1 pl-9 text-sm text-gray-500">{nomPro(r)} vous appellera au {r.client_tel}</p>}
          </div>
        </div>

        {/* L'avocat */}
        <div className="flex items-center gap-4 border-t border-gray-100 px-6 py-4">
          {r.pro.photo_url
            ? <img src={r.pro.photo_url} alt={nomPro(r)} className="h-11 w-11 rounded-full object-cover" />
            : <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">{`${r.pro.prenom[0] ?? ""}${r.pro.nom[0] ?? ""}`.toUpperCase()}</div>}
          <div className="min-w-0 flex-1">
            <a href={`/rdv/${r.pro.slug}`} className="font-semibold text-gray-900 hover:text-violet-600 hover:underline">{nomPro(r)}</a>
            <p className="truncate text-sm text-gray-500">{r.pro.cabinet?.nom ?? ""}</p>
          </div>
          {tel && (
            <a href={`tel:${tel.replace(/\s/g, "")}`} className="inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-violet-700 ring-1 ring-violet-200 hover:bg-violet-50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
              <span className="hidden sm:inline">{tel}</span><span className="sm:hidden">Appeler</span>
            </a>
          )}
        </div>

        {r.message_pro && (
          <div className="border-t border-gray-100 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Message de {nomPro(r)}</p>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-gray-800">{r.message_pro}</p>
          </div>
        )}

        <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-5">
          <SuiviActions token={token} statut={r.statut}
            propositions={r.creneaux_proposes?.map((c) => fmtDateHeure(c.debut)) ?? null}
            peutAnnuler={peutAnnulerClient(r)} telephone={tel} reserver={`/rdv/${r.pro.slug}`} />
        </div>
      </div>
    </RdvShell>
  );
}
