"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAFONDS_PROPOSES, RAISONS_CONTESTATION, STATUTS_LEAD } from "@/lib/leads";

/* Apport d'affaires (dashboard › Apport d'affaires) : activation, réglages, suivi et contestation des leads. */

export type LeadLigne = {
  id: string; statut: string; client_label: string | null; motif: string | null; creneau_debut: string | null;
  contestable_jusqu: string; montant_ht_cents: number; raison: string | null; created_at: string;
};

const btn = "rounded-full bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50";
const btn2 = "rounded-full px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50";
const carte = "rounded-2xl border border-gray-200 bg-white p-5";
const euros = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })} €`;
const date = (iso: string | null, heure = false) => iso
  ? new Date(iso).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short", ...(heure ? { hour: "2-digit", minute: "2-digit" } : {}) })
  : "—";

function ChoixPlafond({ valeur, onChange }: { valeur: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {[null, ...PLAFONDS_PROPOSES].map((p) => (
        <button key={String(p)} type="button" onClick={() => onChange(p)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${valeur === p ? "bg-gray-950 text-white ring-gray-950" : "text-gray-700 ring-gray-200 hover:bg-gray-50"}`}>
          {p === null ? "Sans limite" : `${p} / mois`}
        </button>
      ))}
    </div>
  );
}

/* ── Avant activation ─────────────────────────────────────────────── */
export function LeadsActivation({ prix, fiche, titulaire, profession, delaiH, abonne, pageSeule = false }: { prix: number; fiche: string; titulaire: boolean; profession: "avocat" | "comptable"; delaiH: number; abonne: boolean; pageSeule?: boolean }) {
  const [plafond, setPlafond] = useState<number | null>(10);
  const [cgv, setCgv] = useState(false);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");

  async function activer() {
    setCharge(true); setErreur("");
    const r = await fetch("/api/leads/activer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plafond, cgv }) });
    const j = await r.json().catch(() => ({}));
    if (j.url) { window.location.href = j.url; return; }
    setCharge(false); setErreur(j.error || "Activation impossible, réessayez.");
  }

  const client = profession === "avocat" ? "justiciables" : "entrepreneurs et particuliers";
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className={carte}>
        <p className="text-lg font-medium text-gray-950">Un modèle 100 % à la performance : Clotere est rémunérée au rendez-vous apporté.</p>
        <p className="mt-1 text-sm text-gray-500">
          Votre fiche <a href={`https://${fiche}`} target="_blank" rel="noopener" className="text-gray-950 underline underline-offset-2">{fiche}</a> est
          {pageSeule
            ? <>en ligne : les {client} qui la consultent peuvent déjà réserver. Ajoutez votre carte pour consulter les demandes reçues et y répondre.</>
            : <>publiée sur Clotere. Activez la prise de rendez-vous pour recevoir les demandes des {client} qui la consultent.</>}
        </p>
        <ol className="mt-6 space-y-5">
          {[
            ["Un client réserve depuis votre fiche", "Il choisit le motif, le format et le créneau, et répond aux questions de votre questionnaire. Vous recevez la demande comme d'habitude."],
            [`${euros(prix)} HT par rendez-vous`, abonne
              ? "Uniquement pour les demandes venues de clotere.fr. Celles de votre site, de Google ou de LinkedIn restent incluses dans votre abonnement."
              : "Uniquement pour les demandes prises depuis votre page clotere.fr. Aucun abonnement, aucun frais fixe."],
            [`Contestable jusqu'à ${delaiH} h après le rendez-vous`, "Client absent, demande hors de vos domaines, doublon ou fausse demande : en un clic, le rendez-vous n'est pas facturé. Une annulation par le client n'est jamais facturée."],
            ["Une facture par mois, avec un plafond", "Les rendez-vous du mois sont facturés le mois suivant sur votre carte. Plafond atteint : la réservation se met en pause sur votre fiche jusqu'au mois suivant."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-700">{i + 1}</span>
              <div><p className="text-sm font-medium text-gray-950">{t}</p><p className="mt-0.5 text-sm text-gray-500">{d}</p></div>
            </li>
          ))}
        </ol>
      </div>

      <div className={`${carte} self-start`}>
        <p className="text-sm text-gray-500">Prix par rendez-vous</p>
        <p className="mt-1 text-3xl font-medium tracking-tight text-gray-950">{euros(prix)} <span className="text-base text-gray-500">HT</span></p>
        <p className="mt-1 text-sm text-gray-500">{abonne ? "Sans engagement, en plus de votre abonnement." : "Sans abonnement, sans engagement."}</p>
        <p className="mt-6 text-sm font-medium text-gray-950">Plafond mensuel</p>
        <p className="mb-2 text-xs text-gray-500">Modifiable à tout moment.</p>
        <ChoixPlafond valeur={plafond} onChange={setPlafond} />
        <p className="mt-3 text-sm text-gray-700">
          Budget maximum : <strong>{plafond === null ? "sans limite" : `${euros(plafond * prix)} HT / mois`}</strong>
        </p>
        {erreur && <p className="mt-3 text-sm text-red-600">{erreur}</p>}
        {titulaire && (
          <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-xs text-gray-600">
            <input type="checkbox" checked={cgv} onChange={(e) => setCgv(e.target.checked)} className="mt-0.5 accent-gray-950" />
            <span>
              J&apos;accepte les <a href="/cgv" target="_blank" rel="noopener" className="text-gray-950 underline underline-offset-2">conditions générales de vente</a> et
              le tarif de {euros(prix)} HT par rendez-vous reçu via Clotere.
            </span>
          </label>
        )}
        {titulaire ? (
          <button type="button" onClick={activer} disabled={charge || !cgv} className={`${btn} mt-4 w-full py-2.5`}>
            {charge ? "Ouverture…" : pageSeule ? "Ajouter ma carte" : "Activer avec ma carte"}
          </button>
        ) : (
          <p className="mt-5 text-sm text-gray-500">Seul le titulaire du cabinet peut activer l&apos;apport d&apos;affaires.</p>
        )}
        <p className="mt-2 text-center text-xs text-gray-400">Aucun débit aujourd&apos;hui · paiement sécurisé par Stripe</p>
      </div>
    </div>
  );
}

