import type { SectionId, SiteRendu } from "@/lib/site/types";
import { FormulaireContact } from "@/components/mon-site/FormulaireContact";
import { BoutonRdv } from "@/components/mon-site/BoutonRdv";

/* Briques communes aux 3 templates. Les couleurs viennent des variables CSS de la palette (--s-*). */

export const a = (d: SiteRendu, id: SectionId) => d.sections.includes(id);

export const NAV: { id: SectionId; label: (d: SiteRendu) => string }[] = [
  { id: "apropos", label: (d) => (d.profession === "avocat" ? "Le cabinet" : "Le cabinet") },
  { id: "domaines", label: (d) => (d.profession === "avocat" ? "Domaines" : "Missions") },
  { id: "methode", label: () => "Méthode" },
  { id: "honoraires", label: () => "Honoraires" },
  { id: "avis", label: () => "Avis" },
  { id: "faq", label: () => "FAQ" },
  { id: "actualites", label: () => "Actualités" },
  { id: "contact", label: (d) => (d.formule === "rdv" ? "Rendez-vous" : "Contact") },
];
export const liensNav = (d: SiteRendu) => NAV.filter((n) => a(d, n.id) && (n.id !== "actualites" || avecActualites(d)) && (n.id !== "avis" || avecAvis(d)) && (n.id !== "honoraires" || avecHonoraires(d)));

/* ---------- Honoraires (repris de Profil → Honoraires) ---------- */
const HONORAIRES_EXEMPLE = { modes: ["Forfait", "Taux horaire", "Selon convention d'honoraires"], paiement: ["Carte bancaire", "Virement", "Chèque"], services: ["Premier rendez-vous offert si ouverture de dossier", "Paiement en plusieurs fois"] };
export const honorairesAffiches = (d: SiteRendu) => {
  const h = d.honoraires;
  const vide = !h.modes.length && !h.paiement.length && !h.services.length;
  return vide && d.apercu ? HONORAIRES_EXEMPLE : h;
};
export const avecHonoraires = (d: SiteRendu) => {
  const h = honorairesAffiches(d);
  return a(d, "honoraires") && (h.modes.length > 0 || h.paiement.length > 0 || h.services.length > 0 || !!d.contenu.honoraires.texte);
};

