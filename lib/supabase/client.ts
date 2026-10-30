import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase pour les Client Components ("use client").
 * Le front appelle Supabase directement — pas d'API intermédiaire —
 * la sécurité est assurée par les policies RLS côté Postgres.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
