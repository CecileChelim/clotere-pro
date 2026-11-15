/** Haut de page de l'espace pro : nom de la section, titre, et l'action principale à droite. */
export function EnTetePage({ section, titre, cta }: { section: string; titre: React.ReactNode; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="eyebrow">{section}</p>
        <h1 className="mt-2 truncate text-3xl font-medium tracking-tight text-gray-950 sm:text-4xl">{titre}</h1>
      </div>
      {cta && <div className="shrink-0">{cta}</div>}
    </div>
  );
}

/** Onglets sous le haut de page (liens ou boutons). */
export function Onglets<T extends string>({ onglets, actif, onChange }: { onglets: { id: T; label: React.ReactNode }[]; actif: T; onChange: (id: T) => void }) {
  return (
    <div className="mt-6 flex gap-1 overflow-x-auto border-b border-gray-100">
      {onglets.map((o) => (
        <button key={o.id} type="button" onClick={() => onChange(o.id)}
          className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${actif === o.id ? "border-gray-950 text-gray-950" : "border-transparent text-gray-500 hover:text-gray-950"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
