import type { Metadata } from "next";
import ProductTemplate from "@/components/landing/ProductTemplate";
import { metaPage } from "@/lib/landing-meta";
import { referencementNaturelExpertComptable as data } from "@/content/comptable/referencement-naturel-expert-comptable";

export const metadata: Metadata = metaPage({ ...data.meta, path: data.path, profession: data.profession });

export default function Page() {
  return <ProductTemplate data={data} />;
}
