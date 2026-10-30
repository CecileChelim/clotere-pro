import { IconArrowRight } from "@/components/ui/icons";
import { toTitleCase } from "@/lib/text";

export function ClosingCta({ prenom, nom }: { prenom: string; nom: string }) {
  const fullName = toTitleCase(`${prenom} ${nom}`);

  return (
    <div className="bg-ink">
      <div className="mx-auto max-w-5xl px-6 py-14 text-center">
        <h2 className="font-serif text-2xl text-cream sm:text-3xl">
          Envie d&rsquo;échanger avec {fullName} ?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-bar-text">
          Choisissez un motif, un créneau, et recevez une confirmation immédiate. Aucun paiement
          n&rsquo;est demandé pour réserver.
        </p>
        <a href="#rendez-vous" className="btn-solid mt-6 inline-flex bg-gold-2 text-ink">
          Prendre rendez-vous <IconArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
