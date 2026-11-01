"use client";
// Onglet "Site internet" : code d'intégration + personnalisation du bouton.
import React, { useState } from "react";
import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { Card, CardTitle, Steps, Step, CopyButton, cx } from "./widgetUi";

const PRESET_COLORS = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#1e293b"];
const PROD_BASE = "https://avocat.clotere.fr";

function WebmasterForm({ avocatId, userEmail, snippet }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent | error

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    const body = `Bonjour,\n\nPouvez-vous ajouter ce code juste avant la balise </body> de notre site ? Il affiche le bouton de prise de rendez-vous en ligne.\n\n${snippet}\n\nMerci !\n${userEmail || ""}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent("Installation du bouton de prise de rendez-vous")}&body=${encodeURIComponent(body)}`;
    setState("sent");
    setTimeout(() => setState("idle"), 4000);
  };

  return (
    <div className="mt-6">
      <p className="text-sm">
        <span className="font-semibold text-gray-900">Pas à l'aise avec le code ?</span>{" "}
        <span className="text-gray-500">On envoie tout à votre webmaster.</span>
      </p>
      <form onSubmit={submit} className="mt-2.5 flex flex-col gap-2 sm:flex-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@votrewebmaster.fr"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20" />
        <button type="submit" disabled={state === "sending"}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50">
          {state === "sending" ? "Envoi…" : "Envoyer les instructions"}
        </button>
      </form>
      {state === "sent" && <p className="mt-2 text-xs text-emerald-600">Votre messagerie s'ouvre avec les instructions prêtes à envoyer ✓</p>}
      {state === "error" && <p className="mt-2 text-xs text-red-600">L'envoi a échoué. Vérifiez l'adresse ou réessayez.</p>}
    </div>
  );
}

export function SiteInstall({ avocatId, userEmail, mode, base = PROD_BASE, color, label }) {
  const inline = mode === "inline";
  const snippet = inline
    ? `<script src="${base}/widget.js"\n        data-pro="${avocatId}"\n        data-target="clotere-rdv"\n        data-color="${color}"\n        data-label="${label}"\n        data-source="site"></script>`
    : `<script src="${base}/widget.js"\n        data-pro="${avocatId}"\n        data-color="${color}"\n        data-label="${label}"\n        data-source="site"></script>`;
  const target = `<div id="clotere-rdv"></div>`;

  return (
    <Card>
      <CardTitle title="Installer sur votre site internet"
        subtitle="3 minutes, une seule fois. Fonctionne sur WordPress, Wix, Squarespace et tous les sites HTML." />
      <Steps>
        {inline && (
          <Step n={1} title="Placez cette balise là où le bouton doit apparaître">
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-950 py-1.5 pl-3 pr-1.5">
              <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-emerald-300">{target}</code>
              <CopyButton text={target} />
            </div>
          </Step>
        )}
        <Step n={inline ? 2 : 1} title="Copiez le code ci-dessous">Un seul bout de code suffit.</Step>
        <Step n={inline ? 3 : 2} title={<>Collez-le juste avant <code className="rounded bg-gray-100 px-1 text-xs">&lt;/body&gt;</code> sur votre site</>}>
          Ou envoyez-le à votre webmaster en un clic, plus bas.
        </Step>
        <Step n={inline ? 4 : 3} title="C'est en ligne !">
          {inline ? "Le bouton apparaît à l'endroit de la balise." : "Le bouton apparaît en bas à droite."} Couleur et texte se changent ici, sans toucher au code.
        </Step>
      </Steps>

      <div className="mt-6 overflow-hidden rounded-xl bg-gray-950">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <span className="text-xs text-gray-400">Votre code d'intégration</span>
          <CopyButton text={snippet} label="Copier le code" />
        </div>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-emerald-300"><code>{snippet}</code></pre>
      </div>

      <WebmasterForm avocatId={avocatId} userEmail={userEmail} snippet={snippet} />
    </Card>
  );
}

export function SiteSide({ mode, setMode, color, setColor, label, setLabel, saveStatus, onPreview }) {
  return (
    <>
      

      <Card>
        <CardTitle title="Aperçu" />
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="ml-1.5 flex-1 rounded bg-white px-2 py-0.5 text-[10px] text-gray-400">www.votre-cabinet.fr</span>
          </div>
          <div className="relative h-36 bg-white p-3.5">
            <div className="space-y-1.5">
              <div className="h-1.5 w-2/3 rounded bg-gray-100" />
              <div className="h-1.5 w-1/2 rounded bg-gray-100" />
              <div className="h-1.5 w-3/5 rounded bg-gray-100" />
            </div>
            <span className={cx("absolute inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-white shadow-lg",
              mode === "inline" ? "left-3.5 top-14" : "bottom-3 right-3")}
              style={{ backgroundColor: color }}>
              <CalendarDaysIcon className="h-3.5 w-3.5" />
              {label || "Prendre rendez-vous"}
            </span>
          </div>
        </div>
        <button type="button" onClick={onPreview} className="mt-3 text-sm font-semibold text-violet-600 hover:text-violet-800">
          Tester le parcours de réservation →
        </button>
      </Card>
    </>
  );
}
