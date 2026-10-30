import { toTitleCase } from "@/lib/text";
import type { Professional } from "@/types/database";

function yearsSince(dateStr: string | null) {
  if (!dateStr) return null;
  const years = new Date().getFullYear() - new Date(dateStr).getFullYear();
  return years > 0 ? years : null;
}

function VerifiedBadge() {
  return (
    <span
      title="Profil vérifié"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
        <path
          d="M4 10.5l3.5 3.5L16 6"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function AvailableBadge() {
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-success">
      <span className="h-2 w-2 rounded-full bg-success" />
      Disponible
    </span>
  );
}

export function ProfileHeader({ professional }: { professional: Professional }) {
  const experience = yearsSince(professional.actif_depuis);
  const fullName = toTitleCase(`${professional.prenom} ${professional.nom}`);

  return (
    <div
      className="border-b border-line"
      style={{ background: "linear-gradient(180deg, #f7f3ea 0%, #f0ebe0 100%)" }}
    >
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
          <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full bg-gold-2 shadow-[0_0_0_5px_#f7f3ea,0_20px_40px_-15px_rgba(23,21,18,0.35)]">
            {professional.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={professional.photo_url}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="font-serif text-4xl text-ink-2 sm:text-5xl">{fullName}</h1>
              {professional.verifiee && <VerifiedBadge />}
              {professional.accepte_nouveaux_clients && <AvailableBadge />}
              {professional.specialites?.map((s) => (
                <span key={s} className="chip bg-white text-xs">
                  {s}
                </span>
              ))}
            </div>

            <p className="mt-3 text-lg text-body">
              Conseiller en gestion de patrimoine
              {professional.ville ? ` · ${professional.ville}` : ""}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              {experience && (
                <>
                  <span>{experience} ans d&rsquo;expérience</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              {professional.zones_intervention && professional.zones_intervention.length > 0 && (
                <span>Intervient à {professional.zones_intervention.join(", ")}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
