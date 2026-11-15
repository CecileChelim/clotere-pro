"use client";

import { useEffect, useState } from "react";

/** Ouvre la prise de rendez-vous du cabinet (vraie page /rdv/<slug>) dans une fenêtre par-dessus le site. */
export function BoutonRdv({ lien, className, style, children }: { lien: string | null; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOuvert(false); };
    document.addEventListener("keydown", esc);
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = avant; };
  }, [ouvert]);

  // Aperçu (créateur, éditeur) : pas de lien réel, le bouton ne fait rien.
  if (!lien) return <button type="button" className={className} style={style}>{children}</button>;

  const url = `${lien}${lien.includes("?") ? "&" : "?"}source=site&embed=1`;
  return (
    <>
      <button type="button" className={className} style={style} onClick={() => setOuvert(true)}>{children}</button>
      {ouvert && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/55 p-0 sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) setOuvert(false); }}>
          <div className="relative h-full w-full overflow-hidden bg-white shadow-2xl sm:max-h-[860px] sm:max-w-[1100px] sm:rounded-2xl">
            <iframe src={url} title="Prise de rendez-vous" className="h-full w-full border-0" />
            <button type="button" aria-label="Fermer" onClick={() => setOuvert(false)}
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-2xl leading-none text-gray-950 shadow-md">×</button>
          </div>
        </div>
      )}
    </>
  );
}
