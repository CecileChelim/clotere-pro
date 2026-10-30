import Link from "next/link";
import { IconCalendarCheck, IconArrowRight } from "@/components/ui/icons";

export function AgendaSyncCard() {
  return (
    <div className="card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-card-alt text-gold">
        <IconCalendarCheck className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-medium text-ink-2">Synchronisez votre agenda</p>
      <p className="mt-1 text-sm text-body">
        Connectez Google Agenda pour que vos disponibilités réelles s&rsquo;affichent sur votre
        fiche.
      </p>
      <Link
        href="/dashboard/agenda"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold underline underline-offset-2"
      >
        Synchroniser <IconArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
