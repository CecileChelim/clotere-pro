import type { SiteRendu } from "@/lib/site/types";
import { FONT_INTER } from "@/components/mon-site/fonts";
import { a, avecHonoraires, ListesHonoraires, Cta, actualitesAffichees, adresseLigne, avecActualites, avecAvis, avisAffiches, BlocContact, Credit, Etoiles, Faq, liensNav, MentionsLegales, nomAffiche, Visuel } from "@/components/mon-site/parts";

/* Template 1 — Light : clair, sobre, rassurant. Fond crème (fond2), accent en boutons et blocs. */

const Surtitre = ({ children, clair = false }: { children: React.ReactNode; clair?: boolean }) => (
  <p className="text-[13px] font-medium uppercase tracking-[0.12em]" style={{ color: clair ? "color-mix(in srgb, var(--s-sur-accent) 75%, transparent)" : "var(--s-accent)" }}>{children}</p>
);
const H2 = ({ children, clair = false }: { children: React.ReactNode; clair?: boolean }) => (
  <h2 className="mt-3 text-3xl font-medium tracking-tight @3xl:text-[40px] @3xl:leading-[1.15]" style={{ color: clair ? "var(--s-sur-accent)" : "#1F2421" }}>{children}</h2>
);
/** Bouton ; avec `d`, c'est l'action principale (ouvre la prise de rdv ou descend au formulaire). */
const Bouton = ({ href, children, contour = false, d }: { href?: string; children: React.ReactNode; contour?: boolean; d?: SiteRendu }) => {
  const cls = "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-medium transition hover:opacity-90";
  const st = contour ? { color: "var(--s-accent)", boxShadow: "inset 0 0 0 1px var(--s-accent)" } : { background: "var(--s-accent)", color: "var(--s-sur-accent)" };
  return d ? <Cta d={d} className={cls} style={st}>{children}</Cta> : <a href={href} className={cls} style={st}>{children}</a>;
};

