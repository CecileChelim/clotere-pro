const LINKEDIN_STEPS = [
  {
    title: "Ajoutez le lien à l'introduction de votre profil (recommandé)",
    description:
      "Depuis votre profil, cliquez sur l'icône crayon à côté de votre nom pour modifier l'introduction. Dans le champ « Site web », collez votre lien de rendez-vous et choisissez un texte de bouton, par exemple « Prendre rendez-vous ». Le lien apparaît alors en évidence, sous votre photo.",
    href: "https://www.linkedin.com/help/linkedin/answer/a727760",
    hrefLabel: "Voir le guide LinkedIn : ajouter un lien à l'introduction",
  },
  {
    title: "Mettez-le en avant dans « Éléments mis en avant »",
    description:
      "Sur votre profil, sélectionnez « Ajouter une section du profil » → « Recommandé » → « Éléments mis en avant », puis « Ajouter un lien » et collez votre lien de rendez-vous. Il s'affiche sous forme de carte cliquable, juste sous la section À propos.",
    href: "https://www.linkedin.com/help/linkedin/answer/a1513395",
    hrefLabel: "Voir le guide LinkedIn : section Éléments mis en avant",
  },
];

const GOOGLE_STEPS = [
  {
    title: "Ouvrez votre fiche d'établissement",
    description:
      "Connectez-vous sur business.google.com, ou recherchez votre cabinet sur Google Maps/Google Search puis cliquez sur « Modifier le profil ». Votre fiche doit être validée (établissement vérifié) pour pouvoir ajouter un lien.",
  },
  {
    title: "Renseignez le lien de réservation",
    description:
      "Dans « Modifier le profil » → « Coordonnées », repérez le champ dédié aux liens de rendez-vous/réservation (« Booking link » ou « Appointment URL » selon la langue de l'interface), collez votre lien de rendez-vous, puis enregistrez.",
  },
  {
    title: "Le bouton « Réserver » apparaît sur votre fiche",
    description:
      "La mise à jour est généralement visible en quelques minutes, parfois jusqu'à 24h. Un bouton « Réserver » s'affiche alors directement sur votre fiche dans Google Maps et la recherche Google.",
    href: "https://support.google.com/business/answer/6218037",
    hrefLabel: "Voir le guide Google : gérer les liens de votre établissement",
  },
];

function GuideCard({
  platform,
  steps,
}: {
  platform: string;
  steps: { title: string; description: string; href?: string; hrefLabel?: string }[];
}) {
  return (
    <div className="card p-6">
      <p className="eyebrow">{platform}</p>
      <ol className="mt-4 space-y-5">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-card-alt text-xs font-medium text-ink-2">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-ink-2">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-body">{step.description}</p>
              {step.href && (
                <a
                  href={step.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-block text-sm text-gold underline underline-offset-2"
                >
                  {step.hrefLabel}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DiffusionGuide() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <GuideCard platform="LinkedIn" steps={LINKEDIN_STEPS} />
      <GuideCard platform="Fiche Google Business" steps={GOOGLE_STEPS} />
    </div>
  );
}
