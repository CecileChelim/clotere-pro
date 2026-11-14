import type { Metadata } from "next";
import ProductTemplate from "@/components/landing/ProductTemplate";
import { metaPage } from "@/lib/landing-meta";
import { referencementNaturelAvocat as data } from "@/content/avocat/referencement-naturel-avocat";

export const metadata: Metadata = metaPage({ ...data.meta, path: data.path, profession: data.profession });

export default function Page() {
  return <ProductTemplate data={data} />;
}
