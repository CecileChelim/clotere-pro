import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { VisibilitePresentation } from "@/components/visibilite/Presentation";
import { limiteRelecture, moisLabel, STATUT_ARTICLE, type Article, type Rapport, type StatMois } from "@/lib/visibilite";

export const metadata = { title: "Visibilité" };

const ONGLETS = [["articles", "Articles"], ["statistiques", "Statistiques"], ["rapports", "Rapports"]] as const;
const nf = (n: number | null | undefined) => (n ?? 0).toLocaleString("fr-FR");
const dateCourte = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" });

function Statut({ s }: { s: Article["statut"] }) {
  const st = STATUT_ARTICLE[s];
  return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${st.classe}`}>{st.label}</span>;
}

export default async function VisibilitePage({ searchParams }: { searchParams: Promise<{ onglet?: string; option?: string }> }) {
  const { onglet: o, option } = await searchParams;
  const ctx = await cabinetConnecte();
  if (!ctx) redirect("/login?next=/dashboard/visibilite");
  const profession = ctx.pro.profession === "comptable" ? "comptable" : "avocat";
  if (!ctx.cab.offre_visibilite) {
    return (
      <>
        {option === "ok" && <div className="mb-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-200">Paiement reçu, merci ! L&apos;activation prend quelques secondes : rafraîchissez la page si elle ne s&apos;affiche pas.</div>}
        <VisibilitePresentation profession={profession} demandeEnvoyee={!!ctx.cab.visibilite_demande_at} cabinet={ctx.cab.nom} ville={ctx.cab.ville} />
      </>
    );
  }

  const onglet = ONGLETS.some(([id]) => id === o) ? o! : "articles";
  const db = createAdminClient();
  const [{ data: arts }, { data: stats }, { data: raps }] = await Promise.all([
    db.from("articles").select("*").eq("cabinet_id", ctx.cab.id).order("mois", { ascending: false }).order("pousse_le", { ascending: true }),
    db.from("visibilite_stats").select("mois, clics, impressions, position").eq("cabinet_id", ctx.cab.id).order("mois", { ascending: false }).limit(12),
    db.from("rapports").select("id, titre, periode, created_at").eq("cabinet_id", ctx.cab.id).order("created_at", { ascending: false }),
  ]);
  const articles = (arts ?? []) as Article[];
  const aRelire = articles.filter((a) => a.statut === "a_relire").length;

  return (
    <div>
      <p className="eyebrow">Visibilité</p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight text-gray-950">Votre visibilité sur Google</h1>

      <div className="mt-6 flex gap-6 border-b border-gray-200">
        {ONGLETS.map(([id, label]) => (
          <Link key={id} href={id === "articles" ? "/dashboard/visibilite" : `/dashboard/visibilite?onglet=${id}`}
            className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition ${onglet === id ? "border-gray-950 text-gray-950" : "border-transparent text-gray-500 hover:text-gray-950"}`}>
            {label}
            {id === "articles" && aRelire > 0 && <span className="rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-800">{aRelire}</span>}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        {onglet === "articles" && <Articles articles={articles} />}
        {onglet === "statistiques" && <Statistiques stats={(stats ?? []) as StatMois[]} articles={articles.filter((a) => a.statut === "publie")} />}
        {onglet === "rapports" && <Rapports rapports={(raps ?? []) as Rapport[]} />}
      </div>
    </div>
  );
}

