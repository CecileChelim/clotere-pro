"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type MessageSite = { id: string; prenom: string | null; nom: string; email: string; telephone: string | null; objet: string | null; message: string; lu: boolean; created_at: string };

/** Messages reçus par le formulaire de contact du site. */
export function MessagesSite({ messages: init }: { messages: MessageSite[] }) {
  const [messages, setMessages] = useState(init);
  const [ouvert, setOuvert] = useState<string | null>(null);

  async function ouvrir(m: MessageSite) {
    setOuvert(ouvert === m.id ? null : m.id);
    if (!m.lu) {
      setMessages((xs) => xs.map((x) => (x.id === m.id ? { ...x, lu: true } : x)));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (createClient() as any).from("site_messages").update({ lu: true }).eq("id", m.id);
    }
  }

  if (!messages.length) {
    return <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-600 ring-1 ring-black/5">Aucun message pour l&apos;instant. Les demandes envoyées depuis votre site arriveront ici et par e-mail.</div>;
  }
  return (
    <ul className="divide-y divide-gray-100 rounded-2xl ring-1 ring-black/5">
      {messages.map((m) => (
        <li key={m.id}>
          <button type="button" onClick={() => ouvrir(m)} className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-gray-50">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.lu ? "bg-transparent" : "bg-violet-600"}`} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className={`truncate text-sm ${m.lu ? "text-gray-700" : "font-semibold text-gray-950"}`}>{`${m.prenom ?? ""} ${m.nom}`.trim()}{m.objet && <span className="font-normal text-gray-500"> · {m.objet}</span>}</span>
                <span className="shrink-0 text-xs text-gray-400">{new Date(m.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </span>
              {ouvert === m.id ? (
                <span className="mt-3 block space-y-3 text-sm text-gray-700">
                  <span className="block whitespace-pre-line">{m.message}</span>
                  <span className="flex flex-wrap gap-4 text-gray-950">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.objet ?? "votre message"}`)}`} className="font-medium underline">{m.email}</a>
                    {m.telephone && <a href={`tel:${m.telephone.replace(/\s/g, "")}`} className="font-medium underline">{m.telephone}</a>}
                  </span>
                </span>
              ) : (
                <span className="mt-1 block truncate text-sm text-gray-500">{m.message}</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
