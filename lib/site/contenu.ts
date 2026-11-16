import { PROFESSIONS, type Profession } from "@/lib/professions-config";
import type { Contenu, Formule, Taille } from "@/lib/site/types";

/* Textes types du site, pré-remplis à partir des infos du cabinet. Relus pour rester sobres et conformes
   aux règles déontologiques : pas de superlatif ni de comparaison, pas de promesse de résultat. */

type Entree = {
  profession: Profession; prenom: string; nom: string; cabinet: string; ville: string;
  taille: Taille; domaines: string[]; formule: Formule;
};

/** « Avocat en … » : formulation naturelle de chaque domaine. */
const SPECIALITE_AVOCAT: Record<string, string> = {
  famille: "droit de la famille", travail: "droit du travail", immobilier: "droit immobilier", societes: "droit des sociétés",
  contrats: "droit commercial", penal: "droit pénal", numerique: "droit du numérique", pi: "propriété intellectuelle",
  fiscal: "droit fiscal", successions: "droit des successions", consommation: "droit de la consommation", dommage: "dommage corporel",
};

const liste = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} et ${xs[xs.length - 1]}`);

export function contenuParDefaut(e: Entree): Contenu {
  const avocat = e.profession === "avocat";
  const conf = PROFESSIONS[e.profession];
  const seul = e.taille === "seul";
  const ville = e.ville || "votre ville";
  const cabinet = e.cabinet || (avocat ? "Le cabinet" : "Le cabinet");
  const doms = conf.domaines.filter((d) => e.domaines.includes(d.id));
  const domsAffiches = doms.length ? doms : conf.domaines.slice(0, 4);
  const labels = domsAffiches.map((d) => d.label.toLowerCase());
  const nous = seul ? { je: "je", Je: "Je", mon: "mon", Mon: "Mon", me: "me", vous: "je vous" } : { je: "nous", Je: "Nous", mon: "notre", Mon: "Notre", me: "nous", vous: "nous vous" };
  // Domaine principal = le premier choisi : il donne la requête visée (« Avocat en droit de la famille à Houilles »).
  const principal = conf.domaines.find((d) => d.id === e.domaines[0]) ?? null;
  const specialite = principal ? SPECIALITE_AVOCAT[principal.id] ?? principal.label.toLowerCase() : null;
  const titrePro = avocat ? `Maître ${e.prenom} ${e.nom}`.trim() : `${e.prenom} ${e.nom}`.trim();

  return {
    hero: {
      surtitre: avocat
        ? `${seul ? "Avocat" : "Cabinet d'avocats"}${specialite ? ` en ${specialite}` : ""} à ${ville}`
        : `${seul ? "Expert-comptable" : "Cabinet d'expertise comptable"} à ${ville}${principal ? ` · ${principal.label}` : ""}`,
      titre: avocat ? "Un accompagnement juridique clair, humain et disponible." : "Une expertise comptable proche de vous, réactive et claire.",
      accroche: avocat
        ? `${cabinet} conseille et défend particuliers et entreprises en ${liste(labels)}.`
        : `${cabinet} accompagne entrepreneurs, indépendants et particuliers : ${liste(labels)}.`,
    },
    apropos: {
      titre: seul ? titrePro : cabinet,
      texte: avocat
        ? `${seul ? `Avocat à ${ville}, j'accompagne mes clients` : `Installé à ${ville}, notre cabinet accompagne ses clients`} à chaque étape de leur dossier, avec une écoute attentive et une stratégie adaptée à leur situation.`
        : `${seul ? `Expert-comptable à ${ville}, j'accompagne mes clients` : `Installé à ${ville}, notre cabinet accompagne ses clients`} au quotidien : tenue comptable, déclarations, conseil et pilotage de leur activité.`,
      texte2: avocat
        ? `${nous.Mon} cabinet privilégie la transparence : honoraires présentés dès le premier échange, points d'étape réguliers et une réponse rapide à vos questions.`
        : `${nous.Je} ${seul ? "privilégie" : "privilégions"} la proximité et la clarté : un interlocuteur dédié, des échéances anticipées et des chiffres expliqués simplement.`,
      signature: seul ? `${titrePro} — ${avocat ? "Avocat" : "Expert-comptable"}` : `L'équipe ${cabinet}`,
    },
    domaines: {
      titre: avocat ? "Domaines d'intervention" : "Nos missions",
      intro: avocat ? "Un conseil sur mesure, en amont comme au contentieux." : "Un accompagnement adapté à chaque étape de votre activité.",
      items: domsAffiches.map((d) => ({ titre: d.label, texte: d.description })),
    },
    approche: {
      titre: seul ? "Mon approche" : "Notre approche",
      texte: avocat
        ? `Chaque situation est unique. ${nous.Je} ${seul ? "prends" : "prenons"} le temps de comprendre votre objectif avant de vous présenter les options possibles, leurs risques et leur coût.`
        : `${nous.Je} ${seul ? "construis" : "construisons"} avec vous une relation de confiance dans la durée : anticiper plutôt que subir, expliquer plutôt que produire des tableaux.`,
      points: avocat
        ? ["Écoute et disponibilité", "Stratégie expliquée simplement", "Honoraires annoncés à l'avance"]
        : ["Un interlocuteur dédié", "Des réponses sous 48 h", "Des outils en ligne simples"],
    },
    methode: {
      titre: "Comment se déroule votre accompagnement",
      etapes: avocat
        ? [
            { titre: "Premier échange", texte: "Nous faisons le point sur votre situation et vos objectifs." },
            { titre: "Analyse & stratégie", texte: "Les options possibles vous sont présentées, avec une convention d'honoraires." },
            { titre: "Mise en œuvre", texte: "Rédaction, négociation ou procédure : vous êtes tenu informé à chaque étape." },
            { titre: "Suivi", texte: "Un point à chaque étape importante, jusqu'à la clôture du dossier." },
          ]
        : [
            { titre: "Premier échange", texte: "Nous faisons le point sur votre activité et vos besoins." },
            { titre: "Proposition", texte: "Une offre claire et une lettre de mission adaptée à votre dossier." },
            { titre: "Mise en place", texte: "Reprise du dossier, accès aux outils et calendrier des échéances." },
            { titre: "Suivi", texte: "Des points réguliers pour piloter votre activité sereinement." },
          ],
    },
    honoraires: {
      titre: "Honoraires",
      texte: avocat
        ? "Les honoraires sont présentés dès le premier échange et formalisés dans une convention d'honoraires, établie avant le début de la mission."
        : "Les honoraires sont présentés dès le premier échange et précisés dans une lettre de mission adaptée à votre dossier.",
    },
    avis: { titre: "Ils nous ont fait confiance" },
    faq: {
      titre: "Questions fréquentes",
      items: avocat
        ? [
            { q: "Comment se déroule le premier rendez-vous ?", r: `Le premier rendez-vous permet de comprendre votre situation et vos objectifs. À l'issue de cet échange, ${nous.vous} ${seul ? "présente" : "présentons"} les options possibles et la suite à donner.` },
            { q: "Quels documents dois-je préparer ?", r: "Rassemblez les pièces utiles à votre dossier (contrats, courriers, jugements, échanges écrits). En cas de doute, apportez tout ce qui vous semble lié à votre situation." },
            { q: "Proposez-vous des rendez-vous en visio ?", r: "Oui, les rendez-vous peuvent avoir lieu au cabinet, en visio ou par téléphone, selon votre préférence." },
            { q: "Comment sont fixés les honoraires ?", r: "Les honoraires sont fixés en accord avec vous et formalisés dans une convention d'honoraires, établie avant le début de la mission." },
          ]
        : [
            { q: "Comment changer d'expert-comptable ?", r: `Vous pouvez changer d'expert-comptable à tout moment. ${nous.Je} ${seul ? "m'occupe" : "nous occupons"} des échanges avec votre ancien cabinet pour récupérer votre dossier.` },
            { q: "Combien coûte un expert-comptable ?", r: "Le tarif dépend de votre activité, du volume d'opérations et des missions confiées. Une proposition chiffrée vous est remise après le premier échange." },
            { q: "Travaillez-vous à distance ?", r: "Oui, l'essentiel des échanges peut se faire en ligne : dépôt des justificatifs, rendez-vous en visio, signature électronique." },
            { q: "Quels documents fournir pour démarrer ?", r: "Vos statuts, vos derniers bilans le cas échéant, vos relevés bancaires et l'accès à vos outils de facturation." },
          ],
    },
    actualites: { titre: "Actualités", items: [] },
    contact: {
      titre: e.formule === "rdv" ? "Prenons rendez-vous" : "Parlons de votre situation",
      texte: e.formule === "rdv"
        ? "Choisissez le motif, le format et le créneau qui vous conviennent. Vous recevez une confirmation par e-mail."
        : "Laissez-nous un message, nous vous répondons sous 48 h ouvrées.",
      horaires: "Du lundi au vendredi, 9h – 19h",
    },
    credits: { couverture: "", couvertureLien: "" },
    chiffres: [
      { valeur: "48 h", label: "pour vous répondre" },
      { valeur: "Visio", label: "ou au cabinet" },
      { valeur: String(domsAffiches.length), label: avocat ? "domaines d'intervention" : "missions proposées" },
    ],
  };
}

/** Complète un contenu enregistré avec les valeurs par défaut (champs ajoutés après coup). */
export function fusionContenu(base: Contenu, enregistre: Partial<Contenu> | null | undefined): Contenu {
  const c = enregistre ?? {};
  const out = { ...base } as Record<string, unknown>;
  for (const k of Object.keys(base) as (keyof Contenu)[]) {
    const v = c[k];
    if (v === undefined || v === null) continue;
    out[k] = Array.isArray(base[k]) ? v : { ...(base[k] as object), ...(v as object) };
  }
  return out as Contenu;
}
