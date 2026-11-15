import { redirect } from "next/navigation";
import { cabinetConnecte } from "@/lib/visibilite-serveur";
import { EnTetePage } from "@/components/dashboard/EnTetePage";
import { RappelAds } from "./RappelAds";

export const metadata = { title: "Google Ads" };

const DEMO = "https://calendar.app.google/k2btydyaoysdvgTx6";
const POURCENTAGE = 10;

function Coche() {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3"><path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export default async function GoogleAdsPage() {
  const ctx = await cabinetConnecte();
  if (!ctx) redirect("/login?next=/dashboard/google-ads");
  const { cab, pro } = ctx;
  const avocat = pro.profession !== "comptable";
  const ville = cab.ville || "votre ville";

  if (cab.offre_ads) {
    return (
      <div>
        <EnTetePage section="Google Ads" titre="Vos campagnes Google Ads" cta={<a href={DEMO} target="_blank" rel="noopener noreferrer" className="btn-solid">Faire un point avec nous</a>} />
        <div className="card mt-8 p-8 text-[15px] text-gray-700">
          Vos campagnes sont gérées par l&apos;équipe Clotere. Vous recevez chaque mois le bilan : budget dépensé, clics et rendez-vous générés.
        </div>
      </div>
    );
  }

  const etapes = [
    { t: "On cible ce qui vous rapporte", d: `Vos domaines, ${ville} et ses environs, les requêtes de clients prêts à prendre rendez-vous.` },
    { t: "Vous validez les annonces", d: avocat ? "Chaque annonce est relue et validée par vous, dans le respect des règles de la profession." : "Chaque annonce est relue et validée par vous avant diffusion." },
    { t: "Les visiteurs prennent rendez-vous", d: "Les annonces renvoient vers votre site ou votre prise de rendez-vous, avec vos motifs." },
    { t: "On optimise chaque mois", d: "Mots-clés, enchères, annonces : on coupe ce qui ne convertit pas, on renforce ce qui marche." },
  ];

  return (
    <div>
      <EnTetePage section="Google Ads" titre="Des demandes de clients dès les premières semaines"
        cta={<a href={DEMO} target="_blank" rel="noopener noreferrer" className="btn-solid">Réserver une démo</a>} />
      <p className="mt-3 max-w-2xl text-[15px] text-gray-600">
        Nous créons et pilotons vos campagnes Google Ads sur {ville} et vos domaines d&apos;intervention. Vos futurs clients vous trouvent au moment où ils cherchent {avocat ? "un avocat" : "un expert-comptable"}, et prennent rendez-vous directement.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-8">
          <p className="eyebrow">Comment ça marche</p>
          <ol className="mt-6 space-y-6">
            {etapes.map((e, i) => (
              <li key={e.t} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">{i + 1}</span>
                <div><p className="font-medium text-gray-950">{e.t}</p><p className="mt-1 text-sm text-gray-600">{e.d}</p></div>
              </li>
            ))}
          </ol>
          <ul className="mt-8 space-y-3 border-t border-gray-100 pt-6 text-sm text-gray-700">
            {["Campagnes en ligne en quelques jours", "Le budget publicitaire est payé directement à Google, sur votre compte", "Bilan mensuel : budget dépensé, clics, demandes et rendez-vous", "Sans engagement"].map((x) => <li key={x} className="flex gap-3"><Coche />{x}</li>)}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <p className="text-sm text-gray-500">Notre rémunération</p>
            <p className="mt-1 text-4xl font-medium tracking-tight text-gray-950">{POURCENTAGE} %</p>
            <p className="mt-1 text-sm text-gray-600">du budget publicitaire dépensé chaque mois. Pas de frais fixes : vous choisissez votre budget, nous sommes payés sur ce qui est réellement diffusé.</p>
            <p className="mt-3 text-xs text-gray-500">Exemple : 1 000 € dépensés sur Google → 100 € HT pour Clotere.</p>
            <a href={DEMO} target="_blank" rel="noopener noreferrer" className="btn-solid mt-5 w-full">Réserver une démo</a>
          </div>
          <div className="card p-6">
            <p className="mb-4 text-sm font-medium text-gray-950">Ou laissez-nous vous rappeler</p>
            <RappelAds telephone={cab.telephone ?? null} dejaDemande={!!cab.ads_demande_at} />
          </div>
        </div>
      </div>
    </div>
  );
}
