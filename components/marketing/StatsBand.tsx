const STATS = [
  { value: "100%", label: "des mentions ORIAS générées automatiquement" },
  { value: "0", label: "ligne de code requise" },
  { value: "4", label: "étapes pour publier" },
  { value: "69€", label: "par mois sans engagement" },
];

export function StatsBand() {
  return (
    <section className="bg-ink">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-16 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="font-serif text-4xl text-gold-2">{stat.value}</p>
            <p className="mt-2 text-sm text-bar-text">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
