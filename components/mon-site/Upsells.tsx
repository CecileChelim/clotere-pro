"use client";

import Link from "next/link";
import { useState } from "react";
import { PRIX } from "@/lib/tarifs";

/* Pages d'activation des modules non souscrits (affichées à la place du contenu, menu « Développez votre cabinet »). */

function Coche() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3"><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export function BoutonActiverRdv({ className = "btn-solid" }: { className?: string }) {
  const [etat, setEtat] = useState<"" | "envoi" | "erreur">("");
  const [msg, setMsg] = useState("");
  return (
    <span className="inline-flex flex-col gap-2">
      <button type="button" disabled={etat === "envoi"} className={`${className} disabled:opacity-50`}
        onClick={async () => {
          setEtat("envoi");
          const r = await fetch("/api/site/activer-rdv", { method: "POST" }).catch(() => null);
          const j = (await r?.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
          if (j?.ok) { window.location.href = "/dashboard/agenda?rdv=active"; return; }
          setEtat("erreur"); setMsg(j?.error ?? "Une erreur est survenue, réessayez.");
        }}>
        {etat === "envoi" ? "Activation…" : `Activer la prise de rendez-vous · ${PRIX.siteRdv} € HT / mois`}
      </button>
      {msg && <span className="text-sm text-red-600">{msg}</span>}
    </span>
  );
}

/** Formule « site + formulaire de contact » : présentation de la prise de rendez-vous en ligne. */
export function RdvPresentation({ page }: { page: "rendez-vous" | "agenda" }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-brand-gradient p-8 sm:p-10">
        <p className="eyebrow text-gray-950/60">{page === "agenda" ? "Agenda" : "Rendez-vous"} · à activer</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight text-gray-950 sm:text-4xl">Laissez vos clients réserver directement dans votre agenda</h1>
        <p className="mt-3 max-w-xl text-[15px] text-gray-800">Aujourd&apos;hui, vos visiteurs vous écrivent via le formulaire de contact. Avec la prise de rendez-vous, ils choisissent un motif et un créneau : vous n&apos;avez plus qu&apos;à confirmer.</p>
      </div>
      <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3 text-[15px] text-gray-700">
          {["Un bouton « Prendre rendez-vous » sur votre site, à la place du formulaire",
            "Motifs de rendez-vous et questions pour qualifier chaque demande avant d'accepter",
            "Synchronisation avec votre agenda Google ou Outlook, rappels automatiques au client",
            "Lien de réservation à partager sur votre fiche Google, LinkedIn et votre signature e-mail",
            "La rubrique Actualités pour publier vos articles sur votre site"].map((t) => <li key={t} className="flex gap-3"><Coche />{t}</li>)}
        </ul>
        <div className="rounded-2xl bg-gray-50 p-6 ring-1 ring-black/5">
          <p className="text-sm text-gray-500">Votre offre passe à</p>
          <p className="mt-1 text-3xl font-medium text-gray-950">{PRIX.siteRdv} € <span className="text-sm font-normal text-gray-500">HT / mois</span></p>
          <p className="mt-1 text-sm text-gray-500">au lieu de {PRIX.siteContact} € · sans engagement</p>
          <div className="mt-5"><BoutonActiverRdv className="btn-solid w-full" /></div>
          <p className="mt-3 text-xs text-gray-500">Pendant l&apos;essai, rien n&apos;est facturé. Abonnement en cours : la différence est calculée au prorata.</p>
        </div>
      </div>
    </div>
  );
}

/** Pas encore de site : présentation de l'offre et accès au créateur. */
export function SitePresentation({ profession, clientRdv }: { profession: "avocat" | "comptable"; clientRdv: boolean }) {
  const metier = profession === "comptable" ? "cabinet d'expertise comptable" : "cabinet d'avocats";
  return (
    <div className="card overflow-hidden">
      <div className="bg-brand-gradient p-8 sm:p-10">
        <p className="eyebrow text-gray-950/60">Site internet · nouveau</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight text-gray-950 sm:text-4xl">Le site de votre {metier}, prêt en 10 minutes</h1>
        <p className="mt-3 max-w-xl text-[15px] text-gray-800">Choisissez un style, vos sections et vos couleurs : les textes sont pré-rédigés à partir de vos domaines, dans le respect des règles déontologiques. Vous modifiez tout ensuite, sans compétence technique.</p>
        <Link href="/creer-mon-site" className="btn-solid mt-6">Créer mon site</Link>
      </div>
      <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3 text-[15px] text-gray-700">
          {["3 styles au choix : Light, Moderne ou Performance, et 15 palettes de couleurs",
            clientRdv ? "Votre prise de rendez-vous intégrée directement au site" : "Formulaire de contact ou prise de rendez-vous intégrée",
            "Avis Google, FAQ, méthode, actualités : vous choisissez les sections",
            "Mentions légales incluses, hébergement et mises à jour compris",
            "Adresse prête à partager : " + (profession === "comptable" ? "comptable" : "avocat") + ".clotere.fr/prenom-nom-ville"].map((t) => <li key={t} className="flex gap-3"><Coche />{t}</li>)}
        </ul>
        <div className="rounded-2xl bg-gray-50 p-6 ring-1 ring-black/5">
          <p className="text-sm text-gray-500">{clientRdv ? "Site + prise de rendez-vous" : "À partir de"}</p>
          <p className="mt-1 text-3xl font-medium text-gray-950">{clientRdv ? PRIX.siteRdv : PRIX.siteContact} € <span className="text-sm font-normal text-gray-500">HT / mois</span></p>
          <p className="mt-1 text-sm text-gray-500">{clientRdv ? `au lieu de ${PRIX.widget} € pour la prise de rendez-vous seule` : "-10 % en paiement annuel"}</p>
          <Link href="/creer-mon-site" className="btn-solid mt-5 w-full">Créer mon site</Link>
        </div>
      </div>
    </div>
  );
}
