// Listes fixes réutilisées par l'onboarding, l'édition de fiche et la fiche
// publique. Calquées sur les catégories observées sur les fiches CGP du
// marché (ex. monconseillerpatrimoine.com).

export const SPECIALITES = [
  "Conseil",
  "Famille",
  "Fiscalité",
  "Immobilier",
  "Investissement",
  "Patrimoine",
  "Retraite",
  "Succession",
] as const;

export const MODALITES = ["Cabinet", "Domicile", "Visioconférence", "Téléphone"] as const;

export const LINKEDIN_PREFIX = "https://www.linkedin.com/in/";

// Prix par défaut d'un service — affiché tel quel sur la fiche publique tant
// que le CGP ne l'a pas remplacé par un montant ou une grille tarifaire.
export const DEFAULT_SERVICE_PRICE = "Sur demande";

// Services proposés — pré-remplis avec titre + description + tarif par
// défaut pour que le CGP n'ait qu'à cocher ceux qui le concernent (puis les
// éditer librement, y compris le tarif). Descriptions longues et riches en
// mots-clés pour le référencement de la fiche publique : un paragraphe
// d'intro, puis des lignes commençant par "- " qui s'affichent en liste à
// puces (voir lib/richtext.ts) — mêmes codes que le format attendu côté
// éditeur (ServicesEditor).
export const SERVICE_PRESETS: { titre: string; description: string; prix: string }[] = [
  {
    titre: "Transmettre votre patrimoine",
    description: `Anticiper la transmission de votre patrimoine, c'est protéger vos proches et réduire la fiscalité successorale qui s'appliquera à votre succession. Mon rôle est d'examiner avec vous les leviers juridiques et fiscaux adaptés à votre situation familiale et patrimoniale.
Les leviers que nous étudions ensemble :
- Régime matrimonial et contrat de mariage
- Donations entre époux et donations-partages
- Clause bénéficiaire d'assurance-vie
- Démembrement de propriété (usufruit et nue-propriété)
- Donation temporaire d'usufruit
- Pacte Dutreil pour la transmission d'entreprise
Cet accompagnement est coordonné avec votre notaire et votre expert-comptable, pour une transmission de patrimoine organisée à votre rythme, sans fiscalité subie.`,
    prix: DEFAULT_SERVICE_PRICE,
  },
  {
    titre: "Bilan patrimonial",
    description: `Avant toute recommandation, il est essentiel de dresser un état des lieux complet de votre situation financière, immobilière, fiscale et familiale. Ce bilan patrimonial est le point de départ de toute stratégie de gestion de patrimoine cohérente.
Le bilan patrimonial analyse :
- Vos revenus, votre épargne et votre capacité d'investissement
- Votre patrimoine immobilier et financier existant
- Votre régime fiscal (impôt sur le revenu, IFI, prélèvements sociaux)
- Vos besoins de protection (prévoyance, retraite, succession)
- Vos objectifs de vie à court, moyen et long terme
Ce bilan patrimonial, gratuit et sans engagement, aboutit à un plan d'action hiérarchisé et chiffré, adapté à votre situation.`,
    prix: DEFAULT_SERVICE_PRICE,
  },
  {
    titre: "Solutions immobilières",
    description: `L'investissement immobilier reste l'un des piliers les plus solides pour construire un patrimoine durable, à condition de choisir la structure juridique et fiscale la mieux adaptée à votre situation.
Nous étudions ensemble :
- Investissement locatif nu ou meublé (statut LMNP)
- SCPI et parts de sociétés civiles de placement immobilier
- Acquisition et optimisation de la résidence principale
- Démembrement de propriété immobilier
- Groupements fonciers agricoles ou forestiers (GFA, GFF)
- Dispositifs de défiscalisation immobilière (loi Denormandie, Monuments Historiques, déficit foncier)
Chaque recommandation immobilière tient compte de votre profil fiscal, de votre horizon de placement et de votre tolérance au risque.`,
    prix: DEFAULT_SERVICE_PRICE,
  },
  {
    titre: "Aide à la déclaration des impôts",
    description: `Au-delà de l'optimisation fiscale en amont, la déclaration annuelle de revenus reste un moment-clé, trop souvent traité à la hâte alors qu'elle conditionne le montant réel de votre impôt.
Nous vérifions ensemble :
- L'intégration complète de vos revenus, plus-values et placements
- Les frais réels et charges déductibles
- Les réductions et crédits d'impôt applicables (dons, emploi à domicile, investissements)
- La cohérence entre impôt sur le revenu, IFI et prélèvements sociaux
- Les cases souvent oubliées ou mal renseignées de votre déclaration
C'est aussi l'occasion d'anticiper les ajustements de trésorerie et de fiscalité à prévoir pour l'année suivante.`,
    prix: DEFAULT_SERVICE_PRICE,
  },
  {
    titre: "Réduire vos impôts",
    description: `Payer ses impôts est un devoir ; payer plus que ce que la loi prévoit est une erreur qu'il est possible d'éviter. Mon rôle est d'identifier avec vous les marges d'optimisation fiscale légales applicables à votre situation, puis de mettre en place une stratégie durable et conforme à la réglementation.
Mon accompagnement couvre l'ensemble des impositions :
- Impôt sur le revenu
- Impôt sur la fortune immobilière (IFI)
- Impôt sur les sociétés pour les dirigeants
- Impôt sur les plus-values mobilières et immobilières
- Droits de donation et de succession
- Charges sociales liées à votre statut
Plutôt qu'un catalogue de produits, je construis avec vous une combinaison sur mesure de mécanismes de déduction, de réduction et de crédit d'impôt :
- Placements financiers à fiscalité avantageuse (PER, assurance-vie, PEA)
- Dispositifs immobiliers (Monuments Historiques, déficit foncier, Denormandie, LMNP)
- Girardin industriel
- Démembrement de propriété et donation temporaire d'usufruit
- Épargne salariale (PEE, PERCO, abondement employeur)
- Ingénierie patrimoniale sur mesure
L'objectif : une stratégie fiscale durable, cohérente et adaptée à vos objectifs de vie.`,
    prix: DEFAULT_SERVICE_PRICE,
  },
  {
    titre: "Préparer votre retraite",
    description: `La retraite ne se prépare pas à 62 ans : elle se construit entre 40 et 60 ans, pour réduire l'effort d'épargne mensuel nécessaire et sécuriser votre niveau de vie futur.
Nous mettons en place ensemble :
- Une reconstitution de carrière et une simulation de pension
- Un Plan d'Épargne Retraite (PER individuel ou collectif)
- Une assurance-vie multisupport
- De l'investissement locatif générateur de revenus complémentaires
- Un rachat de trimestres, quand c'est pertinent pour votre situation
Pour les dirigeants d'entreprise, cette stratégie de préparation à la retraite s'articule avec une future cession ou transmission d'activité, en optimisant chaque étape sur le plan fiscal et social.`,
    prix: DEFAULT_SERVICE_PRICE,
  },
  {
    titre: "Solutions financières",
    description: `Construire une stratégie financière, ce n'est pas empiler des produits : c'est assembler les bonnes enveloppes de placement selon vos objectifs, votre horizon d'investissement et votre profil de risque.
Nous donnons accès à un large panel de solutions :
- Assurance-vie multisupport et contrats de capitalisation
- Plan d'Épargne Retraite (PER)
- Plan d'Épargne en Actions (PEA)
- SCPI et parts de sociétés civiles de placement
- Private equity, FCPI et FIP
- Supports labellisés ISR et ESG
Une architecture ouverte, sans produit maison imposé, pour un conseil en gestion de patrimoine réellement indépendant.`,
    prix: DEFAULT_SERVICE_PRICE,
  },
  {
    titre: "Trésorerie d'entreprise et épargne professionnelle",
    description: `En tant que dirigeant d'entreprise, une trésorerie excédentaire qui dort sur un compte courant a un coût réel : celui de l'inflation et du manque à gagner sur cette épargne professionnelle.
Nous étudions ensemble :
- Comptes à terme et dépôts rémunérés
- Contrats de capitalisation
- SCPI et immobilier d'entreprise
- Private equity et FCPR
- Plan d'Épargne Entreprise (PEE) et PERCO
- L'arbitrage entre rémunération, dividendes et mise en réserve
L'objectif : optimiser chaque euro de trésorerie d'entreprise sans compromettre la souplesse de votre activité.`,
    prix: DEFAULT_SERVICE_PRICE,
  },
];

// Motifs de RDV proposés par défaut à l'onboarding — la même liste que les
// services (un motif de prise de RDV correspond en général à l'un des
// services proposés). Le CGP les sélectionne par un clic, comme pour les
// services ; il ne saisit pas de texte libre.
export const MOTIF_PRESETS = SERVICE_PRESETS.map((s) => s.titre);
export const MOTIF_PRESETS_DEFAULT_SELECTION = [
  "Bilan patrimonial",
  "Transmettre votre patrimoine",
  "Réduire vos impôts",
];