/* ── Fenêtre de contestation ─────────────────────────────────────── */
function Contester({ lead, onClose }: { lead: LeadLigne; onClose: (fait: boolean) => void }) {
  const [raison, setRaison] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setCharge(true); setErreur("");
    const r = await fetch(`/api/leads/${lead.id}/contester`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ raison, detail }) });
    const j = await r.json().catch(() => ({}));
    setCharge(false);
    if (!j.ok) { setErreur(j.error || "Contestation impossible, réessayez."); return; }
    onClose(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/40 p-0 sm:items-center sm:p-4" onClick={() => onClose(false)}>
      <form onSubmit={envoyer} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <p className="text-lg font-medium text-gray-950">Contester ce rendez-vous</p>
        <p className="mt-1 text-sm text-gray-500">{lead.client_label} · {lead.motif ?? "Rendez-vous"} · {date(lead.creneau_debut, true)}. Il ne vous sera pas facturé.</p>
        <fieldset className="mt-5 space-y-2">
          {RAISONS_CONTESTATION.map((r) => (
            <label key={r.id} className={`flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm ring-1 ${raison === r.id ? "bg-gray-50 ring-gray-950" : "ring-gray-200 hover:bg-gray-50"}`}>
              <input type="radio" name="raison" value={r.id} checked={raison === r.id} onChange={() => setRaison(r.id)} className="accent-gray-950" />
              {r.label}
            </label>
          ))}
        </fieldset>
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={3} maxLength={500}
          placeholder={raison === "autre" ? "Précisez la raison (obligatoire)" : "Précision (facultatif)"}
          className="mt-3 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-950" />
        {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => onClose(false)} className={btn2}>Annuler</button>
          <button type="submit" disabled={charge || !raison || (raison === "autre" && !detail.trim())} className={btn}>{charge ? "Envoi…" : "Contester"}</button>
        </div>
      </form>
    </div>
  );
}

