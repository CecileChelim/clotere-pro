import { ExpandableBio } from "./ExpandableBio";
import { IconLinkedin } from "@/components/ui/icons";
import { toTitleCase } from "@/lib/text";
import type { Professional } from "@/types/database";

export function ProfileAbout({ professional }: { professional: Professional }) {
  const prenom = toTitleCase(professional.prenom);

  return (
    <div className="card p-6">
      <p className="eyebrow">À propos</p>
      <h2 className="mt-2 font-serif text-2xl text-ink-2">À propos de {prenom}</h2>

      <div className="mt-4">
        {professional.bio ? (
          <ExpandableBio text={professional.bio} />
        ) : (
          <p className="text-sm text-muted">Cette fiche n&rsquo;a pas encore de présentation.</p>
        )}

        {(professional.cabinet || professional.actif_depuis) && (
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-5 text-sm">
            {professional.cabinet && (
              <div>
                <dt className="text-muted">Cabinet</dt>
                <dd className="mt-0.5 font-medium text-ink-2">
                  {professional.cabinet}
                  {professional.groupe ? ` · Groupe ${professional.groupe}` : ""}
                </dd>
              </div>
            )}
            {professional.actif_depuis && (
              <div>
                <dt className="text-muted">En activité depuis</dt>
                <dd className="mt-0.5 font-medium text-ink-2">
                  {new Date(professional.actif_depuis).getFullYear()}
                </dd>
              </div>
            )}
          </dl>
        )}

        {professional.linkedin_url && (
          <a
            href={professional.linkedin_url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-chip-line bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink-2 shadow-sm transition-shadow hover:shadow-md"
          >
            <IconLinkedin className="h-6 w-6" />
            Profil LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}