export function TemplateLight({ d }: { d: SiteRendu }) {
  const c = d.contenu;
  const initiales = `${d.pro.prenom[0] ?? ""}${d.pro.nom[0] ?? ""}`.toUpperCase();
  const px = "px-6 @3xl:px-12 @5xl:px-24";
  const cta = d.formule === "rdv" ? "Prendre rendez-vous" : "Prendre contact";

  return (
    <div className="bg-[var(--s-fond)] text-[#1F2421]" style={{ fontFamily: FONT_INTER }}>
      <header className={`flex items-center justify-between gap-6 border-b border-[#ECEAE4] py-6 ${px}`}>
        <div>
          <p className="text-lg font-semibold">{d.cabinet.nom}</p>
          <p className="text-xs text-[#7A7F7B]">{nomAffiche(d)} · {d.cabinet.ville}</p>
        </div>
        <nav className="hidden gap-8 text-sm text-[#4A504C] @5xl:flex">
          {liensNav(d).map((n) => <a key={n.id} href={`#${n.id}`} className="hover:text-black">{n.label(d)}</a>)}
        </nav>
        {a(d, "contact") && <span className="hidden @3xl:block"><Bouton d={d} contour>{cta}</Bouton></span>}
      </header>

      <section className={`flex flex-col gap-12 bg-[var(--s-fond2)] py-16 @3xl:flex-row @3xl:items-center @3xl:gap-20 @3xl:py-24 ${px}`}>
        <div className="flex-1">
          <h1 className="text-[13px] font-medium uppercase tracking-[0.12em]" style={{ color: "var(--s-accent)" }}>{c.hero.surtitre}</h1>
          <p className="mt-5 text-4xl font-medium leading-[1.1] tracking-tight @3xl:text-[56px]">{c.hero.titre}</p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#5A605C]">{c.hero.accroche}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            {a(d, "contact") && <Bouton d={d}>{cta}</Bouton>}
            {a(d, "domaines") && <Bouton href="#domaines" contour>{c.domaines.titre}</Bouton>}
          </div>
        </div>
        <Visuel src={d.couverture} alt={d.cabinet.nom} className="aspect-[4/5] w-full rounded-t-full rounded-b-2xl @3xl:w-[42%]" />
      </section>

      {a(d, "apropos") && (
        <section id="apropos" className={`flex flex-col gap-12 py-20 @3xl:flex-row @3xl:items-center @3xl:gap-24 @3xl:py-28 ${px}`}>
          <Visuel src={d.pro.photo} alt={nomAffiche(d)} initiales={initiales} className="aspect-[4/5] w-full max-w-[280px] shrink-0 rounded-2xl @3xl:w-[280px]" />
          <div className="flex-1">
            <Surtitre>À propos</Surtitre>
            <H2>{c.apropos.titre}</H2>
            <p className="mt-6 text-[17px] leading-[1.75] text-[#4A504C]">{c.apropos.texte}</p>
            {c.apropos.texte2 && <p className="mt-4 text-[17px] leading-[1.75] text-[#4A504C]">{c.apropos.texte2}</p>}
            <p className="mt-8 text-[15px] font-medium">{c.apropos.signature}</p>
          </div>
        </section>
      )}

      {a(d, "domaines") && (
        <section id="domaines" className={`pb-20 @3xl:pb-28 ${a(d, "apropos") ? "" : "pt-20 @3xl:pt-28"} ${px}`}>
          <Surtitre>{d.profession === "avocat" ? "Expertises" : "Missions"}</Surtitre>
          <H2>{c.domaines.titre}</H2>
          <p className="mt-4 max-w-2xl text-[17px] text-[#5A605C]">{c.domaines.intro}</p>
          <div className="mt-12 grid gap-6 @3xl:grid-cols-2 @5xl:grid-cols-4">
            {c.domaines.items.map((x, i) => (
              <div key={i} className="rounded-2xl border border-[#ECEAE4] bg-white p-8">
                <div className="h-11 w-11 rounded-xl" style={{ background: "color-mix(in srgb, var(--s-accent) 12%, white)" }} />
                <h3 className="mt-6 text-xl font-medium">{x.titre}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5A605C]">{x.texte}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {a(d, "approche") && (
        <section className={`pb-20 @3xl:pb-28 ${px}`}>
          <div className="flex flex-col gap-10 rounded-3xl bg-[var(--s-fond2)] p-8 @3xl:flex-row @3xl:p-14">
            <div className="flex-1">
              <Surtitre>{c.approche.titre}</Surtitre>
              <p className="mt-5 text-2xl font-medium leading-snug tracking-tight @3xl:text-3xl">{c.approche.texte}</p>
            </div>
            <ul className="space-y-4 @3xl:w-80">
              {c.approche.points.map((p, i) => (
                <li key={i} className="flex items-center gap-3 border-b border-black/10 pb-4 text-[15px]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--s-accent)" }} />{p}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {a(d, "methode") && (
        <section id="methode" className={`pb-20 @3xl:pb-28 ${px}`}>
          <Surtitre>Méthode</Surtitre>
          <H2>{c.methode.titre}</H2>
          <div className="mt-12 grid gap-8 @3xl:grid-cols-4 @3xl:gap-6">
            {c.methode.etapes.map((e, i) => (
              <div key={i} className="border-t border-[#1F2421] pt-7">
                <p className="text-sm" style={{ color: "var(--s-accent)" }}>{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-xl font-medium">{e.titre}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5A605C]">{e.texte}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {avecHonoraires(d) && (
        <section id="honoraires" className={`pb-20 @3xl:pb-28 ${px}`}>
          <Surtitre>Honoraires</Surtitre>
          <H2>{c.honoraires.titre}</H2>
          {c.honoraires.texte && <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#5A605C]">{c.honoraires.texte}</p>}
          <div className="mt-10"><ListesHonoraires d={d} carte="rounded-2xl border border-[#ECEAE4] bg-white p-7" titre="text-lg font-medium" item="text-[15px] text-[#4A504C]" /></div>
        </section>
      )}

      {avecAvis(d) && (
        <section id="avis" className={`bg-[var(--s-fond2)] py-20 @3xl:py-28 ${px}`}>
          <Surtitre>Avis Google</Surtitre>
          <H2>{c.avis.titre}</H2>
          {d.avis.note && <p className="mt-4 flex items-center gap-3 text-[15px] text-[#5A605C]"><Etoiles note={d.avis.note} />{d.avis.note.toFixed(1).replace(".", ",")} / 5{d.avis.nb ? ` · ${d.avis.nb} avis Google` : ""}</p>}
          <div className="mt-10 grid gap-6 @3xl:grid-cols-3">
            {avisAffiches(d).map((x, i) => (
              <div key={i} className="rounded-2xl bg-white p-8">
                <Etoiles note={x.note} />
                <p className="mt-4 text-[15px] leading-relaxed text-[#4A504C]">{x.texte}</p>
                <p className="mt-5 text-sm font-medium">{x.auteur}</p>
              </div>
            ))}
          </div>
          {d.avis.url && <a href={d.avis.url} target="_blank" rel="noopener" className="mt-8 inline-block text-sm font-medium underline underline-offset-4" style={{ color: "var(--s-accent)" }}>Voir tous les avis sur Google</a>}
        </section>
      )}

      {a(d, "faq") && (
        <section id="faq" className={`flex flex-col gap-10 py-20 @3xl:flex-row @3xl:gap-24 @3xl:py-28 ${px}`}>
          <div className="@3xl:w-80"><Surtitre>FAQ</Surtitre><H2>{c.faq.titre}</H2></div>
          <div className="flex-1"><Faq d={d} classeItem="border-b border-[#ECEAE4]" classeQuestion="py-6 text-[17px]" classeReponse="pb-6 text-[15px] leading-relaxed text-[#5A605C]" /></div>
        </section>
      )}

      {avecActualites(d) && (
        <section id="actualites" className={`pb-20 @3xl:pb-28 ${a(d, "faq") ? "" : "pt-20"} ${px}`}>
          <Surtitre>Actualités</Surtitre>
          <H2>{c.actualites.titre}</H2>
          <div className="mt-10 grid gap-6 @3xl:grid-cols-3">
            {actualitesAffichees(d).map((x, i) => (
              <details key={i} className="group rounded-2xl border border-[#ECEAE4] p-7">
                <summary className="cursor-pointer list-none">
                  {x.date && <p className="text-xs text-[#7A7F7B]">{x.date}</p>}
                  <h3 className="mt-2 text-lg font-medium">{x.titre}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#5A605C] group-open:line-clamp-none">{x.texte}</p>
                  <span className="mt-4 inline-block text-sm font-medium group-open:hidden" style={{ color: "var(--s-accent)" }}>Lire la suite</span>
                </summary>
              </details>
            ))}
          </div>
        </section>
      )}

      {a(d, "contact") && (
        <section id="contact" className={`pb-20 @3xl:pb-28 ${px}`}>
          <div className="flex flex-col gap-12 rounded-3xl p-8 @3xl:p-16 @5xl:flex-row @5xl:gap-20" style={{ background: "var(--s-accent)", color: "var(--s-sur-accent)" }}>
            <div className="flex-1">
              <Surtitre clair>{d.formule === "rdv" ? "Rendez-vous" : "Contact"}</Surtitre>
              <H2 clair>{c.contact.titre}</H2>
              <p className="mt-4 text-[17px] leading-relaxed opacity-80">{c.contact.texte}</p>
              <div className="mt-10 space-y-2 text-[15px] opacity-90">
                <p>{adresseLigne(d)}</p>
                {d.cabinet.telephone && <p>{d.cabinet.telephone}</p>}
                {d.cabinet.email && <p>{d.cabinet.email}</p>}
                {c.contact.horaires && <p>{c.contact.horaires}</p>}
              </div>
            </div>
            <div className="@5xl:w-[480px]"><BlocContact d={d} variante="clair" /></div>
          </div>
        </section>
      )}

      <footer className={`flex flex-col gap-4 border-t border-[#ECEAE4] py-10 text-[13px] text-[#7A7F7B] @3xl:flex-row @3xl:justify-between ${px}`}>
        <div><p>© {new Date().getFullYear()} {d.cabinet.nom}</p><MentionsLegales d={d} className="mt-2" /></div>
        <Credit d={d} />
      </footer>
    </div>
  );
}