/** Trois colonnes : facturation, paiement, services. `carte` = style d'une colonne (propre à chaque template). */
export function ListesHonoraires({ d, carte, titre, item }: { d: SiteRendu; carte: string; titre: string; item: string }) {
  const h = honorairesAffiches(d);
  const blocs = [
    { t: "Mode de facturation", l: h.modes },
    { t: "Moyens de paiement", l: h.paiement },
    { t: d.profession === "avocat" ? "Bon à savoir" : "Services", l: h.services },
  ].filter((b) => b.l.length);
  if (!blocs.length) return null;
  return (
    <div className={`grid gap-4 ${blocs.length === 3 ? "@3xl:grid-cols-3" : blocs.length === 2 ? "@3xl:grid-cols-2" : ""}`}>
      {blocs.map((b) => (
        <div key={b.t} className={carte}>
          <p className={titre}>{b.t}</p>
          <ul className="mt-4 space-y-2.5">
            {b.l.map((x) => (
              <li key={x} className={`flex gap-3 ${item}`}>
                <span className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--s-accent)" }} />{x}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export const nomAffiche = (d: SiteRendu) => `${d.pro.titre ? d.pro.titre + " " : ""}${d.pro.prenom} ${d.pro.nom}`.trim();
export const adresseLigne = (d: SiteRendu) =>
  [d.cabinet.adresse, d.cabinet.complement, [d.cabinet.codePostal, d.cabinet.ville].filter(Boolean).join(" ")].filter(Boolean).join(", ");

export const AVIS_EXEMPLE = [
  { auteur: "Claire M.", note: 5, texte: "Une écoute attentive, des explications claires et une grande réactivité. Je recommande." },
  { auteur: "Julien R.", note: 5, texte: "Accompagnement très humain dans une période difficile. Merci pour votre disponibilité." },
  { auteur: "Nadia B.", note: 5, texte: "Honoraires clairs dès le départ et un suivi régulier de mon dossier." },
];
export const avisAffiches = (d: SiteRendu) => (d.avis.liste.length ? d.avis.liste.slice(0, 3) : d.apercu ? AVIS_EXEMPLE : []);
export const avecAvis = (d: SiteRendu) => a(d, "avis") && (avisAffiches(d).length > 0 || !!d.avis.note || !!d.avis.url);
export const avecActualites = (d: SiteRendu) => a(d, "actualites") && d.formule === "rdv" && (d.contenu.actualites.items.length > 0 || !!d.apercu);
export const actualitesAffichees = (d: SiteRendu) =>
  d.contenu.actualites.items.length ? d.contenu.actualites.items.slice(0, 3)
    : [
        { titre: "Titre de votre premier article", date: "", texte: "Partagez une actualité du cabinet ou un éclairage sur une question fréquente de vos clients." },
        { titre: "Titre de votre deuxième article", date: "", texte: "Vos articles s'ajoutent depuis votre espace, rubrique Mon site." },
      ];

export function Etoiles({ note = 5, taille = 16, couleur = "#F5B301" }: { note?: number; taille?: number; couleur?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={taille} height={taille} viewBox="0 0 20 20" fill={i <= Math.round(note) ? couleur : "#D0D5DD"} aria-hidden>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L10 14.9l-5.25 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/** Photo de l'utilisateur, ou à défaut un aplat dans les couleurs de la palette (jamais une image trompeuse). */
export function Visuel({ src, alt, className, initiales, sombre = false }: { src: string | null; alt: string; className?: string; initiales?: string; sombre?: boolean }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={`object-cover ${className ?? ""}`} />;
  }
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className ?? ""}`}
      style={{ background: sombre
        ? "linear-gradient(135deg, var(--s-sombre), color-mix(in srgb, var(--s-sombre) 70%, var(--s-accent)))"
        : "linear-gradient(135deg, color-mix(in srgb, var(--s-accent) 22%, var(--s-fond2)), color-mix(in srgb, var(--s-accent) 45%, var(--s-fond2)))" }}>
      {initiales && <span className="select-none text-[clamp(2rem,8cqi,6rem)] font-semibold tracking-tight opacity-60" style={{ color: sombre ? "var(--s-sur-sombre)" : "var(--s-sombre)" }}>{initiales}</span>}
    </div>
  );
}

export function Faq({ d, classeItem, classeQuestion, classeReponse, signe }: { d: SiteRendu; classeItem: string; classeQuestion: string; classeReponse: string; signe?: string }) {
  return (
    <div>
      {d.contenu.faq.items.map((f, i) => (
        <details key={i} className={`group ${classeItem}`}>
          <summary className={`flex cursor-pointer list-none items-center justify-between gap-6 ${classeQuestion}`}>
            <span>{f.q}</span>
            <span className="shrink-0 text-xl transition-transform group-open:rotate-45" style={{ color: signe ?? "var(--s-accent)" }}>+</span>
          </summary>
          <p className={classeReponse}>{f.r}</p>
        </details>
      ))}
    </div>
  );
}

/**
 * Bouton d'action principal du site. Formule rendez-vous : ouvre la vraie prise de rdv du cabinet (motif, format, créneau).
 * Formule contact : descend jusqu'au formulaire.
 */
export function Cta({ d, className, style, children, ancre = "#contact" }: { d: SiteRendu; className?: string; style?: React.CSSProperties; children: React.ReactNode; ancre?: string }) {
  if (d.formule === "rdv") return <BoutonRdv lien={d.apercu ? null : d.lienRdv} className={`cursor-pointer ${className ?? ""}`} style={style}>{children}</BoutonRdv>;
  return <a href={ancre} className={className} style={style}>{children}</a>;
}

/** Bloc de prise de rendez-vous (formule rdv) : un seul bouton qui ouvre la prise de rdv du cabinet. */
export function CarteRdv({ d, variante }: { d: SiteRendu; variante: "clair" | "sombre" }) {
  const sombre = variante === "sombre";
  const sous = sombre ? "opacity-60" : "text-gray-500";
  return (
    <div className={`p-6 @3xl:p-8 ${sombre ? "" : "rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"}`} style={sombre ? { background: "var(--s-sombre)", color: "var(--s-sur-sombre)" } : { color: "#101828" }}>
      <p className="text-lg font-semibold">Prendre rendez-vous en ligne</p>
      <p className={`mt-1 text-sm ${sous}`}>{nomAffiche(d)}</p>
      <ul className="mt-6 space-y-3 text-sm">
        {["Choisissez le motif de votre demande", "Au cabinet, en visio ou par téléphone", "Sélectionnez le créneau qui vous convient"].map((t, i) => (
          <li key={t} className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ background: "color-mix(in srgb, var(--s-accent) 18%, transparent)", color: sombre ? "var(--s-sur-sombre)" : "var(--s-sombre)" }}>{i + 1}</span>{t}
          </li>
        ))}
      </ul>
      <Cta d={d} className={`mt-7 flex w-full items-center justify-center px-5 py-3.5 text-sm font-semibold ${sombre ? "" : "rounded-xl"}`}
        style={{ background: "var(--s-accent)", color: "var(--s-sur-accent)" }}>
        Voir les créneaux disponibles
      </Cta>
      <p className={`mt-3 text-center text-xs ${sous}`}>Gratuit · confirmation par e-mail</p>
    </div>
  );
}

/** Formulaire ou prise de rendez-vous selon la formule souscrite. */
export function BlocContact({ d, variante }: { d: SiteRendu; variante: "clair" | "sombre" }) {
  return d.formule === "rdv" ? <CarteRdv d={d} variante={variante} /> : <FormulaireContact siteId={d.siteId} apercu={!!d.apercu} variante={variante} />;
}

/** Lien vers la page Mentions légales & confidentialité du site. */
export function MentionsLegales({ d, className }: { d: SiteRendu; className?: string }) {
  return <a href={d.apercu || !d.slug ? undefined : `/${d.slug}/mentions-legales`} className={`block hover:underline ${className ?? ""}`}>Mentions légales & confidentialité</a>;
}

export const Credit = ({ d }: { d: SiteRendu }) => (
  <a href={d.profession === "comptable" ? "https://comptable.clotere.fr/produit/creation-site-internet-expert-comptable" : "https://avocat.clotere.fr/produit/creation-site-internet-avocat"}
    className="hover:underline" target="_blank" rel="noopener">Site créé avec Clotere</a>
);
