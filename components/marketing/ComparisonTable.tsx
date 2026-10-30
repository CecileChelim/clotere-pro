import { IconCheck, IconCross } from "@/components/ui/icons";

type Cell = boolean | string;

const COLUMNS = ["Agence web sur mesure", "Annuaire généraliste", "Moneago"];

const ROWS: { label: string; values: Cell[] }[] = [
  { label: "Création et hébergement du site", values: [true, true, true] },
  { label: "Optimisation SEO continue", values: [false, false, true] },
  { label: "Prise de RDV intégrée", values: [false, false, true] },
  { label: "Intégration LinkedIn & Google Business", values: [false, false, true] },
  { label: "Mentions ORIAS automatiques", values: [false, false, true] },
  { label: "Mises à jour illimitées", values: [false, true, true] },
  { label: "Fiche à son nom (pas noyée dans un annuaire)", values: [true, false, true] },
  { label: "Sans engagement", values: [false, true, true] },
];

function CellValue({ value }: { value: Cell }) {
  if (typeof value === "string") {
    return <span className="text-sm text-ink-2">{value}</span>;
  }
  return value ? (
    <IconCheck className="mx-auto h-4 w-4 text-success" />
  ) : (
    <IconCross className="mx-auto h-4 w-4 text-muted" />
  );
}

export function ComparisonTable() {
  return (
    <section id="comparatif" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="max-w-xl">
        <p className="eyebrow">Comparatif</p>
        <h2 className="mt-3 font-serif text-3xl text-ink-2 sm:text-4xl">
          Pourquoi pas une agence, ou un annuaire ?
        </h2>
      </div>

      <div className="mt-10 overflow-x-auto">
        {/* Le rounded-xl + overflow-hidden doit être sur ce wrapper, pas sur
            <table> : les navigateurs ne clippent pas fiablement les fonds de
            cellules (ex. la colonne Moneago) aux coins arrondis d'un <table>. */}
        <div className="min-w-[640px] overflow-hidden rounded-xl border border-line">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="bg-white px-5 py-4 text-left text-sm font-normal text-muted">
                  &nbsp;
                </th>
                {COLUMNS.map((col, i) => (
                  <th
                    key={col}
                    className={`px-5 py-4 text-center text-sm font-medium ${
                      i === 2 ? "bg-ink-2 text-cream" : "bg-card-alt text-ink-2"
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr key={row.label} className={ri % 2 === 1 ? "bg-card-alt/40" : ""}>
                  <td className="border-t border-line px-5 py-3.5 text-sm text-body">
                    {row.label}
                  </td>
                  {row.values.map((value, ci) => (
                    <td
                      key={ci}
                      className={`border-t border-line px-5 py-3.5 text-center ${
                        ci === 2 ? "bg-ink-2/5" : ""
                      }`}
                    >
                      <CellValue value={value} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="border-t border-line px-5 py-4 text-sm font-medium text-ink-2">
                  Tarif mensuel
                </td>
                <td className="border-t border-line px-5 py-4 text-center text-sm text-body">
                  100–300 €
                </td>
                <td className="border-t border-line px-5 py-4 text-center text-sm text-body">
                  ≈ 50 €
                </td>
                <td className="border-t border-line bg-ink-2/5 px-5 py-4 text-center text-sm font-semibold text-ink-2">
                  69 €
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
