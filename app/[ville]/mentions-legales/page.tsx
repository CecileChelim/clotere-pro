import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { etatAbonnement } from "@/lib/abonnement";
import { chargerSitePublic } from "@/lib/site/serveur";
import { variablesPalette } from "@/lib/site/palettes";
import { policesSite, FONT_INTER, FONT_MANROPE } from "@/components/mon-site/fonts";
import { adresseLigne, nomAffiche } from "@/components/mon-site/parts";

/* Mentions légales & politique de confidentialité d'un site créé avec Clotere : <métier>.clotere.fr/<slug>/mentions-legales.
   (Dossier statique : prioritaire sur la page de rdv /[ville]/[slug].) */

type Params = { params: Promise<{ ville: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ville: slug } = await params;
  const s = await chargerSitePublic(slug);
  return { title: { absolute: s ? `Mentions légales | ${s.rendu.cabinet.nom}` : "Mentions légales" }, robots: { index: false, follow: true } };
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-black/10 py-8">
      <h2 className="text-xl font-semibold tracking-tight">{titre}</h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-black/75">{children}</div>
    </section>
  );
}

export default async function MentionsLegalesPage({ params }: Params) {
  const { ville: slug } = await params;
  const s = await chargerSitePublic(slug);
  if (!s || !s.cab?.offre_site || !etatAbonnement(s.cab).actif) notFound();
  const d = s.rendu;
  const avocat = d.profession === "avocat";
  const editeur = d.cabinet.nom;
  const responsable = nomAffiche(d);
  const contact = [d.cabinet.email, d.cabinet.telephone].filter(Boolean).join(" · ");

  return (
    <div className={`${policesSite} min-h-screen bg-[var(--s-fond)] text-[#111]`} style={{ ...variablesPalette(d.palette), fontFamily: d.template === "moderne" ? FONT_MANROPE : FONT_INTER }}>
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <a href={`/${s.site.slug}`} className="text-lg font-semibold">{editeur}</a>
          <a href={`/${s.site.slug}`} className="text-sm font-medium" style={{ color: "var(--s-accent)" }}>← Retour au site</a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm font-medium uppercase tracking-[0.12em]" style={{ color: "var(--s-accent)" }}>Informations légales</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Mentions légales & confidentialité</h1>

        <div className="mt-10">
          <Bloc titre="Éditeur du site">
            <p><strong>{editeur}</strong><br />{adresseLigne(d)}</p>
            {contact && <p>Contact : {contact}</p>}
            {d.cabinet.siret && <p>SIRET : {d.cabinet.siret}</p>}
            <p>Responsable de la publication : {responsable}</p>
          </Bloc>

          <Bloc titre="Profession réglementée">
            {avocat ? (
              <>
                <p>Titre professionnel : avocat (France){d.cabinet.barreau ? `, inscrit au barreau de ${d.cabinet.barreau}` : ""}.</p>
                <p>Règles professionnelles applicables : loi n° 71-1130 du 31 décembre 1971, décret n° 91-1197 du 27 novembre 1991, décret n° 2005-790 du 12 juillet 2005 relatif aux règles de déontologie de la profession d&apos;avocat, et Règlement intérieur national (RIN) de la profession d&apos;avocat, consultable sur le site du Conseil national des barreaux.</p>
                <p>Les informations publiées sur ce site sont générales : elles ne constituent pas une consultation juridique et ne remplacent pas un rendez-vous avec un avocat.</p>
              </>
            ) : (
              <>
                <p>Titre professionnel : expert-comptable, membre de l&apos;Ordre des experts-comptables (France).</p>
                <p>Règles professionnelles applicables : ordonnance n° 45-2138 du 19 septembre 1945 et décret n° 2012-432 du 30 mars 2012 relatif à l&apos;exercice de l&apos;activité d&apos;expertise comptable, comprenant le code de déontologie de la profession.</p>
                <p>Les informations publiées sur ce site sont générales et ne remplacent pas un conseil personnalisé.</p>
              </>
            )}
          </Bloc>

          <Bloc titre="Hébergement">
            <p>Site réalisé et hébergé par Clotere SAS, 25 rue de Ponthieu, 75008 Paris (SIREN 939 108 692), sur l&apos;infrastructure de Netlify, Inc.</p>
          </Bloc>

          <Bloc titre="Données personnelles">
            <p>Les informations transmises via ce site ({d.formule === "rdv" ? "demande de rendez-vous" : "formulaire de contact"}) sont traitées par {editeur}, responsable du traitement, uniquement pour répondre à votre demande et assurer le suivi de la relation. Elles ne sont ni vendues ni cédées à des tiers.</p>
            <p>Elles sont conservées le temps nécessaire au traitement de votre demande et, le cas échéant, pendant la durée de la relation puis les durées de conservation légales applicables à la profession.</p>
            <p>Clotere SAS intervient en qualité de sous-traitant technique (hébergement du site et des demandes).</p>
            <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, d&apos;opposition et de limitation sur vos données. Pour l&apos;exercer, écrivez à {d.cabinet.email ?? editeur}. Vous pouvez aussi introduire une réclamation auprès de la CNIL (cnil.fr).</p>
          </Bloc>

          <Bloc titre="Cookies">
            <p>Ce site n&apos;utilise pas de cookies publicitaires ni de traceurs de mesure d&apos;audience soumis à consentement.</p>
          </Bloc>

          {avocat && (
            <Bloc titre="Médiation de la consommation">
              <p>En cas de litige avec un client consommateur, celui-ci peut recourir gratuitement au médiateur de la consommation de la profession d&apos;avocat, désigné par le Conseil national des barreaux (mediateur-consommation-avocat.fr).</p>
            </Bloc>
          )}

          <Bloc titre="Propriété intellectuelle">
            <p>Les textes, logos et photographies de ce site sont la propriété de {editeur} ou de leurs auteurs. Toute reproduction sans autorisation est interdite.</p>
            {d.contenu.credits.couverture && d.couverture?.includes("images.unsplash.com") && (
              <p>Photo de couverture : <a href={d.contenu.credits.couvertureLien} target="_blank" rel="noopener noreferrer" className="underline">{d.contenu.credits.couverture}</a> sur <a href="https://unsplash.com/?utm_source=clotere&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>.</p>
            )}
          </Bloc>
        </div>
      </main>
    </div>
  );
}
