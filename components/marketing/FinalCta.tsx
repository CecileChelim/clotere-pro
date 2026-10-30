import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";

export function FinalCta() {
  return (
    <section id="tarif" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="rounded-xl bg-ink px-8 py-16 text-center sm:px-16">
        <p className="eyebrow text-bar-text">Tarif</p>
        <h2 className="mt-3 font-serif text-3xl text-cream sm:text-4xl">
          69 € par mois, sans engagement
        </h2>
        <p className="mx-auto mt-4 max-w-md text-bar-text">
          Fiche professionnelle, prise de RDV en ligne et diffusion sur LinkedIn et Google
          Business, inclus dès le premier jour.
        </p>
        <Link href="/signup" className="btn-solid mt-8 inline-flex bg-gold-2 text-ink">
          Créer ma fiche professionnelle <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
