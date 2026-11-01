"use client";
// Onglet "LinkedIn" : lien « Prendre rendez-vous » en haut du profil (gratuit),
// ou bouton personnalisé pour les comptes Premium.
import React from "react";
import { PencilIcon, XMarkIcon } from "@heroicons/react/20/solid";
import {
  Card, CardTitle, Steps, Step, LinkBox, MarkInstalled, AideCard, BrowserMock, Pointer, ringed, TipBox, cx,
} from "./widgetUi";

const LI = "#0A66C2";

function MockProfile({ metier = "Avocat", nom }) {
  return (
    <BrowserMock url="linkedin.com/in/votre-profil" bodyClassName="bg-[#F4F2EE]">
      <div className="overflow-hidden rounded-lg border border-[#E0DFDC] bg-white">
        <div className="h-12 bg-[#C7D2E3]" />
        <div className="flex items-end justify-between gap-2 px-3">
          <span className="-mt-7 h-14 w-14 rounded-full border-[3px] border-white bg-gray-400" />
          <span className="flex items-center gap-2">
            <Pointer dir="right">Cliquez ici</Pointer>
            <span className={cx("rounded-full bg-violet-50 p-1.5 text-violet-600", ringed)}><PencilIcon className="h-3.5 w-3.5" /></span>
          </span>
        </div>
        <div className="px-3 pb-3 pt-1">
          <p className="text-sm font-semibold text-gray-900">{nom}</p>
          <p className="text-[11px] text-gray-800">{metier}</p>
          <p className="text-[10px] text-gray-500">France · <span className="font-semibold" style={{ color: LI }}>Coordonnées</span></p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white" style={{ backgroundColor: LI }}>Disponible pour</span>
            <span className="rounded-full border px-2.5 py-1 text-[10px] font-semibold" style={{ borderColor: LI, color: LI }}>Ajouter une section</span>
            <span className="rounded-full border px-2.5 py-1 text-[10px] font-semibold" style={{ borderColor: LI, color: LI }}>Plus</span>
          </div>
        </div>
      </div>
    </BrowserMock>
  );
}

function MockIntro({ url }) {
  return (
    <BrowserMock url="linkedin.com/in/votre-profil/edit/intro" bodyClassName="bg-[#F4F2EE]">
      <div className="space-y-3 rounded-lg border border-[#E0DFDC] bg-white p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Modifier l'intro</p>
          <XMarkIcon className="h-4 w-4 text-gray-500" />
        </div>
        <p className="border-b border-gray-200 pb-2 text-[10px] text-gray-400">⋮ Prénom, Nom, Titre, Poste actuel, Lieu…</p>
        <div>
          <p className="text-xs font-semibold text-gray-900">Site web</p>
          <p className="text-[10px] text-gray-500">Ajoutez un lien qui s'affichera en haut de votre profil</p>
        </div>
        {[
          ["Lien", url, "Collez le lien"],
          ["Texte du lien", "Prendre rendez-vous", "Écrivez ce texte"],
        ].map(([l, v, p]) => (
          <div key={l}>
            <p className="mb-1 text-[10px] font-medium text-gray-500">{l}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cx("min-w-0 flex-1 truncate rounded bg-white px-2.5 py-1.5 text-[11px] text-gray-900", ringed)}>{v}</span>
              <Pointer>{p}</Pointer>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-end gap-2 pt-1">
          <span className={cx("rounded-full px-4 py-1.5 text-[11px] font-semibold text-white", ringed)} style={{ backgroundColor: LI }}>Enregistrer</span>
          <Pointer>puis ici</Pointer>
        </div>
      </div>
    </BrowserMock>
  );
}

export function LinkedinInstall({ metier = "Avocat", bookingUrl, nom, installed, setInstalled }) {
  return (
    <Card>
      <CardTitle title="Ajouter à votre profil LinkedIn"
        subtitle="Un lien « Prendre rendez-vous » en haut de votre profil : vos contacts et les visiteurs réservent en un clic. 2 minutes, depuis votre ordinateur." />
      <Steps>
        <Step n={1} title="Copiez votre lien de prise de rendez-vous"><LinkBox url={bookingUrl} /></Step>
        <Step n={2} title="Sur votre profil, cliquez sur le crayon de votre présentation">
          C'est le crayon à droite, juste sous la bannière, au niveau de votre nom (pas celui de la photo de couverture).
          <div className="mt-3"><MockProfile nom={nom} metier={metier} /></div>
        </Step>
        <Step n={3} title="Descendez jusqu'à « Site web », collez le lien puis « Enregistrer »">
          Dans la fenêtre « Modifier l'intro », faites défiler jusqu'à la rubrique « Site web » : collez votre lien dans « Lien », écrivez « Prendre rendez-vous » dans « Texte du lien », puis enregistrez.
          <div className="mt-3"><MockIntro url={bookingUrl} /></div>
        </Step>
        <Step n={4} title="Vérifiez sur votre profil">
          Le lien « Prendre rendez-vous » apparaît désormais sous votre titre, visible par tous les visiteurs.
        </Step>
      </Steps>

      <div className="mt-6">
        <TipBox tone="violet" icon="★" title="Vous avez LinkedIn Premium ?">
          Si un bouton comme « Accéder à mon site web » apparaît sous votre profil, transformez-le : dans la même fenêtre « Modifier l'intro », rubrique « Bouton personnalisé », choisissez « Prendre rendez-vous » et collez le même lien. Le bouton s'affiche alors en grand, à côté de « Message ».
        </TipBox>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <a href="https://www.linkedin.com/in/me/" target="_blank" rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
          Ouvrir mon profil LinkedIn ↗
        </a>
        <MarkInstalled checked={installed} onChange={setInstalled} />
      </div>
    </Card>
  );
}

export function LinkedinSide({ metier = "Avocat", nom }) {
  return (
    <>
      <Card>
        <CardTitle title="Aperçu sur LinkedIn" />
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <div className="h-12 bg-violet-100" />
          <div className="p-3.5">
            <p className="text-sm font-semibold text-gray-900">{nom}</p>
            <p className="text-xs text-gray-500">{metier}</p>
            <p className="mt-1.5 text-xs font-bold" style={{ color: LI }}>Prendre rendez-vous ↗</p>
            <span className="mt-2.5 inline-block rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: LI, color: LI }}>Message</span>
          </div>
        </div>
      </Card>
      <AideCard />
    </>
  );
}
