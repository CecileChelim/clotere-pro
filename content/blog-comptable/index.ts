import type { BlogPost } from "@/lib/blog";
import { etreVisibleExpertComptable } from "./etre-visible-expert-comptable";
import { rendezVousQualifiesExpertComptable } from "./rendez-vous-qualifies-expert-comptable";
import { ficheGoogleExpertComptable } from "./fiche-google-expert-comptable";
import { siteInternetExpertComptableGuide } from "./site-internet-expert-comptable-guide";
import { visibiliteReferencementExpertComptable } from "./visibilite-referencement-expert-comptable";

/** Articles du blog comptable.clotere.fr. */
export const BLOG_COMPTABLE: BlogPost[] = [
  etreVisibleExpertComptable,
  rendezVousQualifiesExpertComptable,
  ficheGoogleExpertComptable,
  siteInternetExpertComptableGuide,
  visibiliteReferencementExpertComptable,
];
