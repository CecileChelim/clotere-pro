import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Client Supabase « service_role » : contourne la RLS. À n'utiliser que côté serveur. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
}
