import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/supabase/types/supabase";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const publicEnv = getPublicSupabaseEnv();
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
