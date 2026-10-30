import Link from "next/link";

export default function ProfessionalNotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="eyebrow">Fiche introuvable</p>
      <h1 className="mt-3 font-serif text-3xl text-ink-2">
        Cette fiche professionnelle n&rsquo;existe pas ou plus
      </h1>
      <p className="mt-3 text-body">
        Vérifiez le lien ou revenez à l&rsquo;accueil pour trouver un conseiller en gestion de
        patrimoine.
      </p>
      <Link href="/" className="btn-solid mt-6 inline-flex">
        Retour à l&rsquo;accueil
      </Link>
    </div>
  );
}
