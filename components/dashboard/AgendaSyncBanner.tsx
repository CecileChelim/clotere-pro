import Link from "next/link";
import { IconAlertTriangle, IconArrowRight } from "@/components/ui/icons";

export function AgendaSyncBanner() {
  return (
    <div className="mb-6 flex flex-col items-start gap-3 rounded-md border border-gold-2/60 bg-[#fbf3e2] px-4 py-3.5 text-sm text-ink-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p>
          Votre agenda n&rsquo;est pas encore synchronisé — vous ne pouvez pas recevoir de
          rendez-vous tant que ce n&rsquo;est pas fait.
        </p>
      </div>
      <Link
        href="/dashboard/agenda"
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-ink-2 underline underline-offset-2"
      >
        Synchroniser mon agenda <IconArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
