import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import type { Motif, Professional } from "@/types/database";

const AVANTAGES = [
  "Confirmation immédiate par email",
  "Aucun paiement en ligne requis",
  "Vos coordonnées ne servent qu'à ce rendez-vous",
];

export function BookingSidebar({
  professional,
  motifs,
}: {
  professional: Professional;
  motifs: Motif[];
}) {
  return (
    <div className="card overflow-hidden shadow-[0_24px_60px_-24px_rgba(23,21,18,0.25)]">
      <div className="p-6">
        <p className="font-serif text-xl text-ink-2">Prendre rendez-vous</p>
        <p className="mt-1 text-sm text-muted">Choisissez un motif pour commencer.</p>

        {motifs.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-body">
            {motifs.map((motif) => (
              <li
                key={motif.id}
                className="cursor-pointer rounded-md border border-line px-3.5 py-2.5 transition-colors hover:border-ink-2 hover:bg-card-alt"
              >
                {motif.libelle}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Les motifs de rendez-vous seront bientôt disponibles.
          </p>
        )}

        <button className="btn-solid mt-5 w-full">
          Prendre rendez-vous <IconArrowRight className="h-4 w-4" />
        </button>

        {professional.modalites && professional.modalites.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-5">
            {professional.modalites.map((m) => (
              <span key={m} className="chip text-xs">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      <ul className="space-y-2.5 bg-card-alt px-6 py-5 text-sm text-body">
        {professional.accepte_nouveaux_clients && (
          <li className="flex items-center gap-2">
            <IconCheck className="h-4 w-4 shrink-0 text-success" />
            Accepte de nouveaux clients
          </li>
        )}
        {AVANTAGES.map((avantage) => (
          <li key={avantage} className="flex items-center gap-2">
            <IconCheck className="h-4 w-4 shrink-0 text-success" />
            {avantage}
          </li>
        ))}
      </ul>
    </div>
  );
}
