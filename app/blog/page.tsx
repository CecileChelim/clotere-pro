import type { Metadata } from "next";
import { BlogIndex, blogIndexMetadata } from "@/components/landing/blog/BlogPages";

export const metadata: Metadata = blogIndexMetadata("avocat");

export default function Page() {
  return <BlogIndex profession="avocat" />;
}
