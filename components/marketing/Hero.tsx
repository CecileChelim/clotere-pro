import Link from "next/link";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { BookingDemo } from "./BookingDemo";

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div>
          <span className="chip">Réservé aux CGP &amp; CGPI</span>

          <h1 className="mt-6 font-serif text-4xl leading-[1.1] text-ink-2 sm:text-5xl">
            Votre site professionnel de CGP, avec la{" "}
            <span className="text-gold">prise de rendez-vous en ligne</span> intégrée.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-body">
            Vos clients réservent quand ils veulent — même le dimanche soir. Publiez votre fiche
            en 5 minutes et intégrez la prise de RDV sur votre site, LinkedIn ou Google Business.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={isAuthenticated ? "/dashboard" : "/signup"} className="btn-solid">
              {isAuthenticated ? "Aller à mon espace CGP" : "Créer ma fiche professionnelle"}{" "}
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/#tarif" className="btn-outline">
              Voir le tarif
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <IconCheck className="h-4 w-4 text-success" /> Actif en 5 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck className="h-4 w-4 text-success" /> Sans engagement
            </span>
            <span className="flex items-center gap-1.5">
              <IconCheck className="h-4 w-4 text-success" /> Conforme ORIAS
            </span>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <BookingDemo />
        </div>
      </div>
    </section>
  );
}
