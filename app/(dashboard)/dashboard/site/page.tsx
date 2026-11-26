import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { chargerSiteCabinet } from "@/lib/site/serveur";
import { etatAbonnement } from "@/lib/abonnement";
import { libelleFormule, lignesTarif, PRIX, totalMensuel } from "@/lib/tarifs";
import { EnTetePage } from "@/components/dashboard/EnTetePage";
import { EditeurSite, type OngletSite } from "@/components/mon-site/EditeurSite";
import { MessagesSite, type MessageSite } from "@/components/mon-site/Messages";
import { BoutonActiverRdv, SitePresentation } from "@/components/mon-site/Upsells";
import { DomainePerso } from "@/components/mon-site/DomainePerso";
import { CIBLE_CNAME, IP_NETLIFY } from "@/lib/site/domaine";

export const metadata = { title: "Mon site" };

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="text-sm text-gray-950">{children}</div>
    </div>
  );
}

export default async function MonSitePage({ searchParams }: { searchParams: Promise<{ onglet?: string; nouveau?: string }> }) {
  const { onglet: o, nouveau } = await searchParams;
  const ctx = await cabinetConnecte();
  if (!ctx) redirect("/login?next=/dashboard/site");
  const profession = ctx.pro.profession === "comptable" ? "comptable" : "avocat";

  const s = ctx.cab.offre_site ? await chargerSiteCabinet(ctx.cab.id) : null;
  if (!s) return <SitePresentation profession={profession} clientRdv={ctx.cab.offre_rdv !== false} />;

  const { data: { user } } = await (await createClient()).auth.getUser();
  const db = createAdminClient();
  const [{ data: messages }, { count: nbPros }] = await Promise.all([
    db.from("site_messages").select("id, prenom, nom, email, telephone, objet, message, lu, created_at").eq("cabinet_id", ctx.cab.id).order("created_at", { ascending: false }).limit(200),
    db.from("professionals").select("id", { count: "exact", head: true }).eq("cabinet_id", ctx.cab.id),
  ]);
  const nonLus = (messages ?? []).filter((m) => !m.lu).length;
  const onglet: OngletSite = o === "messages" || o === "publication" || o === "design" ? o : "textes";
  const url = `${profession === "comptable" ? "comptable" : "avocat"}.clotere.fr/${s.site.slug}`;
  // Formule page : le site est un abonnement séparé (site_paye), sans essai.
  const abo = ctx.cab.page_seule ? { actif: !!ctx.cab.site_paye, essai: false, joursRestants: 0, statut: "" } : etatAbonnement(ctx.cab);
  const paye = ctx.cab.page_seule ? !!ctx.cab.site_paye : ctx.cab.subscription_status === "actif";
  const contact = ctx.cab.offre_rdv === false;
  const titulaire = ctx.pro.role !== "membre";

  const publication = (
    <div className="max-w-3xl">
      <Ligne label="Adresse du site">
        <a href={`/${s.site.slug}`} target="_blank" rel="noopener" className="font-medium underline underline-offset-2">{url}</a>
        <p className="mt-1 text-gray-500">À mettre sur votre fiche Google, votre signature e-mail et LinkedIn.</p>
      </Ligne>
      <Ligne label="Nom de domaine">
        {titulaire ? (
          <DomainePerso urlClotere={url} cibles={{ cname: CIBLE_CNAME, ip: IP_NETLIFY }}
            initial={{ domaine: s.site.domaine ?? null, statut: s.site.domaine_statut ?? null }} />
        ) : (
          <p className="text-gray-500">Seul le titulaire du cabinet peut relier un nom de domaine.</p>
        )}
      </Ligne>
      <Ligne label="Statut">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${paye ? "bg-emerald-50 text-emerald-700" : abo.actif ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700"}`}>
          {paye ? "En ligne · référencé sur Google" : abo.actif ? "En ligne · référencé sur Google après l'essai" : "Hors ligne"}
        </span>
        {!paye && abo.essai && <p className="mt-2 text-gray-500">Essai gratuit : {abo.joursRestants} jour{abo.joursRestants > 1 ? "s" : ""} restant{abo.joursRestants > 1 ? "s" : ""}. <Link href="/dashboard/abonnement" className="underline">Ajouter ma carte</Link></p>}
      </Ligne>
      <Ligne label="Offre">
        <p className="font-medium">{libelleFormule(ctx.cab)} · {totalMensuel(lignesTarif(ctx.cab, nbPros ?? 1))} € HT / mois</p>
        {contact && titulaire && (
          <div className="mt-3">
            <p className="mb-3 text-gray-500">Passez à la prise de rendez-vous en ligne (+ actualités) : {PRIX.siteRdv} € HT / mois au lieu de {PRIX.siteContact} €.</p>
            <BoutonActiverRdv className="rounded-full bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800" />
          </div>
        )}
        <p className="mt-2"><Link href="/dashboard/abonnement" className="text-gray-500 underline">Gérer mon abonnement</Link></p>
      </Ligne>
    </div>
  );

  return (
    <div>
      {nouveau && (
        <div className="mb-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
          <strong>Votre site est en ligne.</strong> Personnalisez vos textes et ajoutez vos photos{contact ? "" : ", puis réglez vos horaires dans Agenda pour ouvrir la prise de rendez-vous"}.
        </div>
      )}
      <EnTetePage section="Mon site" titre={s.rendu.cabinet.nom}
        cta={<a href={`/${s.site.slug}`} target="_blank" rel="noopener" className="btn-solid">Voir mon site ↗</a>} />
      <EditeurSite initial={s.rendu} userId={user?.id ?? ctx.pro.id} nbNonLus={nonLus} ongletInitial={onglet}
        messages={<MessagesSite messages={(messages ?? []) as MessageSite[]} />}
        publication={publication} />
    </div>
  );
}
