import { IconWindow, IconSearch, IconCalendarCheck, IconShare } from "@/components/ui/icons";

const BENEFITS = [
  {
    icon: IconWindow,
    tag: "Zéro maintenance",
    title: "Une fiche pro, pas un chantier",
    description:
      "Votre fiche est en ligne, à jour et hébergée pour vous. Pas de mises à jour à faire, pas d'hébergeur à gérer, pas de prestataire à relancer.",
  },
  {
    icon: IconSearch,
    tag: "SEO automatique",
    title: "Un référencement qui se fait tout seul",
    description:
      "Votre fiche est optimisée pour Google dès sa publication. Pas de stratégie de contenu à mener, pas d'agence SEO à payer.",
  },
  {
    icon: IconCalendarCheck,
    tag: "Sans prise de tête",
    title: "Vos clients réservent seuls",
    description:
      "Un formulaire simple, vos disponibilités réelles, une confirmation automatique. La prise de RDV tourne sans que vous y pensiez.",
  },
  {
    icon: IconShare,
    tag: "Partout avec vous",
    title: "Le même lien, sur tous vos canaux",
    description:
      "LinkedIn, Google Business, votre site... un seul lien de rendez-vous à diffuser partout où vos clients vous cherchent.",
  },
];

export function Concretely() {
  return (
    <section id="comment-ca-marche" className="mx-auto max-w-6xl px-6 pb-24">
      <div className="max-w-xl">
        <p className="eyebrow">Pourquoi Moneago</p>
        <h2 className="mt-3 font-serif text-3xl text-ink-2 sm:text-4xl">
          Ce que vous gagnez à passer sur Moneago
        </h2>
        <p className="mt-3 text-body">
          Pas un outil de plus à administrer : une présence en ligne qui tourne pour vous.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.title}
            className="group card p-6 transition-shadow hover:shadow-[0_16px_40px_-20px_rgba(23,21,18,0.25)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card-alt text-gold transition-colors group-hover:bg-gold-2 group-hover:text-ink-2">
              <benefit.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-gold">
              {benefit.tag}
            </p>
            <h3 className="mt-1.5 font-serif text-xl text-ink-2">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-body">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