function Articles({ articles }: { articles: Article[] }) {
  if (!articles.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-medium text-gray-950">Vos premiers articles arrivent bientôt</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">Vous serez prévenu par e-mail dès qu&apos;ils seront prêts à relire.</p>
      </div>
    );
  }
  const dernierMois = articles[0].mois;
  const duMois = articles.filter((a) => a.mois === dernierMois);
  const anciens = articles.filter((a) => a.mois !== dernierMois);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-lg font-medium text-gray-950">Articles de {moisLabel(dernierMois)}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {duMois.map((a) => (
            <Link key={a.id} href={`/dashboard/visibilite/articles/${a.id}`} className="card flex flex-col p-5 transition hover:ring-gray-300">
              <Statut s={a.statut} />
              <h3 className="mt-3 font-medium leading-snug text-gray-950">{a.titre}</h3>
              {a.mot_cle && <p className="mt-1.5 text-xs text-gray-500">Requête visée : « {a.mot_cle} »</p>}
              <p className="mt-auto pt-5 text-sm">
                {a.statut === "a_relire" && <span className="text-amber-800">À valider avant le {dateCourte(limiteRelecture(a.pousse_le).toISOString())}</span>}
                {a.statut === "modifs_demandees" && <span className="text-sky-800">On intègre vos remarques</span>}
                {a.statut === "valide" && <span className="text-emerald-700">{a.valide_auto ? "Validé automatiquement" : "Validé"} · publication à venir</span>}
                {a.statut === "publie" && <span className="text-gray-600">Publié le {a.publie_le ? dateCourte(a.publie_le) : ""}</span>}
              </p>
              <span className="mt-4 text-sm font-medium text-gray-950 underline underline-offset-2">{a.statut === "a_relire" ? "Relire et valider →" : "Lire l'article →"}</span>
            </Link>
          ))}
        </div>
      </section>

      {anciens.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-gray-950">Articles précédents</h2>
          <div className="card mt-4 divide-y divide-gray-100">
            {anciens.map((a) => (
              <Link key={a.id} href={`/dashboard/visibilite/articles/${a.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-950">{a.titre}</span>
                  <span className="text-xs capitalize text-gray-500">{moisLabel(a.mois)}{a.statut === "publie" && a.clics != null ? ` · ${nf(a.clics)} clics` : ""}</span>
                </span>
                <Statut s={a.statut} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Statistiques({ stats, articles }: { stats: StatMois[]; articles: Article[] }) {
  if (!stats.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-medium text-gray-950">Vos statistiques arrivent à la fin du premier mois</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">Elles proviennent de Google Search Console : clics, apparitions dans les résultats et position moyenne.</p>
      </div>
    );
  }
  const [m, prec] = stats;
  const delta = (a: number, b?: number) => (b ? Math.round(((a - b) / b) * 100) : null);
  const cartes = [
    { l: "Clics depuis Google", v: nf(m.clics), d: delta(m.clics, prec?.clics), unite: "%" },
    { l: "Apparitions dans Google", v: nf(m.impressions), d: delta(m.impressions, prec?.impressions), unite: "%" },
    { l: "Position moyenne", v: m.position != null ? String(m.position).replace(".", ",") : "–",
      d: m.position != null && prec?.position != null ? Math.round((prec.position - m.position) * 10) / 10 : null, unite: " places" },
  ];
  const serie = [...stats].slice(0, 6).reverse();
  const max = Math.max(1, ...serie.map((s) => s.clics));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm capitalize text-gray-500">{moisLabel(m.mois)}</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cartes.map((c) => (
            <div key={c.l} className="card p-5">
              <p className="text-sm text-gray-500">{c.l}</p>
              <p className="mt-1 text-3xl font-medium text-gray-950">{c.v}</p>
              {c.d != null && (
                <p className={`mt-1 text-xs font-semibold ${c.d >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {c.d >= 0 ? "+" : ""}{String(c.d).replace(".", ",")}{c.unite} vs mois précédent
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <p className="text-sm font-medium text-gray-950">Clics depuis Google, 6 derniers mois</p>
        <div className="mt-6 flex h-40 items-end gap-3">
          {serie.map((s) => (
            <div key={s.mois} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs tabular-nums text-gray-600">{nf(s.clics)}</span>
              <div className="w-full max-w-12 rounded-t-md bg-violet-600" style={{ height: `${Math.max(4, (s.clics / max) * 110)}px` }} />
              <span className="text-xs capitalize text-gray-500">{new Date(`${s.mois.slice(0, 10)}T12:00:00`).toLocaleDateString("fr-FR", { month: "short" })}</span>
            </div>
          ))}
        </div>
      </div>

      {articles.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead><tr className="text-gray-500"><th className="px-5 py-3 font-medium">Article publié</th><th className="px-5 py-3 text-right font-medium">Clics</th><th className="px-5 py-3 text-right font-medium">Apparitions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {[...articles].sort((a, b) => (b.clics ?? 0) - (a.clics ?? 0)).map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3">
                    {a.url_publication ? <a href={a.url_publication} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-950 hover:underline">{a.titre}</a> : <span className="font-medium text-gray-950">{a.titre}</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{nf(a.clics)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-gray-600">{nf(a.impressions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400">Source : Google Search Console, mise à jour chaque mois.</p>
    </div>
  );
}

function Rapports({ rapports }: { rapports: Rapport[] }) {
  if (!rapports.length) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-medium text-gray-950">Votre premier rapport arrive à la fin du trimestre</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">Positions gagnées, requêtes qui vous amènent des clients, prochaines priorités : tout est dans le rapport trimestriel.</p>
      </div>
    );
  }
  return (
    <div className="card divide-y divide-gray-100">
      {rapports.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-700">PDF</span>
            <div>
              <p className="text-sm font-medium text-gray-950">{r.titre}</p>
              <p className="text-xs text-gray-500">Déposé le {dateCourte(r.created_at)}</p>
            </div>
          </div>
          <a href={`/api/visibilite/rapports/${r.id}`} target="_blank" rel="noopener noreferrer" className="btn-outline">Ouvrir</a>
        </div>
      ))}
    </div>
  );
}
