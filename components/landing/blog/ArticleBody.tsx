import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { slugify } from "@/lib/blog";
import { CTA_DEMO, type ProfessionId } from "@/lib/landing-config";
import {
  ApercuAgendaSemaine,
  ApercuAnnonceGoogle,
  ApercuArticle,
  ApercuDemandeQualifiee,
  ApercuEditeurSite,
  ApercuFicheGoogle,
  ApercuRapport,
  ApercuReponseIA,
  ApercuReservation,
} from "../apercus";
import { CtaLink } from "../ui";

/* ── Visuels utilisables dans les articles ─────────────────────────────────── */

function illustrations(p: ProfessionId): Record<string, ReactNode> {
  return {
    "fiche-google": <ApercuFicheGoogle p={p} />,
    reservation: <ApercuReservation p={p} />,
    "demande-qualifiee": <ApercuDemandeQualifiee p={p} />,
    agenda: <ApercuAgendaSemaine p={p} />,
    "reponse-ia": <ApercuReponseIA p={p} />,
    article: <ApercuArticle p={p} />,
    "editeur-site": <ApercuEditeurSite p={p} />,
    rapport: <ApercuRapport titre="Rapport de visibilité · Octobre" />,
    annonce: <ApercuAnnonceGoogle p={p} />,
  };
}

const PHOTOS: Record<ProfessionId, Record<string, { src: string; alt: string }>> = {
  avocat: {
    soir: { src: "/img/landing/photo-le-soir.png", alt: "Une personne cherche un avocat sur son téléphone, le soir, depuis son salon" },
    cabinet: { src: "/img/landing/visuel-bureau.png", alt: "Le bureau d’un cabinet d’avocat, avec sa bibliothèque et sa table de rendez-vous" },
  },
  comptable: {
    soir: { src: "/img/landing/photo-le-soir.png", alt: "Un dirigeant cherche un expert-comptable sur son téléphone, le soir, depuis chez lui" },
    cabinet: { src: "/img/landing/visuel-bureau.png", alt: "Le bureau d’un cabinet d’expertise comptable, avec sa bibliothèque et sa table de rendez-vous" },
  },
};

function Caption({ children }: { children?: ReactNode }) {
  return children ? <figcaption className="mt-3 text-center text-sm text-nuit/55">{children}</figcaption> : null;
}

/** Encart démo inséré au milieu de l'article. */
export function CtaArticle() {
  return (
    <aside className="my-12 rounded-[28px] p-8 text-center" style={{ backgroundImage: "var(--brand-gradient)" }}>
      <p className="font-manrope text-xl font-semibold text-nuit sm:text-2xl">Où en est la visibilité de votre cabinet ?</p>
      <p className="mt-2 text-nuit/70">On regarde ensemble votre site, votre fiche Google et vos demandes de rendez-vous.</p>
      <div className="mt-6 flex justify-center">
        <CtaLink cta={CTA_DEMO} />
      </div>
    </aside>
  );
}

/* ── Texte en ligne : **gras** et [lien](href) ─────────────────────────────── */

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(
        <strong key={k++} className="font-semibold text-nuit">
          {m[1]}
        </strong>,
      );
    } else {
      const href = m[3];
      const cls = "font-semibold text-brand underline underline-offset-2 hover:brightness-110";
      out.push(
        href.startsWith("/") ? (
          <Link key={k++} href={href} className={cls}>
            {m[2]}
          </Link>
        ) : (
          <a key={k++} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
            {m[2]}
          </a>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* ── Rendu des blocs ───────────────────────────────────────────────────────── */

function renderBlock(block: string, key: number, p: ProfessionId): ReactNode {
  const lines = block.split("\n").map((l) => l.trim());
  const first = lines[0];

  if (first.startsWith("## ")) {
    const t = first.slice(3);
    return (
      <h2 key={key} id={slugify(t)} className="mt-14 scroll-mt-28 text-2xl font-semibold tracking-[-0.6px] text-nuit sm:text-3xl">
        {inline(t)}
      </h2>
    );
  }
  if (first.startsWith("### ")) {
    const t = first.slice(4);
    return (
      <h3 key={key} id={slugify(t)} className="mt-8 scroll-mt-28 text-xl font-semibold text-nuit">
        {inline(t)}
      </h3>
    );
  }
  if (first === "::demo") return <CtaArticle key={key} />;
  if (first.startsWith("::illustration ")) {
    const [name, caption] = first.slice(15).split("|").map((s) => s.trim());
    const visual = illustrations(p)[name];
    if (!visual) return null;
    return (
      <figure key={key} className="my-10">
        <div className="flex justify-center rounded-[28px] bg-brand-section px-4 py-10 ring-1 ring-inset ring-black/5 sm:px-10">{visual}</div>
        <Caption>{caption}</Caption>
      </figure>
    );
  }
  if (first.startsWith("::photo ")) {
    const [name, caption] = first.slice(8).split("|").map((s) => s.trim());
    const photo = PHOTOS[p][name];
    if (!photo) return null;
    return (
      <figure key={key} className="my-10">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[28px] bg-gray-100">
          <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 720px, 100vw" className="object-cover" />
        </div>
        <Caption>{caption}</Caption>
      </figure>
    );
  }
  if (lines.every((l) => l.startsWith("- "))) {
    return (
      <ul key={key} className="mt-5 list-disc space-y-2 pl-6 text-[17px] text-nuit/80 marker:text-brand">
        {lines.map((l, i) => (
          <li key={i} className="leading-relaxed">
            {inline(l.slice(2))}
          </li>
        ))}
      </ul>
    );
  }
  if (lines.every((l) => /^\d+\. /.test(l))) {
    return (
      <ol key={key} className="mt-5 list-decimal space-y-2 pl-6 text-[17px] text-nuit/80 marker:font-semibold marker:text-brand">
        {lines.map((l, i) => (
          <li key={i} className="leading-relaxed">
            {inline(l.replace(/^\d+\. /, ""))}
          </li>
        ))}
      </ol>
    );
  }
  if (first.startsWith("> ")) {
    return (
      <blockquote key={key} className="mt-6 rounded-r-xl border-l-4 border-brand bg-brand-soft px-5 py-3 text-[17px] text-nuit/80">
        {inline(lines.map((l) => l.replace(/^> ?/, "")).join(" "))}
      </blockquote>
    );
  }
  return (
    <p key={key} className="mt-5 text-[17px] leading-[1.75] text-nuit/80">
      {inline(lines.join(" "))}
    </p>
  );
}

/**
 * Corps d'un article. Un encart démo est inséré avant le H2 du milieu
 * (sauf si l'article contient déjà « ::demo »).
 */
export default function ArticleBody({ body, profession = "avocat" }: { body: string; profession?: ProfessionId }) {
  const blocks = body
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (!blocks.includes("::demo")) {
    const h2 = blocks.map((b, i) => (b.startsWith("## ") ? i : -1)).filter((i) => i >= 0);
    if (h2.length >= 2) blocks.splice(h2[Math.floor(h2.length / 2)], 0, "::demo");
  }
  return <div>{blocks.map((b, i) => renderBlock(b, i, profession))}</div>;
}
