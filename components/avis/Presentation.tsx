import { ActiverOption } from "@/components/options/ActiverOption";
import { OPTIONS } from "@/lib/options";

const DEMO = "https://calendar.app.google/k2btydyaoysdvgTx6";

function Coche() {
  return <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-950 text-[10px] text-white">✓</span>;
}

/** Page de vente de l'option Avis Google, affichée aux cabinets qui ne l'ont pas encore. */
export function AvisPresentation({ profession, cabinet, note, nbAvis }: {
  profession: "avocat" | "comptable"; cabinet?: string | null; note?: number | null; nbAvis?: number | null;
}) {
  const comptable = profession === "comptable";
  const nom = cabinet || (comptable ? "Votre cabinet" : "Votre cabinet d'avocats");
  const sig = comptable ? nom : "Maître Martin";
  const exemple = comptable
    ? { auteur: "Sophie L.", texte: "Très réactifs, ils m'ont aidée à créer ma société en quelques jours. Je recommande !" }
    : { auteur: "Thomas R.", texte: "Avocate à l'écoute, claire et disponible. J'ai été très bien accompagné du début à la fin." };

  return (
    <div className="space-y-16">
      {/* 1. Hero */}
      <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-black/5">
        <div className="bg-brand-gradient absolute inset-0" />
        <div className="relative grid grid-cols-1 gap-8 p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-950/60">Option Avis Google</p>
            <h1 className="mt-3 text-3xl font-medium tracking-tight text-gray-950 sm:text-[2.6rem]/[1.1]">
              Plus d&apos;avis Google, sans y penser. Et toujours la bonne réponse.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-gray-950/75">
              Après chaque dossier, vos clients reçoivent une demande d&apos;avis, puis une relance si besoin. Vous voyez tous vos avis au même endroit,
              avec une réponse déjà rédigée qui respecte le secret professionnel.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
              <a href={DEMO} target="_blank" rel="noopener noreferrer" className="rounded-full bg-gray-950 px-5 py-3 text-center text-sm font-medium text-white shadow-md hover:bg-gray-800">Réserver une démo</a>
              <ActiverOption option="avis" clair label={`Activer · ${OPTIONS.avis.prixMensuelHT} € HT / mois`} />
            </div>
            {note != null && nbAvis != null && (
              <p className="mt-5 text-sm text-gray-950/70">Aujourd&apos;hui : <strong className="text-gray-950">{String(note).replace(".", ",")} ★</strong> sur {nbAvis} avis Google.</p>
            )}
          </div>

          {/* Aperçu : un avis et sa réponse proposée */}
          <div className="rounded-2xl bg-white/85 p-5 shadow-lg ring-1 ring-black/5 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">{exemple.auteur[0]}</span>
              <div>
                <p className="text-sm font-semibold text-gray-950">{exemple.auteur}</p>
                <p className="text-xs text-amber-500">★★★★★ <span className="text-gray-400">· il y a 2 jours</span></p>
              </div>
              <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200">À répondre</span>
            </div>
            <p className="mt-3 text-sm text-gray-700">{exemple.texte}</p>
            <div className="mt-4 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Réponse proposée</p>
              <p className="mt-1.5 text-sm text-gray-800">Bonjour {exemple.auteur.split(" ")[0]}, merci beaucoup pour votre confiance et pour ce message. Nous restons à votre disposition. — {sig}</p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-medium text-white">Copier et répondre</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">Autre proposition</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ce qui est inclus */}
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">Ce qu&apos;on fait pour vous</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-medium tracking-tight text-gray-950">Votre réputation en ligne, gérée sans effort.</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ["Demandes d'avis automatiques", "Envoyées à vos clients quand vous clôturez un dossier, ou en un clic pour vos anciens clients. Le lien ouvre directement la fenêtre « Laisser un avis »."],
            ["Relances suivies", "Une relance après 4 jours, une seconde après 10 jours, puis on s'arrête. Vous voyez qui a été relancé et quand."],
            ["Tous vos avis au même endroit", "Note, nouveaux avis, avis sans réponse : vous êtes prévenu et rien ne passe à la trappe."],
            ["Des réponses déjà rédigées", "Une réponse courtoise proposée pour chaque avis, sans jamais évoquer le dossier : le secret professionnel est respecté."],
          ].map(([t, d]) => (
            <div key={t} className="relative overflow-hidden rounded-[1.5rem] p-6 ring-1 ring-black/5">
              <div className="bg-brand-gradient absolute inset-0 opacity-25" />
              <div className="relative flex gap-3">
                <Coche />
                <div>
                  <h3 className="font-medium text-gray-950">{t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Pourquoi */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ["Les avis font le classement", "Le nombre d'avis, leur fraîcheur et vos réponses comptent pour apparaître dans le trio de tête de Google Maps."],
          ["Les avis font la décision", "Entre deux cabinets proches, le futur client choisit celui qui a le plus d'avis récents et des réponses soignées."],
          ["Vos clients satisfaits oublient", "Sans demande ni relance, seule une petite partie de vos clients contents pense à laisser un avis."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-[1.5rem] bg-white p-6 ring-1 ring-black/5">
            <h3 className="font-medium text-gray-950">{t}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{d}</p>
          </div>
        ))}
      </div>

      {/* 4. Engagements + tarif */}
      <div className="grid grid-cols-1 gap-8 rounded-[2rem] bg-gray-50 p-6 ring-1 ring-black/5 sm:grid-cols-2 sm:p-8">
        <ul className="space-y-3 text-[15px] text-gray-700">
          {[
            "Conforme aux règles de Google : tous vos clients reçoivent le même lien, sans filtrage ni contrepartie",
            "Aucun détail du dossier dans les e-mails ni dans les réponses",
            "Vous gardez la main : vous publiez vous-même chaque réponse",
            "Sans engagement, inclus dans l'offre Visibilité",
          ].map((f) => <li key={f} className="flex gap-3"><Coche />{f}</li>)}
        </ul>
        <div className="flex flex-col justify-center">
          <p className="text-3xl font-medium tracking-tight text-gray-950">{OPTIONS.avis.prixMensuelHT} €<span className="text-base font-normal text-gray-500"> HT / mois</span></p>
          <p className="mt-1 text-sm text-gray-600">Par cabinet, quel que soit le nombre de demandes envoyées.</p>
          <div className="mt-5"><ActiverOption option="avis" label="Activer l'option Avis" className="rounded-full bg-gray-950 px-5 py-3 text-sm font-medium text-white shadow-md hover:bg-gray-800 disabled:opacity-50" /></div>
        </div>
      </div>
    </div>
  );
}
