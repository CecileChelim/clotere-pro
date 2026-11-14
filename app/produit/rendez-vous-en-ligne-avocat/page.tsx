import type { Metadata } from "next";
import ProductTemplate from "@/components/landing/ProductTemplate";
import { metaPage } from "@/content/avocat/shared";
import { rendezVousEnLigneAvocat as data } from "@/content/avocat/rendez-vous-en-ligne-avocat";

export const metadata: Metadata = metaPage({ ...data.meta, path: data.path });

export default function Page() {
  return <ProductTemplate data={data} />;
}
