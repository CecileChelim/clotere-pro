import Link from "next/link";
import { IconAlertTriangle, IconArrowRight } from "@/components/ui/icons";

export function AgendaSyncBanner() {
  return (
    <div role="alert" className="mb-8 flex flex-col gap-4 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-300 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-white shadow-sm">
          <IconAlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-semibold text-amber-950">Votre agenda n&rsquo;est pas encore synchronisé</p>
          <p className="mt-0.5 text-sm text-amber-900/80">
            Vous ne pouvez pas recevoir de rendez-vous tant que ce n&rsquo;est pas fait. Ça prend 1 minute.
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/agenda"
        className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gray-950 px-5 py-3 text-sm font-medium text-white shadow-md transition hover:bg-gray-800"
      >
        Synchroniser mon agenda <IconArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
