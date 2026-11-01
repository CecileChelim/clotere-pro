"use client";
// Onglet "Signature email" : signature avec un lien souligné classique.
import React, { useState } from "react";
import { Card, CardTitle, Steps, Step, CopyButton, MarkInstalled, AideCard, cx } from "./widgetUi";

const CLIENTS = {
  outlook: {
    label: "Outlook",
    steps: (
      <>
        <p><strong className="font-semibold text-gray-700">Nouvel Outlook et Outlook web :</strong> ⚙︎ Paramètres → Comptes → Signatures → « + Nouvelle signature » → collez, choisissez-la pour les nouveaux messages et les réponses, puis « Enregistrer ».</p>
        <p className="mt-1"><strong className="font-semibold text-gray-700">Outlook classique (Windows) :</strong> Fichier → Options → Courrier → Signatures… → Nouveau → collez → OK.</p>
      </>
    ),
  },
  gmail: {
    label: "Gmail",
    steps: <p>⚙︎ Paramètres → Voir tous les paramètres → onglet « Général » → section « Signature » → « Créer » → collez, puis « Enregistrer les modifications » en bas de page.</p>,
  },
  apple: {
    label: "Apple Mail",
    steps: <p>Mail → Réglages → Signatures → « + » → collez la signature. Décochez « Toujours utiliser ma police par défaut » pour garder la mise en forme.</p>,
  },
};

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function signatureParts({ metier = "Avocat", nom, etude, telephone, bookingUrl }) {
  const details = [metier, etude, telephone].filter(Boolean).join(" · ");
  const html =
    `<p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;">Bien cordialement,</p>` +
    `<p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#111827;">${esc(nom)}</p>` +
    `<p style="margin:2px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">${esc(details)}</p>` +
    `<p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:13px;"><a href="${esc(bookingUrl)}" style="color:#1e40af;text-decoration:underline;font-weight:600;">Prendre rendez-vous en ligne</a></p>`;
  const text = `Bien cordialement,\n${nom}\n${details}\nPrendre rendez-vous en ligne : ${bookingUrl}`;
  return { details, html, text };
}

function SignaturePreview({ metier = "Avocat", nom, details, bookingUrl }) {
  return (
    <div className="text-left">
      <p className="text-xs text-gray-500">Bien cordialement,</p>
      <p className="mt-1.5 text-sm font-bold text-gray-900">{nom}</p>
      <p className="text-[11px] text-gray-500">{details}</p>
      <a href={bookingUrl} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-xs font-semibold text-blue-800 underline">
        Prendre rendez-vous en ligne
      </a>
    </div>
  );
}

export function SignatureInstall({ metier = "Avocat", bookingUrl, nom, etude, telephone, installed, setInstalled }) {
  const [client, setClient] = useState("outlook");
  const { details, html, text } = signatureParts({ metier, nom, etude, telephone, bookingUrl });

  return (
    <Card>
      <CardTitle title="Ajouter à votre signature email"
        subtitle="Un lien discret sous chacun de vos emails : vos clients et prospects prennent rendez-vous sans vous écrire." />
      <Steps>
        <Step n={1} title="Copiez votre signature avec le lien">
          <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4">
            <SignaturePreview nom={nom} metier={metier} details={details} bookingUrl={bookingUrl} />
          </div>
          <CopyButton text={text} html={html} label="Copier la signature" copiedLabel="Signature copiée" className="mt-2.5 px-3.5 py-2" />
        </Step>
        <Step n={2} title="Collez-la dans votre messagerie">
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(CLIENTS).map(([k, c]) => (
              <button key={k} type="button" onClick={() => setClient(k)}
                className={cx("rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  client === k ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50")}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="mt-2.5 text-[13px] leading-relaxed">{CLIENTS[client].steps}</div>
        </Step>
        <Step n={3} title="Envoyez-vous un email de test">
          Vérifiez que le lien « Prendre rendez-vous en ligne » s'affiche sous votre nom et qu'il ouvre bien votre page de réservation.
        </Step>
      </Steps>
      <div className="mt-6"><MarkInstalled checked={installed} onChange={setInstalled} /></div>
    </Card>
  );
}

export function SignatureSide({ metier = "Avocat", bookingUrl, nom, etude, telephone }) {
  const { details } = signatureParts({ metier, nom, etude, telephone, bookingUrl });
  return (
    <>
      <Card>
        <CardTitle title="Aperçu dans un email" />
        <div className="mt-4 rounded-xl bg-gray-50 p-3.5">
          <p className="text-xs text-gray-600">Bonjour Madame Martin,<br />Veuillez trouver ci-joint le projet d'acte…</p>
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3.5">
            <SignaturePreview nom={nom} metier={metier} details={details} bookingUrl={bookingUrl} />
          </div>
        </div>
      </Card>
      <AideCard />
    </>
  );
}
