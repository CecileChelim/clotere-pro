import { IconArrowRight, IconCheck } from "@/components/ui/icons";

const SPECIALITES = ["Succession", "Fiscalité", "Retraite", "Immobilier"];

export function ProductPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="max-w-xl">
        <p className="eyebrow">Votre fiche, en vrai</p>
        <h2 className="mt-3 font-serif text-3xl text-ink-2 sm:text-4xl">
          Voici à quoi ressemble votre fiche publique
        </h2>
        <p className="mt-3 text-body">
          Indexable par Google, avec vos spécialités, vos informations réglementaires et la prise
          de rendez-vous, exactement comme vos futurs clients la verront.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border border-line bg-white shadow-[0_30px_80px_-30px_rgba(23,21,18,0.25)]">
        {/* Barre de navigateur */}
        <div className="flex items-center gap-3 border-b border-line bg-card-alt px-5 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-chip-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-chip-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-chip-line" />
          </div>
          <div className="flex-1 rounded-md bg-white px-3 py-1.5 text-center text-xs text-muted">
            moneago.fr/lyon/claire-moreau
          </div>
        </div>

        {/* Fiche exemple */}
        <div className="grid grid-cols-1 gap-8 p-8 sm:p-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 shrink-0 rounded-full bg-gold-2" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-2xl text-ink-2">Claire Moreau</h3>
                  <span className="chip text-xs">
                    <IconCheck className="h-3.5 w-3.5 text-success" /> Vérifiée
                  </span>
                </div>
                <p className="mt-1 text-body">Conseillère en gestion de patrimoine · Lyon</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SPECIALITES.map((s) => (
                    <span key={s} className="chip text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <p className="eyebrow">À propos</p>
              <p className="mt-2 text-sm leading-relaxed text-body">
                Diplômée en gestion de patrimoine, Claire accompagne particuliers et chefs
                d&rsquo;entreprise depuis 2016 au sein du cabinet Moreau Patrimoine, avec une
                approche pédagogique et indépendante.
              </p>
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <p className="eyebrow">Informations réglementaires</p>
              <p className="mt-2 text-sm text-body">N° ORIAS 16 001 234 · Inscrite depuis 2016</p>
            </div>
          </div>

          <div className="card h-fit p-5">
            <p className="eyebrow">Prendre rendez-vous</p>
            <ul className="mt-3 space-y-2 text-sm text-body">
              <li className="rounded-md border border-line px-3 py-2">Bilan patrimonial</li>
              <li className="rounded-md border border-line px-3 py-2">Succession</li>
              <li className="rounded-md border border-line px-3 py-2">Premier échange</li>
            </ul>
            <button className="btn-solid mt-4 w-full">
              Prendre rendez-vous <IconArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
