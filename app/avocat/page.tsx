import type { Metadata } from "next";
import { BookingAnimation } from "@/components/avocat/BookingAnimation";
import { AiReplyDemo } from "@/components/avocat/AiReplyDemo";
import { createClient } from "@/lib/supabase/server";

const DEMO_LINK = "https://calendar.app.google/k2btydyaoysdvgTx6";
const SIGNUP = "/signup";

export const metadata: Metadata = {
  title: { absolute: "Clotere Avocat — Visibilité et prise de rendez-vous en ligne pour avocats" },
  alternates: { canonical: "https://avocat.clotere.fr" },
};

function Check({ className = "h-5 w-5 text-[#ee87cb]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`flex-none ${className}`} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.81a.75.75 0 0 0-1.22-.88l-3.24 4.48-1.6-1.6a.75.75 0 1 0-1.06 1.06l2.22 2.22a.75.75 0 0 0 1.14-.09l3.76-5.19Z" clipRule="evenodd" />
    </svg>
  );
}

const integrations = ["Site web", "Fiche Google", "LinkedIn", "Signature mail", "WhatsApp"];

const pillars = [
  {
    tag: "Prise de RDV",
    title: "Vos clients réservent 24/7, même le dimanche soir.",
    points: [
      "Un bouton qui s'intègre partout en 5 minutes",
      "Motifs de consultation et questions de pré-qualification",
      "Synchronisé avec Google Calendar et Outlook",
    ],
  },
  {
    tag: "Réponses prêtes",
    title: "Chaque demande reçoit une réponse, sans que vous leviez le petit doigt.",
    points: [
      "Chaque demande arrive qualifiée : motif, situation, échéance",
      "Un message type adapté au motif, prêt à envoyer en un clic",
      "Vous ne recevez que des rendez-vous qualifiés",
    ],
  },
  {
    tag: "SEO",
    title: "Soyez le premier cabinet que l'on trouve sur Google dans votre ville.",
    points: [
      "Articles ciblés sur vos domaines d'expertise, publiés chaque mois",
      "Optimisation de votre fiche Google Business",
      "Reporting mensuel de vos positions et de vos rendez-vous",
    ],
  },
];

