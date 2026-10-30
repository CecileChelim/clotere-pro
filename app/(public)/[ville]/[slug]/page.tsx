import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconCheck } from "@/components/ui/icons";
import { getProfessionalBySlug } from "@/lib/professionals";
import { toTitleCase } from "@/lib/text";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileAbout } from "@/components/profile/ProfileAbout";
import { ProfileServices } from "@/components/profile/ProfileServices";
import { BookingSidebar } from "@/components/profile/BookingSidebar";
import { ClosingCta } from "@/components/profile/ClosingCta";

const ORIAS_REGISTRY_URL = "https://www.orias.fr/search";

type Params = { ville: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { ville, slug } = await params;
  const result = await getProfessionalBySlug(ville, slug);

  if (!result) return { title: "Fiche introuvable — Moneago" };

  const { professional } = result;
  const fullName = toTitleCase(`${professional.prenom} ${professional.nom}`);
  const title = `${fullName} — Conseiller en gestion de patrimoine à ${professional.ville ?? ville}`;
  const description =
    professional.bio?.slice(0, 155) ??
    `Prenez rendez-vous en ligne avec ${fullName}, conseiller en gestion de patrimoine (ORIAS ${professional.numero_agrement}).`;

  return {
    title,
    description,
    openGraph: { title, description, images: professional.photo_url ? [professional.photo_url] : undefined },
  };
}

export default async function ProfessionalProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { ville, slug } = await params;
  const result = await getProfessionalBySlug(ville, slug);

  if (!result) notFound();

  const { professional, motifs, services } = result;

  return (
    <div>
      <ProfileHeader professional={professional} />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Tout le contenu défilant : À propos, services, informations
              réglementaires — regroupé pour donner de la hauteur de scroll
              au bloc de prise de RDV sticky, à droite. */}
          <div className="space-y-6 lg:col-span-2">
            <ProfileAbout professional={professional} />
            <ProfileServices services={services} />

            {/* Informations réglementaires — toujours affichées, non désactivables */}
            <div className="card p-6">
              <p className="eyebrow">Informations réglementaires</p>
              <dl className="mt-3 space-y-1.5 text-sm text-body">
                <div className="flex flex-wrap items-center gap-2">
                  <dt className="text-muted">Numéro ORIAS</dt>
                  <dd className="font-medium text-ink-2">{professional.numero_agrement}</dd>
                  {professional.verifiee && (
                    <span className="flex items-center gap-1 text-xs font-medium text-success">
                      <IconCheck className="h-3.5 w-3.5" /> Vérifié
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted">Statut</dt>
                  <dd>
                    {professional.statut_orias ||
                      "Conseiller en gestion de patrimoine indépendant (CGPI)"}
                  </dd>
                </div>
                {professional.actif_depuis && (
                  <div className="flex gap-2">
                    <dt className="text-muted">Inscrit·e depuis</dt>
                    <dd>{new Date(professional.actif_depuis).getFullYear()}</dd>
                  </div>
                )}
              </dl>
              <a
                href={ORIAS_REGISTRY_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm text-gold underline underline-offset-2"
              >
                Vérifier ce numéro sur le registre officiel ORIAS →
              </a>
            </div>
          </div>

          {/* Motifs, disponibilité et CTA de prise de RDV — sticky au scroll */}
          <div id="rendez-vous" className="h-fit scroll-mt-28 lg:sticky lg:top-28">
            <BookingSidebar professional={professional} motifs={motifs} />
          </div>
        </div>
      </div>

      <ClosingCta prenom={professional.prenom} nom={professional.nom} />
    </div>
  );
}
