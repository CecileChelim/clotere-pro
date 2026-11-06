"use client";

import { ActiverOption } from "@/components/options/ActiverOption";
import { prixLabel } from "@/lib/options";

const DEMO = "https://calendar.app.google/k2btydyaoysdvgTx6";

function Coche({ fonce = false }: { fonce?: boolean }) {
  return fonce
    ? <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-950 text-[10px] text-white">✓</span>
    : (
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3"><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
}

function Ctas({ clair = false, demandeEnvoyee }: { clair?: boolean; demandeEnvoyee: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <a href={DEMO} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gray-950 px-5 py-3 text-center text-sm font-medium text-white shadow-md hover:bg-gray-800">
        Réserver une démo
      </a>
      {demandeEnvoyee && <span className="rounded-full bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">✓ Demande reçue : on vous rappelle sous 24 h</span>}
      <ActiverOption option="visibilite" clair={clair} />
    </div>
  );
}

/** Page de vente de l'offre Visibilité, affichée aux cabinets qui ne l'ont pas encore. */
export function VisibilitePresentation({ profession, demandeEnvoyee, cabinet, ville }: {
  profession: "avocat" | "comptable"; demandeEnvoyee: boolean; cabinet?: string | null; ville?: string | null;
}) {
  const comptable = profession === "comptable";
  const metier = comptable ? "expert-comptable" : "avocat";
  const v = ville || "Lyon";
  const nom = cabinet || (comptable ? "Votre cabinet d'expertise comptable" : "Votre cabinet d'avocats");
  const requete = comptable ? `expert-comptable ${v.toLowerCase()}` : `avocat droit du travail ${v.toLowerCase()}`;
  const pendant = comptable ? "restez sur vos dossiers" : "plaidez";
  const articles = comptable
    ? ["SASU ou EURL : quel statut choisir ?", "Changer d'expert-comptable en cours d'année", "Les 5 erreurs comptables des créateurs"]
    : ["Rupture conventionnelle : les étapes et les délais", "Licenciement pour faute grave : quels recours ?", "Prud'hommes : combien de temps dure une procédure ?"];

  return (
    <div className="space-y-16">
      {/* 1. Hero */}
      <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-black/5">
        <div className="bg-brand-gradient absolute inset-0" />
        <div className="relative grid grid-cols-1 gap-8 p-8 sm:p-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-950/60">Offre Visibilité</p>
            <h1 className="mt-3 text-3xl font-medium tracking-tight text-gray-950 sm:text-[2.6rem]/[1.1]">
              Vos futurs clients vous cherchent sur Google. Soyez le premier qu&apos;ils trouvent.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-gray-950/75">
              On fait monter votre cabinet sur Google pendant que vous {pendant} : des articles chaque mois, une fiche Google qui convertit,
              et des demandes de rendez-vous qui arrivent directement dans votre agenda.
            </p>
            <div className="mt-7"><Ctas clair demandeEnvoyee={demandeEnvoyee} /></div>
          </div>

          {/* Faux résultat Google personnalisé */}
          <div className="rounded-2xl bg-white/80 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-gray-400"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
              {requete}
            </div>
            <div className="mt-4 rounded-xl bg-white p-4 ring-2 ring-violet-500">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-gray-950">{nom}</p>
                <span className="shrink-0 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">N°1</span>
              </div>
              <p className="mt-0.5 text-xs text-amber-600">★★★★★ <span className="text-gray-500">4,9 · {v}</span></p>
              <p className="mt-2 line-clamp-2 text-xs text-gray-600">{articles[0]} — le guide complet par votre {metier}.</p>
              <span className="mt-3 inline-flex rounded-full bg-gray-950 px-3 py-1.5 text-xs font-medium text-white">Prendre rendez-vous</span>
            </div>
            {["Annuaire national", "Autre cabinet"].map((t) => (
              <div key={t} className="mt-2 rounded-xl px-4 py-2.5 opacity-50">
                <div className="h-2.5 w-2/3 rounded bg-gray-300" />
                <div className="mt-1.5 h-2 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Ce qui est inclus (cartes, style de la carte Offre Croissance) */}
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Ce qu&apos;on fait pour vous</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-medium tracking-tight text-gray-950">Tout ce qu&apos;il faut pour passer devant, sans y consacrer vos soirées.</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ["3 articles SEO chaque mois", `Rédigés pour vous sur les questions de vos futurs clients, avec votre ville et vos spécialités. Vous relisez en 5 minutes.`],
            ["Une stratégie de mots-clés locale", `On choisit les recherches où vous pouvez vraiment sortir en premier, comme « ${requete} ».`],
            ["Une fiche Google qui convertit", "Avis récoltés après chaque rendez-vous, photos, horaires, et un bouton « Prendre rendez-vous » relié à votre agenda."],
            ["Des résultats que vous voyez", "Clics, positions et articles les plus lus, ici chaque mois. Un rapport détaillé chaque trimestre."],
          ].map(([t, d]) => (
            <div key={t} className="relative overflow-hidden rounded-[1.5rem] p-6 ring-1 ring-black/5">
              <div className="bg-brand-gradient absolute inset-0 opacity-25" />
              <div className="relative flex gap-3">
                <Coche fonce />
                <div>
                  <h3 className="font-medium text-gray-950">{t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Avant / après */}
      <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] ring-1 ring-black/5 sm:grid-cols-2">
        <div className="bg-gray-50 p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Aujourd&apos;hui</p>
          <ul className="mt-5 space-y-3 text-[15px] text-gray-600">
            {[
              "Vous êtes en page 2, derrière les annuaires",
              "Votre site n'a pas bougé depuis des mois",
              "Les demandes arrivent au compte-gouttes, souvent hors sujet",
              "Écrire des articles ? Pas le temps.",
            ].map((t) => <li key={t} className="flex gap-3"><span className="mt-0.5 text-gray-400">✕</span>{t}</li>)}
          </ul>
        </div>
        <div className="relative p-8">
          <div className="bg-brand-gradient absolute inset-0 opacity-40" />
          <div className="relative">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-950/70">Avec Clotere Visibilité</p>
            <ul className="mt-5 space-y-3 text-[15px] font-medium text-gray-950">
              {[
                "Vous apparaissez sur les recherches de votre ville",
                "Votre site s'enrichit de 3 contenus experts chaque mois",
                "Les bons profils réservent directement dans votre agenda",
                "Vous relisez, on s'occupe du reste",
              ].map((t) => <li key={t} className="flex gap-3"><Coche fonce />{t}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Ce que vous verrez chaque mois */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Votre espace Visibilité</p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight text-gray-950">Vous voyez vos progrès, mois après mois.</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
            Vos articles à relire, vos positions Google et vos rapports trimestriels, au même endroit que vos rendez-vous. Pas de jargon, juste ce qui compte.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-gray-50 p-5 ring-1 ring-black/5">
          <div className="grid grid-cols-3 gap-3">
            {[["Clics Google", "412", "+38 %"], ["Apparitions", "18 650", "+52 %"], ["Position", "7,4", "+3,1"]].map(([l, val, d]) => (
              <div key={l} className="rounded-xl bg-white p-3 ring-1 ring-black/5">
                <p className="text-[11px] text-gray-500">{l}</p>
                <p className="mt-0.5 text-xl font-medium text-gray-950">{val}</p>
                <p className="text-[11px] font-semibold text-emerald-600">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 divide-y divide-gray-100 rounded-xl bg-white ring-1 ring-black/5">
            {articles.map((t, i) => (
              <div key={t} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="truncate text-gray-950">{t}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${i === 0 ? "bg-amber-50 text-amber-800 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"}`}>{i === 0 ? "À relire" : "Publié"}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-gray-400">Exemple, données fictives.</p>
        </div>
      </div>

      {/* 5. Comment ça marche */}
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Comment ça marche</p>
        <h2 className="mt-2 text-3xl font-medium tracking-tight text-gray-950">Opérationnel en une semaine.</h2>
        <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            ["30 min de stratégie", "On choisit ensemble vos spécialités et les recherches à viser."],
            ["Vos articles arrivent", "Chaque mois, 3 articles prêts à relire. Vous êtes prévenu par e-mail."],
            ["Vous validez", "Un clic, ou quelques corrections. Sans retour sous 7 jours, on valide pour vous."],
            ["On publie et on mesure", "Sur votre site, ou un site Clotere si vous n'en avez pas."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-[1.5rem] bg-white p-5 ring-1 ring-black/5">
              <span className="font-mono text-sm font-semibold text-violet-600">0{i + 1}</span>
              <h3 className="mt-2 font-medium text-gray-950">{t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{d}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* 6. Engagements + tarif */}
      <div className="grid grid-cols-1 gap-8 rounded-[2rem] bg-gray-50 p-6 ring-1 ring-black/5 sm:grid-cols-2 sm:p-8">
        <ul className="space-y-3 text-[15px] text-gray-700">
          {[
            `Des contenus qui respectent les règles de communication de la profession d'${metier}`,
            "Vous gardez la main : rien n'est publié sans validation",
            "Vos articles vous appartiennent, même si vous arrêtez",
            "Sans engagement",
          ].map((f) => <li key={f} className="flex gap-3"><Coche />{f}</li>)}
        </ul>
        <div className="flex flex-col justify-center">
          <p className="text-3xl font-medium tracking-tight text-gray-950">300 €<span className="text-base font-normal text-gray-500"> HT / mois</span></p>
          <p className="mt-1 text-sm text-gray-600">{prixLabel("visibilite")}. Sans engagement, résiliable à tout moment. Inclut l&apos;option Avis Google.</p>
          <div className="mt-5"><Ctas demandeEnvoyee={demandeEnvoyee} /></div>
        </div>
      </div>
    </div>
  );
}