export default async function AvocatLanding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pro } = user ? await (supabase as any).from("professionals").select("prenom, nom").eq("auth_user_id", user.id).maybeSingle() : { data: null };
  const initiales = pro ? `${pro.prenom?.[0] ?? ""}${pro.nom?.[0] ?? ""}`.toUpperCase() : (user?.email?.[0] ?? "").toUpperCase();

  return (
    <div className="bg-white text-gray-950 antialiased">
      {/* Header + Hero (style Radiant) */}
      <div className="relative">
        <div className="absolute inset-2 bottom-0 rounded-[2rem] bg-[linear-gradient(115deg,#fff1be_28%,#ee87cb_70%,#b060ff)] ring-1 ring-black/5 ring-inset sm:bg-[linear-gradient(145deg,#fff1be_28%,#ee87cb_70%,#b060ff)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <header className="flex items-center justify-between pt-12">
            <a href="/" className="flex items-center gap-2 text-gray-950" aria-label="Clotere Avocat">
              <span className="whitespace-nowrap text-base font-bold tracking-tight sm:text-lg">Clotere <span className="font-medium">Avocat</span></span>
            </a>
            <nav className="flex items-center gap-2 text-sm font-medium text-gray-950">
              <a href="#leviers" className="hidden rounded-full px-4 py-2 hover:bg-black/[2.5%] sm:block">Fonctionnalités</a>
              {user ? (
                <a href="/dashboard" className="flex items-center gap-2.5 rounded-full bg-gray-950 py-1.5 pr-4 pl-1.5 text-white shadow-md hover:bg-gray-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">{initiales}</span>
                  <span>Mon espace</span>
                </a>
              ) : (
                <>
                  <a href="/login" className="hidden rounded-full px-4 py-2 hover:bg-black/[2.5%] sm:block">Se connecter</a>
                  <a href={DEMO_LINK} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap rounded-full bg-gray-950 px-4 py-2 text-white shadow-md hover:bg-gray-800">
                    <span className="sm:hidden">Démo</span><span className="hidden sm:inline">Réserver une démo</span>
                  </a>
                </>
              )}
            </nav>
          </header>
          <div className="grid grid-cols-1 items-center gap-12 pt-16 pb-24 sm:pt-24 sm:pb-32 lg:grid-cols-2 lg:pt-28 lg:pb-36">
            <div>
            <p className="mb-6 font-mono text-xs font-semibold uppercase tracking-widest text-gray-950/60">Prise de rendez-vous en ligne pour avocats</p>
            <h1 className="max-w-3xl text-balance text-5xl font-medium tracking-tight text-gray-950 sm:text-6xl/[0.95] xl:text-7xl/[0.9]">
              Plus de clients, moins de temps perdu.
            </h1>
            <p className="mt-8 max-w-xl text-pretty text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
              Prise de rendez-vous en ligne, réponses prêtes à envoyer et référencement local pour les cabinets d&apos;avocats.
            </p>
            <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
              <a href={DEMO_LINK} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gray-950 px-6 py-3 text-center text-base font-medium text-white shadow-md hover:bg-gray-800">
                Réserver une démo
              </a>
              <a href={SIGNUP} className="rounded-full bg-white/15 px-6 py-3 text-center text-base font-medium text-gray-950 shadow-md ring-1 ring-black/15 hover:bg-white/20">
                Créer mon compte
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-950/70">Conforme aux règles de communication de la profession · Données chiffrées en Europe · Sans engagement</p>
            </div>
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <BookingAnimation />
            </div>
          </div>
        </div>
      </div>

      {/* Chiffres */}
      <section className="bg-white py-14 text-gray-950">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 text-center sm:grid-cols-3">
          {[
            ["85 %", "des rendez-vous sont pris hors horaires d'ouverture"],
            ["5 min", "pour intégrer le bouton sur votre site"],
            ["0", "appel à passer pour trier les demandes"],
          ].map(([n, l]) => (
            <div key={n}>
              <p className="bg-[linear-gradient(115deg,#e6a700,#ee87cb,#b060ff)] bg-clip-text text-5xl font-medium tracking-tight text-transparent">{n}</p>
              <p className="mt-2 text-sm text-gray-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-6xl px-6 pt-12 pb-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Comment ça marche</p>
          <h2 className="mt-2 text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">En place en une journée.</h2>
        </div>
        <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            ["On configure vos motifs", "Domaines d'expertise, durées, questions de pré-qualification : on le fait avec vous."],
            ["Vous collez le bouton", "Sur votre site, votre fiche Google, LinkedIn, votre signature mail. 5 minutes."],
            ["Vous recevez des rdv triés", "Vous validez en un clic : le client reçoit la confirmation et vos consignes."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-[2rem] bg-white p-8 shadow-md ring-1 ring-black/5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">{i + 1}</span>
              <h3 className="mt-5 text-xl font-medium text-gray-950">{t}</h3>
              <p className="mt-2 text-sm text-gray-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3 piliers */}
      <section id="leviers" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#b060ff]">Ce que vous obtenez</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Trois leviers, un seul objectif : remplir votre agenda.</h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.tag} className="flex flex-col rounded-[2rem] bg-white p-8 shadow-md ring-1 ring-black/5">
              <p className="text-sm font-semibold text-[#b060ff]">{p.tag}</p>
              <h3 className="mt-2 text-xl font-semibold">{p.title}</h3>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2"><Check />{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm font-semibold text-slate-700">S&apos;intègre partout :</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {integrations.map((i) => (
              <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">{i}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Exemple de réponse */}
      <section className="bg-gray-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-white/50">Réponses prêtes à envoyer</p>
            <h2 className="mt-2 text-4xl font-medium tracking-tight sm:text-5xl">Chaque client reçoit une réponse. Vous, vous plaidez.</h2>
          </div>
          <AiReplyDemo />
        </div>
      </section>

      {/* Offres (sans prix) */}
      <section id="offres" className="mx-auto max-w-5xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Offres</p>
          <h2 className="mt-2 text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">Deux formules, sans engagement.</h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            { name: "Rendez-vous", desc: "La prise de rendez-vous en ligne qui s'intègre partout.", featured: false, cta: "Commencer", href: SIGNUP,
              features: ["Widget intégrable partout", "Messages types prêts à envoyer", "Synchronisation d'agenda", "Rappels automatiques clients", "Tableau de bord des rendez-vous"] },
            { name: "Croissance", desc: "Le widget + l'accompagnement SEO pour passer devant vos concurrents.", featured: true, cta: "Réserver une démo", href: DEMO_LINK,
              features: ["Tout le module Rendez-vous", "Articles SEO rédigés et publiés chaque mois", "Optimisation de la fiche Google Business", "Stratégie de mots-clés locale", "Reporting mensuel"] },
          ].map((p) => (
            <div key={p.name} className={`flex flex-col rounded-[2rem] bg-white p-8 shadow-md ring-1 ${p.featured ? "ring-2 ring-[#b060ff]" : "ring-black/5"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-medium text-gray-950">{p.name}</h3>
                {p.featured && <span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-medium text-white">Être le premier</span>}
              </div>
              <p className="mt-2 text-sm text-gray-600">{p.desc}</p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                {p.features.map((f) => <li key={f} className="flex gap-2"><Check />{f}</li>)}
              </ul>
              <a href={p.href} {...(p.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`mt-8 rounded-full px-4 py-3 text-center text-sm font-medium ${p.featured ? "bg-gray-950 text-white hover:bg-gray-800" : "bg-white text-gray-950 ring-1 ring-black/15 hover:bg-gray-50"}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Confiance */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Confiance &amp; sécurité</p>
          <h2 className="mt-2 text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">Le secret professionnel, sans compromis.</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            ["Données hébergées en Europe", "Infrastructure sécurisée, données chiffrées."],
            ["Secret professionnel", "Les échanges avec vos clients restent confidentiels."],
            ["Conforme RGPD", "Aucune donnée revendue, jamais."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl bg-gradient-to-br from-[#fff1be]/40 to-[#ee87cb]/20 p-6">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">FAQ</p>
          <h2 className="mt-2 text-4xl font-medium tracking-tight text-gray-950">Vos questions</h2>
        </div>
        <div className="mt-12 divide-y divide-black/5 rounded-[2rem] bg-white px-8 shadow-md ring-1 ring-black/5">
          {[
            ["Est-ce compatible avec mon agenda ?", "Oui : Clotere se synchronise avec Google Calendar et Outlook. Seuls vos créneaux libres sont proposés."],
            ["Que deviennent les données de mes clients ?", "Elles sont hébergées en Europe, chiffrées, et ne sont jamais revendues. Le secret professionnel est respecté."],
            ["Est-ce conforme à la déontologie ?", "Oui : la prise de rendez-vous et le référencement respectent les règles de communication de la profession d'avocat."],
            ["Suis-je engagé ?", "Non, nos offres sont sans engagement. Vous pouvez arrêter à tout moment."],
            ["Qui écrit les articles SEO ?", "Notre équipe, sur vos domaines d'expertise et votre ville. Vous validez chaque article avant publication."],
          ].map(([q, r]) => (
            <details key={q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-950">
                {q}<span className="ml-4 text-gray-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600">{r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA + Footer (style Radiant) */}
      <footer className="relative">
        <div className="absolute inset-2 rounded-[2rem] bg-[linear-gradient(115deg,#fff1be_28%,#ee87cb_70%,#b060ff)] opacity-25 ring-1 ring-black/5 ring-inset" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="pt-28 pb-24 text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Commencer</p>
            <h2 className="mt-4 text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">
              Prêt à remplir votre agenda ?<br />Lancez-vous aujourd&apos;hui.
            </h2>
            <p className="mx-auto mt-6 max-w-sm text-sm/6 text-gray-500">
              Recevez vos prochains clients en ligne, sans passer vos journées au téléphone.
            </p>
            <a href={SIGNUP} className="mt-8 inline-block rounded-full bg-gray-950 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-gray-800">
              Démarrer maintenant
            </a>
          </div>
          <div className="grid grid-cols-2 gap-y-10 border-t border-black/5 py-12 lg:grid-cols-6">
            <div className="col-span-2">
              <p className="flex items-center gap-2 text-2xl font-medium tracking-tight text-gray-950"><img src="/logo-clotere.svg" alt="Clotere" className="h-7 w-auto" /><span className="text-gray-500">Avocat</span></p>
            </div>
            {[
              ["Produit", [["Fonctionnalités", "#leviers"], ["Offres", "#offres"], ["Réserver une démo", DEMO_LINK]]],
              ["Clotere", [["Notaires", "https://notaire.clotere.fr"], ["Experts-comptables", "https://comptable.clotere.fr"]]],
              ["Accès", [["Se connecter", "/login"], ["Inscription", SIGNUP]]],
              ["Légal", [["Mentions légales", "https://notaire.clotere.fr/mentions-legales"], ["Confidentialité", "https://notaire.clotere.fr/politique-confidentialite"]]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <h3 className="text-sm/6 font-medium text-gray-950/50">{title as string}</h3>
                <ul className="mt-6 space-y-4 text-sm/6">
                  {(links as string[][]).map(([l, h]) => (
                    <li key={l}><a href={h} className="font-medium text-gray-950 hover:text-gray-950/75">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-between gap-4 border-t border-black/5 py-8 text-sm/6 text-gray-950 sm:flex-row">
            <p>© 2026 Clotere SAS · Clotere n&apos;est pas un cabinet d&apos;avocats.</p>
            <a href="https://www.linkedin.com/company/clotere" aria-label="LinkedIn" className="text-gray-950 hover:text-gray-950/75">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
