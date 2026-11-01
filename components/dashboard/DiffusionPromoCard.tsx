import Link from "next/link";
import { IconShare, IconArrowRight } from "@/components/ui/icons";

export function DiffusionPromoCard() {
  return (
    <div className="card p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-white">
        <IconShare className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-medium text-ink-2">Diffusez votre lien de RDV</p>
      <p className="mt-1 text-sm text-body">
        Ajoutez votre lien de réservation sur LinkedIn et votre fiche Google Business.
      </p>
      <Link
        href="/dashboard/diffusion"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold underline underline-offset-2"
      >
        Voir le guide <IconArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
