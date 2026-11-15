"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteRendu } from "@/lib/site/types";
import { SiteRenderer } from "@/components/mon-site/SiteRenderer";

/** Aperçu en direct d'un site : rendu à la largeur d'un écran (ordinateur ou mobile) puis réduit pour tenir dans le cadre. */
export function Apercu({ d, className = "" }: { d: SiteRendu; className?: string }) {
  const [ecran, setEcran] = useState<"ordi" | "mobile">("ordi");
  const cadre = useRef<HTMLDivElement>(null);
  const contenu = useRef<HTMLDivElement>(null);
  const [dim, setDim] = useState({ dispo: 0, haut: 0 });
  const largeur = ecran === "ordi" ? 1280 : 390;

  useEffect(() => {
    const ro = new ResizeObserver(() => setDim({ dispo: cadre.current?.clientWidth ?? 0, haut: contenu.current?.scrollHeight ?? 0 }));
    if (cadre.current) ro.observe(cadre.current);
    if (contenu.current) ro.observe(contenu.current);
    return () => ro.disconnect();
  }, [ecran]);

  const echelle = dim.dispo ? Math.min(1, (dim.dispo - (ecran === "mobile" ? 0 : 0)) / largeur) : 0.5;

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="truncate text-xs text-gray-500">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />Aperçu en direct{d.slug ? <> · <span className="font-medium text-gray-700">{d.profession === "comptable" ? "comptable" : "avocat"}.clotere.fr/{d.slug}</span></> : null}
        </p>
        <div className="flex shrink-0 rounded-full bg-white p-1 text-xs ring-1 ring-black/10">
          {(["ordi", "mobile"] as const).map((e) => (
            <button key={e} type="button" onClick={() => setEcran(e)}
              className={`rounded-full px-3 py-1.5 font-medium ${ecran === e ? "bg-gray-950 text-white" : "text-gray-600"}`}>
              {e === "ordi" ? "Ordinateur" : "Mobile"}
            </button>
          ))}
        </div>
      </div>
      <div ref={cadre} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className={ecran === "mobile" ? "mx-auto" : ""} style={{ width: largeur * echelle, height: dim.haut * echelle }}>
          <div ref={contenu} style={{ width: largeur, transform: `scale(${echelle})`, transformOrigin: "top left" }}>
            <SiteRenderer d={d} />
          </div>
        </div>
      </div>
    </div>
  );
}
