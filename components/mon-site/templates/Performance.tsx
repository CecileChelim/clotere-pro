import type { SiteRendu } from "@/lib/site/types";
import { FONT_INTER } from "@/components/mon-site/fonts";
import { a, avecHonoraires, ListesHonoraires, Cta, actualitesAffichees, adresseLigne, avecActualites, avecAvis, avisAffiches, BlocContact, Credit, Etoiles, Faq, liensNav, MentionsLegales, nomAffiche, Visuel } from "@/components/mon-site/parts";
/* Template 3 — Performance : pensé pour convertir. Hero foncé (sombre) avec la prise de contact visible tout de suite,
   réassurance, un bouton d'action par domaine, appel à l'action final en accent. */

const Kicker = ({ children }: { children: React.ReactNode }) => <p className="text-sm font-semibold" style={{ color: "var(--s-accent)" }}>{children}</p>;
const H2 = ({ children, gauche = false }: { children: React.ReactNode; gauche?: boolean }) => (
  <h2 className={`mt-3 text-3xl font-bold tracking-[-0.02em] text-[#101828] @3xl:text-[42px] @3xl:leading-[1.15] ${gauche ? "" : "text-center"}`}>{children}</h2>
);
/** Action principale : ouvre la prise de rdv, ou remonte au formulaire du hero (formule contact). */
const Bouton = ({ d, children }: { d: SiteRendu; children: React.ReactNode }) => (
  <Cta d={d} ancre="#contact-hero" className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-[15px] font-semibold shadow-sm transition hover:opacity-90"
    style={{ background: "var(--s-accent)", color: "var(--s-sur-accent)" }}>{children}</Cta>
);
const Coche = () => (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400">
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="#0B1B3F" strokeWidth={3.5}><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

export function TemplatePerformance({ d }: { d: SiteRendu }) {
  const c = d.contenu;
  const initiales = `${d.pro.prenom[0] ?? ""}${d.pro.nom[0] ?? ""}`.toUpperCase();
  const px = "px-6 @3xl:px-12 @5xl:px-20";
  const rdv = d.formule === "rdv";
  const cta = rdv ? "Prendre rendez-vous" : "Nous contacter";
  const note = d.avis.note;
  const [l1, ...reste] = c.hero.titre.split(/(?<=[:,])\s+/);

  return (
    <div className="bg-[var(--s-fond)] text-[#101828]" style={{ fontFamily: FONT_INTER }}>
      <div className="px-6 py-2.5 text-center text-[13px]" style={{ background: "var(--s-sombre)", color: "color-mix(in srgb, var(--s-sur-sombre) 75%, transparent)" }}>
        {rdv ? "Rendez-vous en ligne · " : "Réponse sous 48 h · "}<strong style={{ color: "var(--s-sur-sombre)" }}>au cabinet, en visio ou par téléphone</strong>
      </div>
      <header className={`flex items-center justify-between gap-6 border-b border-[#EAECF0] py-5 ${px}`}>
        <p className="text-lg font-bold">{d.cabinet.nom}</p>
        <div className="flex items-center gap-7 text-sm text-[#475467]">
          <nav className="hidden gap-7 @5xl:flex">{liensNav(d).filter((n) => n.id !== "contact").map((n) => <a key={n.id} href={`#${n.id}`} className="hover:text-black">{n.label(d)}</a>)}</nav>
          {d.cabinet.telephone && <a href={`tel:${d.cabinet.telephone.replace(/\s/g, "")}`} className="hidden font-semibold text-[#101828] @3xl:block">{d.cabinet.telephone}</a>}
          {a(d, "contact") && <Cta d={d} ancre="#contact-hero" className="rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ background: "var(--s-accent)", color: "var(--s-sur-accent)" }}>{rdv ? "Prendre RDV" : "Contact"}</Cta>}
        </div>
      </header>

      <section className={`flex flex-col gap-12 py-16 @5xl:flex-row @5xl:items-center @5xl:gap-16 @5xl:py-20 ${px}`} style={{ background: "var(--s-sombre)", color: "var(--s-sur-sombre)" }}>
        <div className="flex-1">
          {(note || d.apercu) && (
            <span className="inline-flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-[13px]" style={{ background: "color-mix(in srgb, var(--s-sur-sombre) 10%, var(--s-sombre))" }}>
              <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-bold text-[#101828]">G {(note ?? 4.9).toFixed(1).replace(".", ",")} <Etoiles note={note ?? 5} taille={11} /></span>
              {d.avis.nb ? `${d.avis.nb} avis Google` : "Avis Google"}
            </span>
          )}
          <h1 className="mt-7 text-sm font-semibold uppercase tracking-[0.12em] opacity-80">{c.hero.surtitre}</h1>
          <p className="mt-3 text-4xl font-bold leading-[1.08] tracking-[-0.025em] @3xl:text-[58px]">
            {l1}{reste.length > 0 && <> <span style={{ color: "var(--s-accent)", filter: "brightness(1.15)" }}>{reste.join(" ")}</span></>}
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed opacity-75">{c.hero.accroche}</p>
          <ul className="mt-8 space-y-3 text-[15px] opacity-90">
            {c.approche.points.map((p, i) => <li key={i} className="flex items-center gap-3"><Coche />{p}</li>)}
          </ul>
        </div>
        {a(d, "contact") && <div id="contact-hero" className="w-full @5xl:w-[460px]"><BlocContact d={d} variante="clair" /></div>}
      </section>

      <div className={`flex flex-wrap justify-center gap-x-14 gap-y-4 border-b border-[#EAECF0] py-8 text-[15px] text-[#475467] ${px}`}>
        {[...(note ? [{ valeur: `${note.toFixed(1).replace(".", ",")}/5`, label: "sur Google" }] : []), ...c.chiffres].slice(0, 4).map((x, i) => (
          <span key={i}><strong className="mr-2 text-[22px] text-[#101828]">{x.valeur}</strong>{x.label}</span>
        ))}
      </div>

      {a(d, "domaines") && (
        <section id="domaines" className={`py-20 text-center @3xl:py-24 ${px}`}>
          <Kicker>{d.profession === "avocat" ? "Domaines d'intervention" : "Missions"}</Kicker>
          <H2>{c.domaines.titre}</H2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#475467]">{c.domaines.intro}</p>
          <div className="mt-12 grid gap-5 text-left @3xl:grid-cols-2">
            {c.domaines.items.map((x, i) => (
              <div key={i} className="flex gap-5 rounded-2xl border border-[#EAECF0] p-7">
                <div className="h-12 w-12 shrink-0 rounded-xl" style={{ background: "color-mix(in srgb, var(--s-accent) 12%, white)" }} />
                <div>
                  <h3 className="text-[19px] font-semibold">{x.titre}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#475467]">{x.texte}</p>
                  {a(d, "contact") && <Cta d={d} ancre="#contact-hero" className="mt-3 inline-block text-sm font-semibold" style={{ color: "var(--s-accent)" }}>{rdv ? "Prendre rendez-vous →" : "Nous en parler →"}</Cta>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {avecAvis(d) && (
        <section id="avis" className={`bg-[var(--s-fond2)] py-20 text-center @3xl:py-24 ${px}`}>
          <Kicker>Avis Google</Kicker>
          <H2>{c.avis.titre}</H2>
          {note && <span className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm ring-1 ring-[#EAECF0]"><b>Google</b><Etoiles note={note} taille={14} /><b>{note.toFixed(1).replace(".", ",")}</b>{d.avis.nb && <span className="text-[#667085]">· {d.avis.nb} avis</span>}</span>}
          <div className="mt-10 grid gap-5 text-left @3xl:grid-cols-3">
            {avisAffiches(d).map((x, i) => (
              <div key={i} className="rounded-2xl bg-white p-7 ring-1 ring-[#EAECF0]">
                <Etoiles note={x.note} />
                <p className="mt-4 text-[15px] leading-relaxed text-[#344054]">{x.texte}</p>
                <p className="mt-5 flex items-center gap-3 text-sm font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAECF0] text-xs">{x.auteur[0]}</span>{x.auteur}</p>
              </div>
            ))}
          </div>
          {d.avis.url && <a href={d.avis.url} target="_blank" rel="noopener" className="mt-8 inline-block text-sm font-semibold underline underline-offset-4">Voir tous les avis</a>}
        </section>
      )}

      {a(d, "apropos") && (
        <section id="apropos" className={`flex flex-col gap-12 py-20 @3xl:flex-row @3xl:items-center @3xl:gap-16 @3xl:py-24 ${px}`}>
          <Visuel src={d.pro.photo} alt={nomAffiche(d)} initiales={initiales} className="aspect-square w-full max-w-[320px] shrink-0 rounded-2xl @3xl:w-[320px]" />
          <div className="flex-1">
            <Kicker>Le cabinet</Kicker>
            <H2 gauche>{c.apropos.titre}</H2>
            <p className="mt-5 text-[17px] leading-[1.7] text-[#475467]">{c.apropos.texte}</p>
            {c.apropos.texte2 && <p className="mt-4 text-[17px] leading-[1.7] text-[#475467]">{c.apropos.texte2}</p>}
            {a(d, "contact") && <div className="mt-8"><Bouton d={d}>{cta}</Bouton></div>}
          </div>
        </section>
      )}

      {a(d, "approche") && (
        <section className={`pb-20 @3xl:pb-24 ${px}`}>
          <div className="rounded-2xl border border-[#EAECF0] p-8 text-center @3xl:p-12">
            <Kicker>{c.approche.titre}</Kicker>
            <p className="mx-auto mt-4 max-w-3xl text-xl font-medium leading-relaxed @3xl:text-2xl">{c.approche.texte}</p>
          </div>
        </section>
      )}

      {a(d, "methode") && (
        <section id="methode" className={`bg-[var(--s-fond2)] py-20 text-center @3xl:py-24 ${px}`}>
          <Kicker>Méthode</Kicker>
          <H2>{c.methode.titre}</H2>
          <div className="mt-12 grid gap-5 text-left @3xl:grid-cols-4">
            {c.methode.etapes.map((e, i) => (
              <div key={i} className="rounded-2xl bg-white p-7 ring-1 ring-[#EAECF0]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full font-bold" style={{ background: "var(--s-sombre)", color: "var(--s-sur-sombre)" }}>{i + 1}</span>
                <h3 className="mt-5 text-lg font-semibold">{e.titre}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#475467]">{e.texte}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {avecHonoraires(d) && (
        <section id="honoraires" className={`py-20 text-center @3xl:py-24 ${px}`}>
          <Kicker>Honoraires</Kicker>
          <H2>{c.honoraires.titre}</H2>
          {c.honoraires.texte && <p className="mx-auto mt-4 max-w-2xl text-lg text-[#475467]">{c.honoraires.texte}</p>}
          <div className="mt-10 text-left"><ListesHonoraires d={d} carte="rounded-2xl border border-[#EAECF0] p-7" titre="text-[17px] font-semibold" item="text-[15px] text-[#344054]" /></div>
        </section>
      )}

      {a(d, "faq") && (
        <section id="faq" className={`py-20 text-center @3xl:py-24 ${px}`}>
          <Kicker>FAQ</Kicker>
          <H2>{c.faq.titre}</H2>
          <div className="mx-auto mt-10 max-w-3xl space-y-3 text-left">
            <Faq d={d} classeItem="rounded-xl border border-[#EAECF0] px-6" classeQuestion="py-5 text-[17px] font-medium" classeReponse="pb-5 text-[15px] leading-relaxed text-[#475467]" />
          </div>
        </section>
      )}

      {avecActualites(d) && (
        <section id="actualites" className={`pb-20 text-center @3xl:pb-24 ${px}`}>
          <Kicker>Actualités</Kicker>
          <H2>{c.actualites.titre}</H2>
          <div className="mt-10 grid gap-5 text-left @3xl:grid-cols-3">
            {actualitesAffichees(d).map((x, i) => (
              <details key={i} className="group rounded-2xl border border-[#EAECF0] p-7">
                <summary className="cursor-pointer list-none">
                  {x.date && <p className="text-xs text-[#667085]">{x.date}</p>}
                  <h3 className="mt-2 text-lg font-semibold">{x.titre}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#475467] group-open:line-clamp-none">{x.texte}</p>
                </summary>
              </details>
            ))}
          </div>
        </section>
      )}

      {a(d, "contact") && (
        <section id="contact" className={`pb-20 @3xl:pb-24 ${px}`}>
          <div className="flex flex-col gap-10 rounded-3xl p-8 @3xl:p-14 @5xl:flex-row @5xl:items-center" style={{ background: "var(--s-accent)", color: "var(--s-sur-accent)" }}>
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-[-0.02em] @3xl:text-[42px] @3xl:leading-[1.15]">{c.contact.titre}</h2>
              <p className="mt-3 text-[17px] opacity-85">{c.contact.texte}</p>
              <p className="mt-8 text-[15px] leading-relaxed opacity-90">{adresseLigne(d)}{d.cabinet.telephone && <><br />{d.cabinet.telephone}</>}{c.contact.horaires && <><br />{c.contact.horaires}</>}</p>
            </div>
            <Cta d={d} ancre="#contact-hero" className="inline-flex items-center justify-center self-start rounded-xl bg-white px-7 py-4 text-base font-semibold shadow-sm @5xl:self-center" style={{ color: "#101828" }}>{cta} →</Cta>
          </div>
        </section>
      )}

      <footer className={`flex flex-col gap-6 py-12 text-sm leading-relaxed @3xl:flex-row @3xl:justify-between ${px}`} style={{ background: "var(--s-sombre)", color: "color-mix(in srgb, var(--s-sur-sombre) 75%, transparent)" }}>
        <div>
          <p className="font-semibold" style={{ color: "var(--s-sur-sombre)" }}>{d.cabinet.nom}</p>
          <p>{adresseLigne(d)}</p>
          {d.cabinet.telephone && <p>{d.cabinet.telephone}</p>}
        </div>
        <div className="@3xl:text-right"><MentionsLegales d={d} /><Credit d={d} /></div>
      </footer>
    </div>
  );
}
