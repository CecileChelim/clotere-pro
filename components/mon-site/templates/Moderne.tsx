import type { SiteRendu } from "@/lib/site/types";
import { FONT_MANROPE } from "@/components/mon-site/fonts";
import { a, avecHonoraires, ListesHonoraires, Cta, actualitesAffichees, adresseLigne, avecActualites, avecAvis, avisAffiches, BlocContact, Credit, Etoiles, Faq, liensNav, MentionsLegales, nomAffiche, Visuel } from "@/components/mon-site/parts";

/* Template 2 — Moderne : éditorial, titres XXL, angles droits. Sections foncées (sombre) et bloc final en accent. */

const Label = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <p className="text-[13px] font-bold uppercase tracking-[0.14em] opacity-60" style={style}>{children}</p>
);
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-5 text-4xl font-bold leading-[1.02] tracking-[-0.035em] @3xl:text-[64px]">{children}</h2>
);

export function TemplateModerne({ d }: { d: SiteRendu }) {
  const c = d.contenu;
  const initiales = `${d.pro.prenom[0] ?? ""}${d.pro.nom[0] ?? ""}`.toUpperCase();
  const px = "px-6 @3xl:px-16";
  const marque = (d.cabinet.nom || d.pro.nom).toUpperCase();
  const cta = d.formule === "rdv" ? "Réserver un créneau →" : "Nous écrire →";
  const [l1, ...reste] = c.hero.titre.split(/(?<=[,.:;])\s+/);
  const note = d.avis.note;

  return (
    <div className="bg-[var(--s-fond)] text-[var(--s-sombre)]" style={{ fontFamily: FONT_MANROPE }}>
      <header className={`flex items-center justify-between gap-6 py-6 ${px}`}>
        <p className="text-xl font-bold tracking-[-0.02em]">{marque} —</p>
        <nav className="hidden gap-8 text-sm font-semibold @5xl:flex">
          {liensNav(d).map((n) => <a key={n.id} href={`#${n.id}`} className="hover:opacity-60">{n.label(d)}</a>)}
        </nav>
        {a(d, "contact") && <span className="hidden @3xl:block"><Cta d={d} className="block px-6 py-3.5 text-sm font-bold" style={{ background: "var(--s-sombre)", color: "var(--s-sur-sombre)" }}>{d.formule === "rdv" ? "Prendre rendez-vous" : "Nous contacter"}</Cta></span>}
      </header>

      <section className={`pt-12 @3xl:pt-16 ${px}`}>
        <h1 className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold ring-1 ring-current">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />{c.hero.surtitre}
        </h1>
        <p className="mt-9 text-5xl font-bold leading-[0.98] tracking-[-0.045em] @3xl:text-[104px]">
          {l1}{reste.length > 0 && <><br /><span className="opacity-40">{reste.join(" ")}</span></>}
        </p>
        <div className="mt-12 flex flex-col gap-8 pb-14 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <p className="max-w-xl text-lg leading-relaxed opacity-75">{c.hero.accroche}</p>
          {a(d, "contact") && <Cta d={d} className="self-start px-7 py-4 text-sm font-bold" style={{ background: "var(--s-accent)", color: "var(--s-sur-accent)" }}>{cta}</Cta>}
        </div>
      </section>
      <div className={px}><Visuel src={d.couverture} alt={d.cabinet.nom} sombre className="h-72 w-full @3xl:h-[520px]" /></div>

      <div className={px}>
        <div className="grid grid-cols-2 border-b border-current @3xl:grid-cols-4">
          {[...c.chiffres.slice(0, 3), ...(note ? [{ valeur: `${note.toFixed(1).replace(".", ",")}★`, label: `${d.avis.nb ?? ""} avis Google`.trim() }] : [])].slice(0, 4).map((x, i) => (
            <div key={i} className={`border-black/10 py-8 @3xl:py-10 ${i % 2 === 1 ? "pl-6" : ""} ${i === 0 ? "@3xl:pl-0" : "@3xl:pl-10"} ${i < 3 ? "@3xl:border-r" : ""}`}>
              <p className="text-3xl font-bold tracking-[-0.03em] @3xl:text-5xl">{x.valeur}</p>
              <p className="mt-1 text-sm opacity-60">{x.label}</p>
            </div>
          ))}
        </div>
      </div>

      {a(d, "apropos") && (
        <section id="apropos" className={`flex flex-col gap-12 py-24 @3xl:flex-row @3xl:gap-16 @3xl:py-32 ${px}`}>
          <div className="flex-1">
            <Label>À propos</Label>
            <H2>{c.apropos.titre}</H2>
            <p className="mt-8 text-lg leading-[1.7] opacity-80">{c.apropos.texte}</p>
            {c.apropos.texte2 && <p className="mt-5 text-lg leading-[1.7] opacity-80">{c.apropos.texte2}</p>}
            <p className="mt-8 text-sm font-bold">{c.apropos.signature}</p>
          </div>
          <Visuel src={d.pro.photo} alt={nomAffiche(d)} initiales={initiales} className="aspect-[4/5] w-full max-w-[340px] shrink-0 @3xl:w-[340px]" />
        </section>
      )}

      {a(d, "domaines") && (
        <section id="domaines" className={`pb-24 @3xl:pb-32 ${a(d, "apropos") ? "" : "pt-24"} ${px}`}>
          <Label>{d.profession === "avocat" ? "Expertises" : "Missions"}</Label>
          <H2>{c.domaines.titre}</H2>
          <div className="mt-14 border-t border-current">
            {c.domaines.items.map((x, i) => (
              <div key={i} className="flex flex-col gap-3 border-b border-black/10 py-8 @3xl:flex-row @3xl:items-center @3xl:gap-12">
                <span className="w-16 text-[15px] font-bold opacity-40">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="flex-1 text-2xl font-bold tracking-[-0.02em] @3xl:text-4xl">{x.titre}</h3>
                <p className="text-base leading-relaxed opacity-70 @3xl:w-[420px]">{x.texte}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {a(d, "approche") && (
        <section className={`pb-24 @3xl:pb-32 ${px}`}>
          <div className="grid gap-10 @3xl:grid-cols-[1fr_1.4fr]">
            <div><Label>{c.approche.titre}</Label>
              <ul className="mt-6 space-y-3">{c.approche.points.map((p, i) => <li key={i} className="flex items-center gap-3 font-semibold"><span className="h-3 w-3" style={{ background: "var(--s-accent)" }} />{p}</li>)}</ul>
            </div>
            <p className="text-2xl font-semibold leading-snug tracking-[-0.02em] @3xl:text-4xl">{c.approche.texte}</p>
          </div>
        </section>
      )}

      {a(d, "methode") && (
        <section id="methode" className={`py-24 @3xl:py-32 ${px}`} style={{ background: "var(--s-sombre)", color: "var(--s-sur-sombre)" }}>
          <Label>Méthode</Label>
          <H2>{c.methode.titre}</H2>
          <div className="mt-16 grid gap-0.5 @3xl:grid-cols-4">
            {c.methode.etapes.map((e, i) => (
              <div key={i} className="flex min-h-64 flex-col justify-between p-8 @3xl:min-h-80 @3xl:p-10" style={{ background: "color-mix(in srgb, var(--s-sur-sombre) 6%, var(--s-sombre))" }}>
                <span className="text-6xl font-bold tracking-[-0.04em]" style={{ color: "var(--s-accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                <div className="mt-8"><h3 className="text-2xl font-bold">{e.titre}</h3><p className="mt-2 text-[15px] leading-relaxed opacity-65">{e.texte}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {avecHonoraires(d) && (
        <section id="honoraires" className={`pt-24 @3xl:pt-32 ${px}`}>
          <Label>Honoraires</Label>
          <H2>{c.honoraires.titre}</H2>
          {c.honoraires.texte && <p className="mt-6 max-w-3xl text-lg leading-relaxed opacity-75">{c.honoraires.texte}</p>}
          <div className="mt-12"><ListesHonoraires d={d} carte="bg-white p-8 ring-1 ring-black/5" titre="text-sm font-bold uppercase tracking-[0.14em] opacity-60" item="text-base font-semibold" /></div>
        </section>
      )}

      {avecAvis(d) && (
        <section id="avis" className={`flex flex-col gap-12 py-24 @3xl:flex-row @3xl:gap-16 @3xl:py-32 ${px}`}>
          <div className="@3xl:w-80">
            <Label>Avis Google</Label>
            {note ? <><p className="mt-4 text-8xl font-bold leading-none tracking-[-0.05em] @3xl:text-[120px]">{note.toFixed(1).replace(".", ",")}</p><div className="mt-4"><Etoiles note={note} taille={22} /></div>{d.avis.nb && <p className="mt-2 text-[15px] opacity-60">{d.avis.nb} avis vérifiés</p>}</>
              : <H2>{c.avis.titre}</H2>}
            {d.avis.url && <a href={d.avis.url} target="_blank" rel="noopener" className="mt-6 inline-block text-sm font-bold underline underline-offset-4">Tous les avis →</a>}
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            {avisAffiches(d).slice(0, 2).map((x, i) => (
              <div key={i} className="bg-white p-8 ring-1 ring-black/5 @3xl:p-10">
                <p className="text-xl font-semibold leading-snug tracking-[-0.01em] @3xl:text-[22px]">« {x.texte} »</p>
                <p className="mt-5 text-sm opacity-60">{x.auteur}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {a(d, "faq") && (
        <section id="faq" className={`pb-24 @3xl:pb-32 ${avecAvis(d) ? "" : "pt-24"} ${px}`}>
          <Label>FAQ</Label>
          <H2>{c.faq.titre}</H2>
          <div className="mt-14 border-t border-current">
            <Faq d={d} signe="currentColor" classeItem="border-b border-black/10" classeQuestion="py-8 text-lg font-bold @3xl:text-[22px]" classeReponse="pb-8 text-base leading-relaxed opacity-70 @3xl:max-w-3xl" />
          </div>
        </section>
      )}

      {avecActualites(d) && (
        <section id="actualites" className={`pb-24 @3xl:pb-32 ${px}`}>
          <Label>Actualités</Label>
          <H2>{c.actualites.titre}</H2>
          <div className="mt-14 grid gap-0.5 @3xl:grid-cols-3">
            {actualitesAffichees(d).map((x, i) => (
              <details key={i} className="group bg-white p-8 ring-1 ring-black/5">
                <summary className="cursor-pointer list-none">
                  {x.date && <p className="text-xs font-bold uppercase tracking-widest opacity-50">{x.date}</p>}
                  <h3 className="mt-3 text-xl font-bold tracking-[-0.01em]">{x.titre}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed opacity-70 group-open:line-clamp-none">{x.texte}</p>
                </summary>
              </details>
            ))}
          </div>
        </section>
      )}

      {a(d, "contact") && (
        <section id="contact" className={`pb-24 @3xl:pb-32 ${px}`}>
          <div className="flex flex-col gap-12 p-8 @3xl:p-20 @5xl:flex-row @5xl:gap-16" style={{ background: "var(--s-accent)", color: "var(--s-sur-accent)" }}>
            <div className="flex-1">
              <Label>{d.formule === "rdv" ? "Rendez-vous en ligne" : "Contact"}</Label>
              <H2>{c.contact.titre}</H2>
              <p className="mt-6 text-lg leading-relaxed opacity-85">{c.contact.texte}</p>
              <p className="mt-10 text-[15px] leading-relaxed">{adresseLigne(d)}{d.cabinet.telephone && <><br />{d.cabinet.telephone}</>}{c.contact.horaires && <><br />{c.contact.horaires}</>}</p>
            </div>
            <div className="@5xl:w-[520px]"><BlocContact d={d} variante="sombre" /></div>
          </div>
        </section>
      )}

      <footer className={`flex flex-col gap-6 border-t border-current py-12 @3xl:flex-row @3xl:items-end @3xl:justify-between ${px}`}>
        <p className="text-4xl font-bold tracking-[-0.04em] @3xl:text-[56px]">{marque} —</p>
        <div className="text-[13px] leading-loose opacity-60 @3xl:text-right">
          <p>© {new Date().getFullYear()} {d.cabinet.nom}</p>
          <MentionsLegales d={d} />
          <Credit d={d} />
        </div>
      </footer>
    </div>
  );
}
