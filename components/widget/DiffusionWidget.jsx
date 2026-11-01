"use client";

// Page « Diffusez votre lien » : reprise du module widget des notaires (onglets + captures guidées).
import React, { useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { SiteInstall, SiteSide } from "./TabSite";
import { GoogleInstall, GoogleSide } from "./TabGoogle";
import { SignatureInstall, SignatureSide } from "./TabSignature";
import { LinkedinInstall, LinkedinSide } from "./TabLinkedin";
import { CopyButton, AideCard, cx } from "./widgetUi";

const CHANNELS = [
  { key: "site", label: "Site internet" },
  { key: "google", label: "Fiche Google" },
  { key: "signature", label: "Signature email" },
  { key: "linkedin", label: "LinkedIn" },
];

const storageKey = (id) => `clotere_pro_widget_${id}`;
function readLocal(id) {
  try { return JSON.parse(localStorage.getItem(storageKey(id)) || "{}"); } catch { return {}; }
}
function writeLocal(id, value) {
  try { localStorage.setItem(storageKey(id), JSON.stringify(value)); } catch { /* navigation privée */ }
}

function ChannelTabs({ active, onChange, status }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <div className="inline-flex gap-0.5 rounded-xl border border-gray-200 bg-white p-1">
        {CHANNELS.map((c) => {
          const on = c.key === active;
          const ok = status[c.key];
          return (
            <button key={c.key} type="button" onClick={() => onChange(c.key)} aria-current={on ? "page" : undefined}
              className={cx("flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                on ? "bg-violet-50 text-violet-600" : "text-gray-700 hover:bg-gray-50")}>
              {c.label}
              {ok ? <CheckIcon className="h-4 w-4 text-emerald-500" aria-label="Installé" />
                : <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-label="À installer" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LinkPill({ url }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-gray-200 bg-white py-1 pl-3.5 pr-1">
      <span className="shrink-0 text-xs font-medium text-gray-400">Votre lien</span>
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-gray-700">{url.replace(/^https?:\/\//, "")}</code>
      <CopyButton text={url} variant="soft" />
    </div>
  );
}

export default function DiffusionWidget({ proId, slug, base, nom, office, telephone, email, cabinetNom, metier = "Avocat" }) {
  const bookingUrl = `${base}/rdv/${slug}`;
  const urlFor = (source) => `${bookingUrl}?source=${source}`;

  const [tab, setTab] = useState("site");
  const [mode, setMode] = useState("floating");
  const [color, setColor] = useState("#7c3aed");
  const [label, setLabel] = useState("Prendre RDV");
  const [manual, setManual] = useState({});
  const [loaded, setLoaded] = useState(false);

  // Réglages du bouton et canaux installés : mémorisés dans ce navigateur pour l'instant.
  useEffect(() => {
    const s = readLocal(proId);
    if (s.mode) setMode(s.mode);
    if (s.color) setColor(s.color);
    if (s.label) setLabel(s.label);
    setManual(s.canaux || {});
    setLoaded(true);
  }, [proId]);
  useEffect(() => {
    if (loaded) writeLocal(proId, { mode, color, label, canaux: manual });
  }, [loaded, proId, mode, color, label, manual]);

  const setInstalled = (key) => (value) => setManual((m) => ({ ...m, [key]: value }));
  const status = { site: !!manual.site, google: !!manual.google, signature: !!manual.signature, linkedin: !!manual.linkedin };
  const sig = { bookingUrl: urlFor("mail"), nom, etude: cabinetNom, telephone, metier };

  return (
    <div>
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <p className="eyebrow">Diffusez votre lien</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-gray-950">Widget de prise de rendez-vous</h1>
          <p className="mt-2 text-sm text-gray-500">
            Installez votre bouton « Prendre rendez-vous » partout où vos clients vous cherchent : site, fiche Google, emails et LinkedIn.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <ChannelTabs active={tab} onChange={setTab} status={status} />
        <div className="xl:w-[24rem]"><LinkPill url={bookingUrl} /></div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          {tab === "site" && (
            <>
              <SiteInstall avocatId={slug} userEmail={email} mode={mode} base={base} color={color} label={label} />
              <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={status.site} onChange={(e) => setInstalled("site")(e.target.checked)} className="accent-violet-600" />
                J&apos;ai installé le bouton sur mon site
              </label>
            </>
          )}
          {tab === "google" && <GoogleInstall bookingUrl={urlFor("google")} office={office} installed={status.google} setInstalled={setInstalled("google")} />}
          {tab === "signature" && <SignatureInstall {...sig} installed={status.signature} setInstalled={setInstalled("signature")} />}
          {tab === "linkedin" && <LinkedinInstall metier={metier} bookingUrl={urlFor("linkedin")} nom={nom} installed={status.linkedin} setInstalled={setInstalled("linkedin")} />}
        </div>
        <div className="min-w-0 space-y-5">
          {tab === "site" && (
            <>
              <SiteSide mode={mode} setMode={setMode} color={color} setColor={setColor} label={label} setLabel={setLabel}
                saveStatus="idle" onPreview={() => window.open(urlFor("site"), "_blank")} />
              <AideCard />
            </>
          )}
          {tab === "google" && <GoogleSide office={office} />}
          {tab === "signature" && <SignatureSide {...sig} />}
          {tab === "linkedin" && <LinkedinSide metier={metier} nom={nom} />}
        </div>
      </div>
    </div>
  );
}
