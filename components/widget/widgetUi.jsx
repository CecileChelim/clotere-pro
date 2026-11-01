"use client";
// Petits composants partagés par les onglets de la page Widget.
import React, { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";

export const cx = (...c) => c.filter(Boolean).join(" ");

export const SUPPORT_URL = "https://calendar.app.google/ChJnbdhQ3Fo3xTox9";

export function Card({ className, children }) {
  return <section className={cx("rounded-2xl border border-gray-200 bg-white p-5 sm:p-6", className)}>{children}</section>;
}

export function CardTitle({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Steps({ children }) {
  return <ol className="mt-6 space-y-6">{children}</ol>;
}

export function Step({ n, title, children }) {
  return (
    <li className="flex gap-3 sm:gap-3.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-600">{n}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {children && <div className="mt-1 text-sm text-gray-500">{children}</div>}
      </div>
    </li>
  );
}

// Copie dans le presse-papier ; `html` optionnel pour coller du texte riche (signature).
export async function copyToClipboard(text, html) {
  try {
    if (html && window.ClipboardItem && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new window.ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(text);
    }
    return true;
  } catch {
    return false;
  }
}

export function CopyButton({ text, html, label = "Copier", copiedLabel = "Copié !", variant = "primary", className }) {
  const [done, setDone] = useState(false);
  const styles = {
    primary: "bg-violet-600 text-white hover:bg-violet-700",
    soft: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };
  return (
    <button type="button"
      onClick={async () => {
        if (await copyToClipboard(text, html)) {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        }
      }}
      className={cx("inline-flex shrink-0 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors", styles[variant], className)}>
      {done && <CheckIcon className="h-3.5 w-3.5" />}
      {done ? copiedLabel : label}
    </button>
  );
}

export function LinkBox({ url }) {
  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-1.5 pl-3.5 pr-1.5">
      <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-gray-900">{url.replace(/^https?:\/\//, "")}</code>
      <CopyButton text={url} />
    </div>
  );
}

export function MarkInstalled({ checked, onChange }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
      C'est fait, marquer comme installé
    </label>
  );
}

export function AideCard() {
  return (
    <a href={SUPPORT_URL} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 rounded-2xl bg-violet-50/70 p-4 hover:bg-violet-50">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-violet-600">?</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-900">Besoin d'un coup de main ?</span>
        <span className="block text-xs text-gray-500">On installe le widget avec vous.</span>
      </span>
      <span className="shrink-0 text-xs font-semibold text-violet-600">Contacter →</span>
    </a>
  );
}

// ---- Fausses captures d'écran (Google, LinkedIn) ----

export function BrowserMock({ url, bodyClassName = "bg-white", children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white text-left font-sans">
      <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-[10px] text-gray-500">{url}</span>
      </div>
      <div className={cx("space-y-3 p-3 sm:p-4", bodyClassName)}>{children}</div>
    </div>
  );
}

// Repère violet "← Cliquez ici"
export function Pointer({ children, dir = "left" }) {
  const Icon = dir === "left" ? ArrowLeftIcon : ArrowRightIcon;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  );
}

// Entoure un élément de la fausse capture (zone à cliquer)
export const ringed = "ring-2 ring-violet-600 ring-offset-2 ring-offset-white shadow-[0_0_0_6px_rgba(124,58,237,0.15)]";

export function TipBox({ tone = "amber", icon, title, children }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    violet: "border-violet-100 bg-violet-50/60 text-gray-700",
  };
  return (
    <div className={cx("flex gap-3 rounded-xl border p-3.5", tones[tone])}>
      {icon && <span className="mt-0.5 shrink-0 text-sm">{icon}</span>}
      <div className="min-w-0 text-sm">
        <p className="font-bold">{title}</p>
        <div className="mt-0.5 text-[13px] opacity-90">{children}</div>
      </div>
    </div>
  );
}
