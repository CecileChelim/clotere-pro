import { IconQuote, IconStar } from "@/components/ui/icons";

const TESTIMONIALS = [
  {
    quote:
      "Mes clients prennent rendez-vous directement depuis mon profil LinkedIn. Je ne perds plus de temps sur les allers-retours par email.",
    name: "Julien Farge",
    role: "CGP indépendant, Bordeaux",
    initials: "JF",
  },
  {
    quote:
      "Ma fiche est ressortie en bonne place sur Google en quelques semaines, sans que j'aie rien fait de plus que la publier.",
    name: "Sophie Laurent",
    role: "CGPI, Nantes",
    initials: "SL",
  },
  {
    quote:
      "L'abonnement est resté simple : pas d'engagement, pas de surprise. Exactement ce qu'il me fallait pour démarrer.",
    name: "Marc Dubreuil",
    role: "Conseiller en gestion de patrimoine, Lyon",
    initials: "MD",
  },
];

export function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="card flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between">
                <IconQuote className="h-6 w-6 text-gold-2" />
                <div className="flex gap-0.5 text-gold-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} className="h-3.5 w-3.5" />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-body">&laquo; {t.quote} &raquo;</p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-2 text-xs font-medium text-ink-2">
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-ink-2">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
