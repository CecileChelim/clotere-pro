import type { Metadata } from "next";
import { BlogArticle, blogArticleMetadata, blogArticleParams } from "@/components/landing/blog/BlogPages";

type Params = { slug: string };

// SSG : une page par article ; tout autre slug → 404.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return blogArticleParams("comptable");
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return blogArticleMetadata("comptable", (await params).slug);
}

export default async function Page({ params }: { params: Promise<Params> }) {
  return <BlogArticle profession="comptable" slug={(await params).slug} />;
}
