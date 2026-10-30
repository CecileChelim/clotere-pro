import { Hero } from "@/components/marketing/Hero";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { Concretely } from "@/components/marketing/Concretely";
import { SocialProof } from "@/components/marketing/SocialProof";
import { StatsBand } from "@/components/marketing/StatsBand";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { getCurrentUser } from "@/lib/auth";

export default async function AcquisitionPage() {
  const user = await getCurrentUser();

  return (
    <>
      <Hero isAuthenticated={!!user} />
      <ProductPreview />
      <Concretely />
      <SocialProof />
      <StatsBand />
      <ComparisonTable />
      <Faq />
      <FinalCta />
    </>
  );
}
