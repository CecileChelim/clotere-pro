import type { Metadata } from "next";
import { BookingAnimation } from "@/components/avocat/BookingAnimation";
import { AiReplyDemo } from "@/components/avocat/AiReplyDemo";
import { createClient } from "@/lib/supabase/server";

const DEMO_LINK = "https://calendar.app.google/k2btydyaoysdvgTx6";
const SIGNUP = "/signup";

export const metadata: Metadata = {
  title: { absolute: "Clotere Expert-comptable — Visibilité et prise de rendez-vous pour experts-comptables" },
  alternates: { canonical: "https://comptable.clotere.fr" },
};

function Check({ className = "h-5 w-5 text-[#146c43]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`flex-none ${className}`} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.81a.75.75 0 0 0-1.22-.88l-3.24 4.48-1.6-1.6a.75.75 0 1 0-1.06 1.06l2.22 2.22a.75.75 0 0 0 1.14-.09l3.76-5.19Z" clipRule="evenodd" />
    </svg>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="text-[#146c43]">{children}</span>;
}
function Coche() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dcefa0] text-[#0e4f31]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3"><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}


type Cellule = boolean | string;
const COLONNES = ["Éditeur de site classique", "Freelance dédié", "Agence marketing", "Clotere"];
const COMPARATIF: [string, Cellule, Cellule, Cellule, Cellule][] = [
  ["Spécialiste des cabinets d'expertise comptable", false, "Rarement", false, true],
  ["Règles de communication de l'Ordre maîtrisées", false, false, false, true],
  ["Prise de rendez-vous qualifiée, questionnaire par mission", false, false, false, true],
  ["Synchronisation Google Calendar et Outlook", false, false, false, true],
  ["Référencement local : votre ville, vos spécialités", false, true, true, true],
  ["Fiche Google optimisée et avis après chaque rendez-vous", false, "Parfois", true, true],
  ["Accompagnement certifié Google Partners", false, false, "Parfois", true],
  ["Données hébergées en Europe, secret professionnel respecté", "Variable", "Variable", "Variable", true],
  ["En ligne en une journée, sans y passer vos soirées", false, false, false, true],
  ["Sans engagement", true, false, false, true],
];
const COUT = ["15–40 € + votre temps", "≈ 500 €/mois", "1 000 €/mois et plus", "Forfait fixe"];

function Cell({ v, clotere }: { v: Cellule; clotere?: boolean }) {
  if (v === true)
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={`mx-auto h-5 w-5 ${clotere ? "text-[#146c43]" : "text-[#4a8a63]"}`} aria-label="Oui"><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (v === false)
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mx-auto h-5 w-5 text-gray-400" aria-label="Non"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>;
  return <span className="text-sm text-gray-500">{v}</span>;
}

const integrations = ["Site web", "Fiche Google", "LinkedIn", "Signature mail", "WhatsApp"];

const pillars = [
  {
    tag: "Prise de RDV",
    title: "Vos futurs clients réservent 24/7, même le dimanche soir.",
    points: [
      "Un bouton sur votre site, Google, LinkedIn et votre signature",
      "Questionnaire adapté à vos missions",
      "Synchronisé avec Google Calendar et Outlook",
    ],
  },
  {
    tag: "Réponses prêtes",
    title: "Chaque prospect reçoit une réponse claire, sans y passer du temps.",
    points: [
      "Vous savez qui vient, et pour quelle mission, avant le premier échange",
      "Un message type adapté à la mission, prêt à envoyer en un clic",
      "Rappels automatiques et espace client sécurisé",
    ],
  },
  {
    tag: "SEO",
    title: "Devenez le cabinet qu'on trouve en premier.",
    points: [
      "Stratégie de positionnement : votre ville, vos spécialités",
      "Articles publiés chaque mois et fiche Google optimisée",
      "Avis Google récoltés après chaque rendez-vous",
    ],
  },
];

export default async function ComptableLanding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pro } = user ? await (supabase as any).from("professionals").select("prenom, nom").eq("auth_user_id", user.id).maybeSingle() : { data: null };
  const initiales = pro ? `${pro.prenom?.[0] ?? ""}${pro.nom?.[0] ?? ""}`.toUpperCase() : (user?.email?.[0] ?? "").toUpperCase();

  return (
    <div className="bg-white text-gray-950 antialiased">
      {/* Header + Hero (style Radiant) */}
      <div className="relative">
        <div className="absolute inset-2 bottom-0 rounded-[2rem] bg-[linear-gradient(115deg,#fbf7e8_28%,#dcefa0_62%,#6fbf8f)] ring-1 ring-black/5 ring-inset sm:bg-[linear-gradient(145deg,#fbf7e8_28%,#dcefa0_62%,#6fbf8f)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          <header className="flex items-center justify-between pt-12">
            <a href="/" className="flex items-center gap-2 text-gray-950" aria-label="Clotere Expert-comptable">
              <span className="whitespace-nowrap text-base font-bold tracking-tight sm:text-lg">Clotere <span className="font-medium">Expert-comptable</span></span>
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
            <p className="mb-6 font-mono text-xs font-semibold uppercase tracking-widest text-gray-950/60">Visibilité et prise de rendez-vous pour experts-comptables</p>
            <h1 className="max-w-3xl text-balance text-[2.15rem]/[1.05] font-medium tracking-tight text-gray-950 sm:text-6xl/[0.95]">
              Devenez <span className="whitespace-nowrap">l&apos;expert-comptable</span> qu&apos;on trouve.
            </h1>
            <p className="mt-8 max-w-xl text-pretty text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
              Chaque mois, 50 000 personnes tapent « expert-comptable » sur Google. On fait en sorte qu&apos;elles vous trouvent, qu&apos;elles comprennent vite pourquoi vous, et on les transforme en rendez-vous qualifiés.
            </p>
            <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
              <a href={DEMO_LINK} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gray-950 px-6 py-3 text-center text-base font-medium text-white shadow-md hover:bg-gray-800">
                Réserver une démo
              </a>
              <a href={SIGNUP} className="rounded-full bg-white/15 px-6 py-3 text-center text-base font-medium text-gray-950 shadow-md ring-1 ring-black/15 hover:bg-white/20">
                Créer mon compte
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-950/70">Données chiffrées en Europe · Sans engagement · Mise en place en une journée</p>
            </div>
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <BookingAnimation initiales="CM" nom="Claire Martin" sousTitre="Cabinet Martin Expertise · Lyon 6e"
                motifs={["Création d'entreprise", "Changer d'expert-comptable", "Bilan & comptabilité", "Fiscalité"]}
                situation="Je lance une SASU de conseil en janvier et je cherche un expert-comptable…"
                confirmation="Bonjour, Claire Martin vous recevra mardi. Pour gagner du temps, préparez votre projet en quelques lignes et votre pièce d'identité." />
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
            ["Top 5", "objectif sur votre ville ou votre spécialité"],
          ].map(([n, l]) => (
            <div key={n}>
              <p className="bg-[linear-gradient(115deg,#0e4f31,#146c43,#4e9e72)] bg-clip-text text-5xl font-medium tracking-tight text-transparent">{n}</p>
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
            ["On configure vos missions", "Création, reprise de dossier, bilan, social : vos motifs et durées, on le fait avec vous."],
            ["Vous collez le bouton", "Sur votre site, votre fiche Google, LinkedIn, votre signature mail. 5 minutes."],
            ["Vous recevez des rdv qualifiés", "Vous savez qui vient et pour quelle mission. Vous validez en un clic."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-[2rem] bg-white p-8 shadow-md ring-1 ring-black/5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">{i + 1}</span>
              <h3 className="mt-5 text-xl font-medium text-gray-950">{t}</h3>
              <p className="mt-2 text-sm text-gray-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* L'offre */}
      <section id="leviers" className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-block rounded-full bg-[#e3efe7] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#0e4f31]">L&apos;offre</span>
            <h2 className="mt-4 max-w-2xl text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">
              Une <Mark>visibilité sans faille</Mark> pour capter des clients
            </h2>
          </div>
          <p className="max-w-sm text-[15px] text-gray-600">Trois briques complémentaires pour attirer des visiteurs et les transformer en clients.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Site internet & référencement */}
          <article className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-black/5">
            <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-[#e3efe7] to-[#d6e6db]">
              <div className="w-4/5 -rotate-2 rounded-2xl bg-white p-4 shadow-lg">
                <div className="h-2 w-3/4 rounded-full bg-gray-100" /><div className="mt-2 h-2 w-1/2 rounded-full bg-gray-100" />
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#e3efe7] px-3 py-2"><span className="h-2 w-2 rounded-full bg-[#146c43]" /><span className="h-1.5 w-1/3 rounded-full bg-white/80" /></div>
              </div>
              <span className="absolute right-6 bottom-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#146c43] text-white shadow-md ring-4 ring-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" /></svg>
              </span>
            </div>
            <div className="p-7">
              <h3 className="text-xl font-medium text-gray-950">Site internet &amp; référencement</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">Un site sobre et rapide, hébergé chez nous sur votre sous-domaine dédié, optimisé pour apparaître dans les recherches de votre ville.</p>
            </div>
          </article>

          {/* Prise de rendez-vous */}
          <article className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-black/5">
            <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-[#f3ecdf] to-[#eef1ec]">
              <div className="grid w-4/5 rotate-1 grid-cols-6 gap-1.5 rounded-2xl bg-white p-3 shadow-lg">
                {Array.from({ length: 18 }).map((_, i) => <span key={i} className={`h-7 rounded-md ${i === 7 ? "bg-[#146c43]" : "bg-gray-100"}`} />)}
              </div>
              <span className="absolute right-6 bottom-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#b08a4e] text-white shadow-md ring-4 ring-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5"><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
            <div className="p-7">
              <h3 className="text-xl font-medium text-gray-950">Prise de rendez-vous en ligne</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">Connectée à votre agenda et poussée sur votre site, LinkedIn et votre fiche Google Business, pour ne rater aucune demande.</p>
            </div>
          </article>

          {/* Contenu optimisé */}
          <article className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-black/5">
            <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-[#eef1ec] to-[#e3efe7]">
              <div className="absolute top-12 right-8 h-20 w-3/5 rotate-3 rounded-2xl bg-white/80 shadow" />
              <div className="relative w-3/4 -rotate-2 rounded-2xl bg-white p-4 shadow-lg">
                <span className="rounded-full bg-[#e3efe7] px-2 py-0.5 text-[10px] font-bold text-[#0e4f31]">SEO</span>
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100" /><div className="mt-2 h-1.5 w-4/5 rounded-full bg-gray-100" /><div className="mt-2 h-1.5 w-2/3 rounded-full bg-gray-100" />
              </div>
              <span className="absolute right-6 bottom-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#146c43] text-white shadow-md ring-4 ring-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><path d="M15.2 5.2l3.6 3.6M4 20l4.2-1 10.6-10.6-3.2-3.2L5 15.8 4 20z" strokeLinejoin="round" /></svg>
              </span>
            </div>
            <div className="p-7">
              <h3 className="text-xl font-medium text-gray-950">Contenu optimisé</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">Des articles publiés chaque mois, ciblés sur votre métier et votre zone de chalandise, pour nourrir votre référencement dans la durée.</p>
            </div>
          </article>
        </div>
      </section>

      {/* Exemple de réponse */}
      <section className="bg-gray-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-white/50">Réponses prêtes à envoyer</p>
            <h2 className="mt-2 text-4xl font-medium tracking-tight sm:text-5xl">Chaque prospect reçoit une réponse. Vous, vous restez sur vos dossiers.</h2>
          </div>
          <AiReplyDemo
            demande="Bonjour, je crée une SASU de conseil en janvier et je cherche un expert-comptable. Pouvez-vous m'accompagner dès l'immatriculation ?"
            TAGS={["Création d'entreprise", "SASU", "Démarrage : janvier"]}
            REPLY="Bonjour, je vous confirme notre rendez-vous de mardi à 10h en visio. Pour le préparer, merci de rassembler votre projet en quelques lignes (activité, associés, chiffre d'affaires prévu) et votre pièce d'identité. Nous ferons ensemble le point sur le choix du statut et les premières démarches."
            note="Vous gardez la main : message type préparé selon la mission, que vous relisez avant l'envoi." />
        </div>
      </section>

      {/* Tarif */}
      <section id="offres" className="mx-auto max-w-6xl px-6 py-24">
        <span className="inline-block rounded-full bg-[#e3efe7] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#0e4f31]">Tarif</span>
        <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">
          Deux formules pour <Mark>remplir votre agenda</Mark> de bons rendez-vous
        </h2>
        <p className="mt-4 max-w-xl text-[15px] text-gray-600">Un forfait mensuel, sans frais cachés. Le tarif est adapté à votre ville et à vos spécialités : on vous le présente pendant la démo.</p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col rounded-[2rem] bg-white p-8 ring-1 ring-black/5 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#146c43]">Essentiel</p>
            <h3 className="mt-2 text-2xl font-medium text-gray-950">Recevez des rendez-vous qualifiés</h3>
            <ul className="mt-6 space-y-3 text-[15px] text-gray-700">
              {["Prise de rendez-vous qualifiée sur votre site, votre fiche Google, LinkedIn et votre signature mail", "Questionnaire adapté à vos missions", "Rappels automatiques et espace client sécurisé", "Demande d'avis Google envoyée après chaque rendez-vous"].map((f) => (
                <li key={f} className="flex gap-3"><Coche />{f}</li>
              ))}
            </ul>
            <a href={DEMO_LINK} target="_blank" rel="noopener noreferrer" className="mt-10 rounded-full bg-gray-950 px-6 py-4 text-center text-[15px] font-semibold text-white hover:bg-gray-800 lg:mt-auto">Réserver ma démo</a>
          </div>

          <div className="relative flex flex-col rounded-[2rem] bg-white p-8 ring-2 ring-[#146c43] sm:p-10">
            <span className="absolute -top-3 left-10 rounded-full bg-[#146c43] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Recommandé</span>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#146c43]">Croissance</p>
            <h3 className="mt-2 text-2xl font-medium text-gray-950">Devenez le cabinet qu&apos;on trouve en premier</h3>
            <p className="mt-6 text-[15px] font-semibold text-gray-950">Tout Essentiel, plus :</p>
            <ul className="mt-3 space-y-3 text-[15px] text-gray-700">
              {["Stratégie de positionnement : votre ville, vos spécialités", "Landing pages dédiées à vos spécialités", "Optimisation SEO technique", "Articles publiés chaque mois", "Reporting trimestriel", "Objectif : top 5 dans votre ville ou sur votre spécialité"].map((f) => (
                <li key={f} className="flex gap-3"><Coche />{f}</li>
              ))}
            </ul>
            <a href={DEMO_LINK} target="_blank" rel="noopener noreferrer" className="mt-10 rounded-full bg-[#146c43] px-6 py-4 text-center text-[15px] font-semibold text-white hover:bg-[#0e4f31]">Réserver ma démo</a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 rounded-[2rem] bg-[#f1f4f1] p-8 ring-1 ring-black/5 sm:grid-cols-[180px_1fr] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#146c43]">En option</p>
          <div>
            <h3 className="text-lg font-semibold text-gray-950">Votre site internet</h3>
            <p className="mt-1 max-w-2xl text-[15px] text-gray-600">Pas encore de site, ou un site à refaire ? Nous créons un site pensé pour un cabinet d&apos;expertise comptable, hébergé en France et maintenu par nos soins.</p>
          </div>
        </div>
      </section>

      {/* Comparatif */}
      <section id="comparatif" className="mx-auto max-w-6xl px-6 pb-24">
        <span className="inline-block rounded-full bg-[#e3efe7] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#0e4f31]">Comparatif</span>
        <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">
          Pourquoi pas un éditeur de site, un freelance ou une <span className="text-[#146c43]">agence</span> ?
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] text-gray-600">Eux font des sites. Nous, on fait venir des clients chez les experts-comptables, et seulement chez eux.</p>
        <div className="mt-12 overflow-x-auto rounded-[2rem] ring-1 ring-black/10">
          <table className="w-full min-w-[820px] border-collapse text-left text-[15px]">
            <thead>
              <tr>
                <th className="w-[34%] bg-white p-5" />
                {COLONNES.map((c, i) => (
                  <th key={c} className={`p-5 text-center font-medium ${i === 3 ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-950"}`}>
                    {i === 3 ? <img src="/logo-clotere.svg" alt="Clotere" className="mx-auto h-5 w-auto invert" /> : c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARATIF.map(([label, ...vals], r) => (
                <tr key={label} className={`border-t border-black/5 ${r % 2 ? "bg-gray-50/60" : "bg-white"}`}>
                  <td className="p-5 text-gray-700">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`p-5 text-center ${i === 3 ? "bg-[#eef6f1]" : ""}`}><Cell v={v} clotere={i === 3} /></td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-black/10 bg-white">
                <td className="p-5 font-semibold text-gray-950">Coût mensuel</td>
                {COUT.map((c, i) => (
                  <td key={c} className={`p-5 text-center ${i === 3 ? "bg-[#eef6f1] font-semibold text-gray-950" : "text-gray-500"}`}>{c}</td>
                ))}
              </tr>
            </tbody>
          </table>
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
            <div key={t} className="rounded-2xl bg-gradient-to-br from-[#fbf7e8]/40 to-[#6fbf8f]/20 p-6">
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
            ["Est-ce conforme à la déontologie ?", "Oui : la prise de rendez-vous et le référencement respectent les règles de communication de la profession d'expert-comptable."],
            ["Je n'ai pas de site, vous pouvez le créer ?", "Oui : nous créons un site pensé pour un cabinet d'expertise comptable, hébergé en France et maintenu par nos soins."],
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
        <div className="absolute inset-2 rounded-[2rem] bg-[linear-gradient(115deg,#fbf7e8_28%,#dcefa0_62%,#6fbf8f)] opacity-25 ring-1 ring-black/5 ring-inset" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="pt-28 pb-24 text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Commencer</p>
            <h2 className="mt-4 text-4xl font-medium tracking-tight text-gray-950 sm:text-5xl">
              Prêt à recevoir plus de rendez-vous ?<br />Lancez-vous aujourd&apos;hui.
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
              <p className="flex items-center gap-2 text-2xl font-medium tracking-tight text-gray-950"><img src="/logo-clotere.svg" alt="Clotere" className="h-7 w-auto" /><span className="text-gray-500">Expert-comptable</span></p>
            </div>
            {[
              ["Produit", [["Fonctionnalités", "#leviers"], ["Offres", "#offres"], ["Réserver une démo", DEMO_LINK]]],
              ["Clotere", [["Notaires", "https://notaire.clotere.fr"], ["Avocats", "https://avocat.clotere.fr"]]],
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
            <p>© 2026 Clotere SAS · Clotere n&apos;est pas un cabinet d&apos;expertise comptable.</p>
            <a href="https://www.linkedin.com/company/clotere" aria-label="LinkedIn" className="text-gray-950 hover:text-gray-950/75">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
