import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { professionFromHost } from "@/lib/professions-config";

/* CGV professionnels (avocats et experts-comptables) — avocat.clotere.fr/cgv et comptable.clotere.fr/cgv.
   Règle : aucun montant de l'apport d'affaires n'apparaît ici. Le prix unitaire est présenté dans l'espace pro
   et accepté à l'activation (cabinets.leads_cgv_at), et communiqué sur demande (art. L441-1 du Code de commerce). */

export const VERSION_CGV = "26 novembre 2026";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Conditions générales de vente des services Clotere pour les professionnels.",
  robots: { index: false, follow: true },
};

type Bloc = { titre: string; paragraphes: string[] };

function articles(avocat: boolean): Bloc[] {
  const pro = avocat ? "avocat" : "expert-comptable";
  const domaines = avocat ? "domaines d’intervention" : "missions";
  return [
    {
      titre: "1. Objet et champ d’application",
      paragraphes: [
        `Les présentes conditions générales de vente (les « CGV ») régissent les relations entre la société Clotere SAS, au capital de 1 000 €, immatriculée sous le numéro SIREN 939 108 692, dont le siège social est situé 25 rue de Ponthieu, 75008 Paris (« Clotere »), et tout ${pro} qui crée un compte sur la plateforme Clotere (le « Professionnel »).`,
        "Elles s’appliquent à l’ensemble des services proposés au Professionnel : page professionnelle, abonnements et option d’apport d’affaires. Elles sont acceptées lors de la création du compte et, pour les options payantes, lors de leur activation dans l’espace professionnel. Elles prévalent sur tout autre document du Professionnel.",
        "Les services sont réservés aux professionnels agissant pour les besoins de leur activité. Les relations entre Clotere et le Professionnel relèvent du droit commercial.",
      ],
    },
    {
      titre: "2. Définitions",
      paragraphes: [
        "« Plateforme » : les sites clotere.fr, avocat.clotere.fr, comptable.clotere.fr et l’espace professionnel associé. « Espace professionnel » : l’interface réservée au Professionnel après connexion.",
        "« Page » : la page de présentation du Professionnel publiée sur clotere.fr. « Client » : toute personne qui sollicite un rendez-vous auprès du Professionnel via la Plateforme.",
        "« Rendez-vous reçu » : une demande de rendez-vous adressée au Professionnel depuis sa Page sur clotere.fr, dans le cadre de l’option d’apport d’affaires.",
      ],
    },
    {
      titre: "3. Services",
      paragraphes: [
        `Page professionnelle : le Professionnel crée gratuitement sa Page (présentation, photo, ${domaines}, coordonnées, motifs de rendez-vous et disponibilités). La création et la publication de la Page sont gratuites et sans durée minimale.`,
        "Abonnements : site internet, outil de prise de rendez-vous, référencement, gestion des avis, Google Ads. Leur contenu est décrit sur les pages de présentation de la Plateforme et dans l’Espace professionnel.",
        `Option d’apport d’affaires : Clotere assure la diffusion et le référencement de la Page, la prise de rendez-vous en ligne, la qualification des demandes (choix du motif, du format, questionnaire adapté aux ${domaines} du Professionnel, filtrage des demandes hors sujet) et la transmission au Professionnel d’une demande structurée. Clotere ne garantit aucun volume de demandes.`,
      ],
    },
    {
      titre: "4. Compte",
      paragraphes: [
        `Le Professionnel garantit l’exactitude des informations fournies et déclare être régulièrement inscrit ${avocat ? "à un barreau français" : "au tableau de l’Ordre des experts-comptables"}. Il est responsable de la confidentialité de ses identifiants.`,
        "Le titulaire du compte cabinet peut inviter d’autres professionnels du cabinet. Seul le titulaire peut souscrire ou activer une option payante.",
      ],
    },
    {
      titre: "5. Prix",
      paragraphes: [
        "La création et la publication de la Page sont gratuites.",
        "Les prix des abonnements sont indiqués hors taxes sur les pages de présentation de la Plateforme et dans l’Espace professionnel au moment de la souscription.",
        "L’option d’apport d’affaires est facturée selon un prix unitaire hors taxes par Rendez-vous reçu, fixé par la grille tarifaire en vigueur. Ce prix est présenté au Professionnel dans son Espace professionnel et expressément accepté par lui lors de l’activation de l’option, avant tout enregistrement de moyen de paiement.",
        "Le prix unitaire est forfaitaire : il est identique quelle que soit la suite donnée à la demande et ne dépend en aucun cas des honoraires perçus par le Professionnel, de la conclusion d’un mandat ou de l’issue du dossier.",
        "La grille tarifaire est communiquée à tout professionnel qui en fait la demande à contact@clotere.fr. Toute modification du prix unitaire est notifiée au Professionnel au moins trente (30) jours avant son entrée en vigueur ; le Professionnel peut alors désactiver l’option sans frais.",
      ],
    },
    {
      titre: "6. Fonctionnement de l’option d’apport d’affaires",
      paragraphes: [
        "Activation : le Professionnel active l’option depuis son Espace professionnel en enregistrant une carte bancaire auprès du prestataire de paiement Stripe. Aucun débit n’a lieu à l’activation. Il peut fixer un plafond mensuel de Rendez-vous reçus ; une fois le plafond atteint, la prise de rendez-vous est suspendue sur sa Page jusqu’au mois suivant. Il peut modifier le plafond ou mettre l’option en pause à tout moment.",
        `Rendez-vous non facturés : n’est pas facturé un Rendez-vous reçu (i) annulé par le Client, (ii) émanant d’un Client ayant déjà sollicité le cabinet via la Plateforme dans les trente (30) jours précédents, ou (iii) contesté par le Professionnel depuis son Espace professionnel au plus tard quarante-huit (48) heures après le créneau réservé, pour l’un des motifs suivants : Client absent, demande ne relevant pas de ses ${domaines}, doublon, fausse demande ou coordonnées invalides, ou autre motif dûment précisé. Clotere peut vérifier le bien-fondé des contestations et suspendre l’option en cas d’abus.`,
        "Les demandes provenant du site internet du Professionnel, de sa fiche Google, de ses réseaux sociaux ou de tout autre canal que sa Page sur clotere.fr ne sont jamais facturées à l’unité.",
        "Facturation : les Rendez-vous reçus devenus facturables sont regroupés sur une facture mensuelle, prélevée sur la carte enregistrée. En cas d’échec de paiement, Clotere peut suspendre l’option jusqu’à régularisation. Tout retard de paiement entraîne de plein droit des pénalités au taux d’intérêt appliqué par la Banque centrale européenne majoré de dix points et une indemnité forfaitaire pour frais de recouvrement de 40 € (article L441-10 du Code de commerce).",
      ],
    },
    {
      titre: "7. Règles professionnelles",
      paragraphes: avocat
        ? [
            "Les sommes versées par le Professionnel constituent une participation forfaitaire aux frais de fonctionnement de la Plateforme au sens de l’article 19.4.2 du Règlement intérieur national de la profession d’avocat, à l’exclusion de toute rémunération établie en fonction des honoraires que l’avocat perçoit des Clients avec lesquels la Plateforme l’a mis en relation.",
            "Clotere ne perçoit, n’encaisse ni ne reverse aucun honoraire : le Client règle directement ses honoraires au Professionnel, après signature de la convention d’honoraires prévue par l’article 10 de la loi n° 71-1130 du 31 décembre 1971. Clotere ne délivre aucune consultation juridique et n’intervient pas dans la relation entre le Professionnel et son Client.",
            "Le Professionnel demeure seul responsable du respect de ses obligations déontologiques, notamment en matière de communication, de secret professionnel et de conflits d’intérêts.",
          ]
        : [
            "Les sommes versées par le Professionnel rémunèrent une prestation effective de Clotere (diffusion de la Page, outil de prise de rendez-vous, qualification et transmission des demandes), au sens de l’article 162 du décret n° 2012-432 du 30 mars 2012. Elles sont fixées à l’unité et ne dépendent en aucun cas des honoraires du Professionnel ni des missions qui lui sont confiées.",
            "Clotere n’exerce aucune activité d’expertise comptable, ne perçoit ni ne reverse aucun honoraire et n’intervient pas dans la relation entre le Professionnel et son Client, qui règle directement le Professionnel selon la lettre de mission conclue entre eux.",
            "Le Professionnel demeure seul responsable du respect de ses obligations déontologiques, notamment en matière de communication, d’indépendance et de secret professionnel.",
          ],
    },
    {
      titre: "8. Obligations du Professionnel",
      paragraphes: [
        "Le Professionnel tient à jour ses informations, ses motifs de rendez-vous et ses disponibilités, répond aux demandes dans un délai raisonnable et honore les rendez-vous confirmés. Il s’interdit de publier des contenus inexacts, trompeurs ou contraires à ses règles professionnelles.",
      ],
    },
    {
      titre: "9. Classement et affichage",
      paragraphes: [
        "Les critères de référencement et de classement des Pages sur clotere.fr sont présentés aux utilisateurs conformément à l’article L111-7 du Code de la consommation. Clotere se réserve le droit de refuser ou de retirer une Page non conforme aux présentes CGV.",
      ],
    },
    {
      titre: "10. Données personnelles",
      paragraphes: [
        "Les données des Clients sont collectées par Clotere pour permettre la prise de rendez-vous et transmises au Professionnel, qui en devient responsable pour les besoins de sa relation avec le Client. Elles sont hébergées en France et chiffrées. Le détail des traitements figure dans la politique de confidentialité de la Plateforme.",
      ],
    },
    {
      titre: "11. Durée et résiliation",
      paragraphes: [
        "La Page est publiée sans durée minimale ; le Professionnel peut la supprimer à tout moment en en faisant la demande. L’option d’apport d’affaires peut être désactivée à tout moment depuis l’Espace professionnel ; les Rendez-vous reçus avant la désactivation restent facturables dans les conditions de l’article 6. Les abonnements sont sans engagement et prennent fin à l’issue de la période en cours.",
        "En cas de manquement grave du Professionnel aux présentes CGV ou à ses règles professionnelles, Clotere peut suspendre ou fermer son compte après mise en demeure restée sans effet pendant huit (8) jours, ou sans délai en cas d’urgence.",
      ],
    },
    {
      titre: "12. Responsabilité",
      paragraphes: [
        "Clotere est tenue d’une obligation de moyens. Elle ne garantit ni le nombre de demandes reçues, ni leur conversion en dossiers. Sa responsabilité, toutes causes confondues, est limitée aux sommes versées par le Professionnel au cours des douze (12) mois précédant le fait générateur.",
      ],
    },
    {
      titre: "13. Modification des CGV",
      paragraphes: [
        "Clotere peut modifier les présentes CGV. Le Professionnel en est informé par e-mail ou dans son Espace professionnel au moins trente (30) jours avant leur entrée en vigueur ; à défaut d’opposition, notamment par désactivation des options concernées, les nouvelles CGV s’appliquent.",
      ],
    },
    {
      titre: "14. Droit applicable et litiges",
      paragraphes: [
        "Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, tout litige relève de la compétence exclusive des tribunaux de Paris.",
      ],
    },
  ];
}

export default async function CgvPage() {
  const avocat = professionFromHost((await headers()).get("host")) === "avocat";
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-gray-800">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-950">← Clotere {avocat ? "Avocat" : "Expert-comptable"}</Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-gray-950">Conditions générales de vente</h1>
      <p className="mt-2 text-sm text-gray-500">Professionnels {avocat ? "avocats" : "experts-comptables"} · Version du {VERSION_CGV}</p>
      <div className="mt-10 space-y-8">
        {articles(avocat).map((a) => (
          <section key={a.titre}>
            <h2 className="text-lg font-semibold text-gray-950">{a.titre}</h2>
            {a.paragraphes.map((p, i) => (
              <p key={i} className="mt-3 text-[15px] leading-relaxed">{p}</p>
            ))}
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-gray-500">Contact : contact@clotere.fr</p>
    </main>
  );
}
