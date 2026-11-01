import { IconCalendarCheck, IconExternalLink } from "@/components/ui/icons";

export type BookingCardData = {
  dateLabel: string; // ex. "Jeudi 18 septembre"
  timeLabel: string; // ex. "14h00 – 14h30"
  motif: string;
  typeRdv: "Visioconférence" | "Téléphone" | "Cabinet" | "Domicile";
  clientNom: string;
  clientEmail: string;
  clientTelephone?: string;
  message?: string;
  eventUrl?: string;
};

export function BookingCard({
  booking,
  example = false,
}: {
  booking: BookingCardData;
  example?: boolean;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-950 text-white">
            <IconCalendarCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-2">
              {booking.dateLabel} · {booking.timeLabel}
            </p>
            <p className="text-xs text-muted">
              {booking.motif} — {booking.typeRdv}
            </p>
          </div>
        </div>
        {example && (
          <span className="rounded-full bg-card-alt px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted">
            Exemple
          </span>
        )}
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-muted">Client</dt>
          <dd className="text-ink-2">{booking.clientNom}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-muted">Email</dt>
          <dd className="text-body">{booking.clientEmail}</dd>
        </div>
        {booking.clientTelephone && (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">Téléphone</dt>
            <dd className="text-body">{booking.clientTelephone}</dd>
          </div>
        )}
        {booking.message && (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted">Message</dt>
            <dd className="text-body">{booking.message}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        {booking.eventUrl && (
          <a
            href={booking.eventUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-gold underline underline-offset-2"
          >
            Voir dans mon agenda <IconExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button type="button" className="btn-outline px-3.5 py-2 text-xs">
            Modifier
          </button>
          <button type="button" className="px-2 py-2 text-xs text-red-600 hover:underline">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
