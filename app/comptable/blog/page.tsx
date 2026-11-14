import type { Metadata } from "next";
import { BlogIndex, blogIndexMetadata } from "@/components/landing/blog/BlogPages";

export const metadata: Metadata = blogIndexMetadata("comptable");

export default function Page() {
  return <BlogIndex profession="comptable" />;
}
