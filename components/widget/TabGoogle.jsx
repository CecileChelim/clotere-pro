"use client";
// Onglet "Fiche Google" : guide illustré (fausses captures de l'interface Google).
import React from "react";
import { MagnifyingGlassIcon, PencilIcon, XMarkIcon, ArrowLeftIcon, CalendarDaysIcon } from "@heroicons/react/20/solid";
import {
  Card, CardTitle, Steps, Step, LinkBox, MarkInstalled, AideCard, BrowserMock, Pointer, ringed, TipBox, cx,
} from "./widgetUi";

const chip = "rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-800";

function MockSearch({ office }) {
  return (
    <BrowserMock url={`google.fr/search?q=${encodeURIComponent(office).replace(/%20/g, "+")}`}>
      <div className="flex max-w-sm items-center gap-2 rounded-full border border-gray-300 px-3.5 py-2 text-xs text-gray-800">
        <MagnifyingGlassIcon className="h-3.5 w-3.5 text-gray-500" />
        <span className="truncate">{office}</span>
      </div>
      <div className="rounded-xl border border-gray-300 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">{office}</p>
            <p className="text-[11px] text-gray-500">Votre fiche d'établissement</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">✓ Vous gérez cette fiche</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={cx(chip, "border-violet-600 bg-violet-50 text-violet-700", ringed)}>Modifier le profil</span>
          <Pointer>Cliquez ici</Pointer>
          <span className={cx(chip, "hidden sm:inline")}>Lire les avis</span>
          <span className={cx(chip, "hidden sm:inline")}>Photos</span>
        </div>
      </div>
    </BrowserMock>
  );
}

function MockEdit() {
  return (
    <BrowserMock url="business.google.com · Modifier le profil">
      <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <XMarkIcon className="h-4 w-4 text-gray-500" /> Modifier le profil
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 pb-2 text-[11px] font-medium text-gray-500">
        <span>À propos</span>
        <span className={cx("rounded-md bg-violet-50 px-2 py-1 font-semibold text-[#0B57D0]", ringed)}>Coordonnées</span>
        <Pointer>1</Pointer>
        <span className="hidden sm:inline">Emplacement et zone</span>
        <span className="hidden sm:inline">Horaires</span>
        <span>Plus</span>
      </div>
      {[
        ["Numéro de téléphone", "02 99 00 00 00"],
        ["Site Web", "www.votre-cabinet.fr"],
      ].map(([l, v]) => (
        <div key={l} className="flex items-center justify-between text-[11px]">
          <span><span className="block font-medium text-gray-900">{l}</span><span className="text-gray-500">{v}</span></span>
          <PencilIcon className="h-3.5 w-3.5 text-gray-400" />
        </div>
      ))}
      <div className="flex items-center gap-2 rounded-lg bg-violet-50/50 px-2 py-1.5 text-[11px]">
        <span className="min-w-0 flex-1"><span className="block font-medium text-gray-900">Liens de prise de rendez-vous</span><span className="text-gray-500">Aucun lien ajouté</span></span>
        <Pointer>2 · le crayon</Pointer>
        <span className={cx("rounded-full bg-violet-50 p-1.5 text-violet-600", ringed)}><PencilIcon className="h-3.5 w-3.5" /></span>
      </div>
    </BrowserMock>
  );
}

function MockPaste({ url }) {
  return (
    <BrowserMock url="business.google.com · Liens de prise de rendez-vous">
      <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <ArrowLeftIcon className="h-4 w-4 text-gray-500" /> Liens de prise de rendez-vous
      </p>
      <p className="text-[11px] text-gray-500">Ajoutez un lien qui permet à vos clients de prendre rendez-vous.</p>
      <div className="flex flex-wrap items-center gap-2">
        <div className={cx("min-w-0 flex-1 rounded-md bg-white px-3 py-1.5", ringed)}>
          <p className="text-[9px] font-medium text-[#0B57D0]">Lien de prise de rendez-vous</p>
          <p className="truncate text-xs text-gray-900">{url}</p>
        </div>
        <Pointer>Collez</Pointer>
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="px-2 text-[11px] font-medium text-[#0B57D0]">Annuler</span>
        <span className={cx("rounded-full bg-[#0B57D0] px-4 py-1.5 text-[11px] font-medium text-white", ringed)}>Enregistrer</span>
        <Pointer>puis ici</Pointer>
      </div>
    </BrowserMock>
  );
}

export function GoogleInstall({ bookingUrl, office, installed, setInstalled }) {
  return (
    <Card>
      <CardTitle title="Installer sur votre fiche Google"
        subtitle="Un bouton « Prendre RDV » sur votre fiche Google (recherche et Google Maps). Comptez 3 minutes : suivez les captures, les zones à cliquer sont entourées en violet." />
      <Steps>
        <Step n={1} title="Copiez votre lien de prise de rendez-vous"><LinkBox url={bookingUrl} /></Step>
        <Step n={2} title="Recherchez le nom de votre cabinet sur Google">
          Connecté au compte Google qui gère la fiche, tapez le nom de votre cabinet : votre panneau de gestion apparaît en haut des résultats. Cliquez sur « Modifier le profil ».
          <div className="mt-3"><MockSearch office={office} /></div>
        </Step>
        <Step n={3} title="Onglet « Coordonnées » → crayon de « Liens de prise de rendez-vous »">
          Dans la fenêtre qui s'ouvre, allez dans l'onglet « Coordonnées », descendez jusqu'à « Liens de prise de rendez-vous » et cliquez sur le crayon.
          <div className="mt-3"><MockEdit /></div>
        </Step>
        <Step n={4} title="Collez votre lien puis « Enregistrer »">
          Google vérifie la modification : le bouton peut mettre jusqu'à 48 h à apparaître.
          <div className="mt-3"><MockPaste url={bookingUrl} /></div>
        </Step>
      </Steps>

      <div className="mt-6">
        <TipBox icon="💡" title="Pas de bouton « Modifier le profil » ?">
          Vous n'êtes pas connecté au compte qui gère la fiche. Changez de compte Google, ou demandez au propriétaire de la fiche de vous ajouter comme gestionnaire. Les intitulés peuvent varier légèrement selon les mises à jour de Google.
        </TipBox>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <a href={`https://www.google.com/search?q=${encodeURIComponent(office)}`} target="_blank" rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
          Rechercher mon cabinet sur Google ↗
        </a>
        <MarkInstalled checked={installed} onChange={setInstalled} />
      </div>
    </Card>
  );
}

export function GoogleSide({ office }) {
  return (
    <>
      
      <AideCard />
    </>
  );
}
