import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { etatAbonnement } from "@/lib/abonnement";
import { synchroniserGoogle } from "@/lib/google";
import { professionFromHost } from "@/lib/professions-config";
import { chargerSitePublic } from "@/lib/site/serveur";
import { SiteRenderer } from "@/components/mon-site/SiteRenderer";

/* Site internet créé avec Clotere : avocat.clotere.fr/<slug> (ou comptable.clotere.fr/<slug>).
   Le segment s'appelle [ville] pour partager le niveau avec la page de rdv /[ville]/[slug] (Next impose un seul nom). */

type Params = { params: Promise<{ ville: string }> };

/** Ancienneté (ms) de la dernière synchronisation Google. */
const depuis = (iso: string | null | undefined) => (iso ? Date.now() - new Date(iso).getTime() : Infinity);

const SITES = { avocat: "https://avocat.clotere.fr", comptable: "https://comptable.clotere.fr" } as const;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ville: slug } = await params;
  const s = await chargerSitePublic(slug);
  if (!s) return { title: "Page introuvable", robots: { index: false } };
  const c = s.rendu.contenu;
  const titre = `${c.hero.surtitre} | ${s.rendu.cabinet.nom}`;
  // Indexé seulement une fois l'abonnement payé (pendant l'essai : en ligne mais noindex).
  const indexable = s.cab?.subscription_status === "actif";
  return {
    title: { absolute: titre },
    description: c.hero.accroche,
    alternates: { canonical: `${SITES[s.rendu.profession]}/${s.site.slug}` },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { type: "website", locale: "fr_FR", siteName: s.rendu.cabinet.nom, title: titre, description: c.hero.accroche, url: `${SITES[s.rendu.profession]}/${s.site.slug}`, images: s.site.photo_couverture ? [{ url: s.site.photo_couverture }] : undefined },
    twitter: { card: "summary", title: titre, description: c.hero.accroche },
  };
}

export default async function SitePage({ params }: Params) {
  const { ville: slug } = await params;
  const s = await chargerSitePublic(slug);
  if (!s) notFound();

  // Un site avocat n'est servi que sur avocat.clotere.fr (et inversement), en production.
  const host = (await headers()).get("host") ?? "";
  if (host.endsWith("clotere.fr") && professionFromHost(host) !== s.rendu.profession) redirect(`${SITES[s.rendu.profession]}/${s.site.slug}`);

  if (!etatAbonnement(s.cab).actif || !s.cab?.offre_site) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div>
          <p className="text-2xl font-medium text-gray-950">{s.rendu.cabinet.nom}</p>
          <p className="mt-3 text-gray-600">Ce site est momentanément indisponible.</p>
          {s.rendu.cabinet.telephone && <p className="mt-6 text-gray-950">{s.rendu.cabinet.telephone}</p>}
        </div>
      </main>
    );
  }

  // Note et avis Google rafraîchis en arrière-plan au plus une fois par semaine.
  const cab = s.cab;
  const ilYa = depuis(cab?.google_synced_at);
  if (cab?.id && cab.google_business_url && ilYa > 7 * 24 * 3600e3) {
    after(() => synchroniserGoogle(cab.id).then((r) => { if (!r.ok) console.warn("[google]", r.raison); }));
  }

  return <SiteRenderer d={s.rendu} />;
}