/* ── Après activation ─────────────────────────────────────────────── */
export function LeadsSuivi({ leads, titulaire, prix, mois, reglages }: {
  leads: LeadLigne[]; titulaire: boolean; prix: number;
  mois: { recus: number; facturables: number; nonFactures: number; montant: number };
  reglages: { actifs: boolean; ouverts: boolean; plafond: number | null };
}) {
  const router = useRouter();
  const [plafond, setPlafond] = useState(reglages.plafond);
  const [charge, setCharge] = useState(false);
  const [message, setMessage] = useState("");
  const [aContester, setAContester] = useState<LeadLigne | null>(null);
  const [maintenant] = useState(() => Date.now());

  async function regler(body: Record<string, unknown>, ok: string) {
    setCharge(true); setMessage("");
    const r = await fetch("/api/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setCharge(false); setMessage(j.ok ? ok : j.error || "Enregistrement impossible.");
    router.refresh();
  }

  async function portail() {
    const r = await fetch("/api/stripe/portal", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (j.url) window.location.href = j.url;
  }

  const etat = !reglages.actifs
    ? { label: "En pause", texte: "La réservation est désactivée sur votre fiche clotere.fr.", classe: "bg-gray-100 text-gray-700" }
    : reglages.ouverts
      ? { label: "Ouvert", texte: "Les clients peuvent réserver depuis votre fiche clotere.fr.", classe: "bg-emerald-50 text-emerald-700" }
      : { label: "Plafond atteint", texte: "La réservation reprend automatiquement le 1er du mois prochain, ou dès que vous relevez le plafond.", classe: "bg-amber-50 text-amber-800" };

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={carte}>
          <p className="text-sm text-gray-500">Rendez-vous ce mois-ci</p>
          <p className="mt-1 text-3xl font-medium tracking-tight text-gray-950">{mois.recus}</p>
          {mois.nonFactures > 0 && <p className="mt-1 text-xs text-gray-500">dont {mois.nonFactures} contesté{mois.nonFactures > 1 ? "s" : ""} ou annulé{mois.nonFactures > 1 ? "s" : ""}</p>}
        </div>
        <div className={carte}>
          <p className="text-sm text-gray-500">Montant du mois</p>
          <p className="mt-1 text-3xl font-medium tracking-tight text-gray-950">{euros(mois.montant)} <span className="text-base text-gray-500">HT</span></p>
          <p className="mt-1 text-xs text-gray-500">{mois.facturables} × {euros(prix)} HT, facturé le mois prochain</p>
        </div>
        <div className={carte}>
          <p className="text-sm text-gray-500">Plafond</p>
          <p className="mt-1 text-3xl font-medium tracking-tight text-gray-950">
            {reglages.plafond === null ? "∞" : <>{mois.facturables}<span className="text-base text-gray-500"> / {reglages.plafond}</span></>}
          </p>
          {reglages.plafond !== null && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-violet-600" style={{ width: `${Math.min(100, (mois.facturables / reglages.plafond) * 100)}%` }} />
            </div>
          )}
        </div>
      </div>

      <div className={carte}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-950">Réservation sur votre fiche</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${etat.classe}`}>{etat.label}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{etat.texte}</p>
          </div>
          {titulaire && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={portail} className={btn2}>Ma carte et mes factures</button>
              {reglages.actifs
                ? <button type="button" disabled={charge} onClick={() => confirm("Mettre en pause la réservation sur votre fiche ? Les rendez-vous déjà reçus restent facturables.") && regler({ actifs: false }, "Réservation mise en pause.")} className={btn2}>Mettre en pause</button>
                : <button type="button" disabled={charge} onClick={() => regler({ actifs: true }, "Réservation réactivée.")} className={btn}>Réactiver</button>}
            </div>
          )}
        </div>
        {titulaire && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-950">Plafond mensuel</p>
            <p className="mb-2 text-xs text-gray-500">Nombre maximum de rendez-vous facturés par mois (contestés et annulés non comptés).</p>
            <div className="flex flex-wrap items-center gap-3">
              <ChoixPlafond valeur={plafond} onChange={setPlafond} />
              {plafond !== reglages.plafond && (
                <button type="button" disabled={charge} onClick={() => regler({ plafond }, "Plafond enregistré.")} className={btn}>Enregistrer</button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">Budget maximum : {plafond === null ? "sans limite" : `${euros(plafond * prix)} HT / mois`}</p>
          </div>
        )}
        {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      </div>

      <div className={`${carte} p-0`}>
        <div className="flex items-center justify-between px-5 py-4">
          <p className="font-medium text-gray-950">Rendez-vous apportés</p>
          <p className="text-xs text-gray-500">3 derniers mois</p>
        </div>
        {leads.length === 0 ? (
          <p className="border-t border-gray-100 px-5 py-10 text-center text-sm text-gray-500">
            Aucun rendez-vous pour l&apos;instant. Ils apparaîtront ici dès qu&apos;un client réservera depuis votre fiche.
          </p>
        ) : (
          <div className="overflow-x-auto border-t border-gray-100">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs text-gray-500">
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-2.5 font-medium">Reçu le</th><th className="px-3 py-2.5 font-medium">Client</th><th className="px-3 py-2.5 font-medium">Motif</th>
                  <th className="px-3 py-2.5 font-medium">Rendez-vous</th><th className="px-3 py-2.5 font-medium">Montant</th><th className="px-3 py-2.5 font-medium">Statut</th><th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((l) => {
                  const s = STATUTS_LEAD[l.statut] ?? { label: l.statut, classe: "bg-gray-100 text-gray-700" };
                  const contestable = l.statut === "en_attente" && new Date(l.contestable_jusqu).getTime() > maintenant;
                  const barre = l.statut === "conteste" || l.statut === "annule";
                  return (
                    <tr key={l.id}>
                      <td className="px-5 py-3 text-gray-500">{date(l.created_at)}</td>
                      <td className="px-3 py-3 font-medium text-gray-950">{l.client_label}</td>
                      <td className="px-3 py-3 text-gray-700">{l.motif ?? "—"}</td>
                      <td className="px-3 py-3 text-gray-700">{date(l.creneau_debut, true)}</td>
                      <td className={`px-3 py-3 ${barre ? "text-gray-400 line-through" : "text-gray-950"}`}>{euros(l.montant_ht_cents / 100)}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.classe}`}>{s.label}</span>
                        {contestable && <p className="mt-1 text-[11px] text-gray-400">jusqu&apos;au {date(l.contestable_jusqu, true)}</p>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {contestable && titulaire && (
                          <button type="button" onClick={() => setAContester(l)} className="text-xs font-medium text-gray-700 underline underline-offset-2 hover:text-gray-950">Contester</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {aContester && <Contester lead={aContester} onClose={(fait) => { setAContester(null); if (fait) { setMessage("Rendez-vous contesté : il ne sera pas facturé."); router.refresh(); } }} />}
    </div>
  );
}
