import "server-only";

import { getServerEnv, publicEnv } from "@/lib/env";
import type { Database } from "@/supabase/types/supabase";
import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Use inside Server Components, Server Actions and Route Handlers.
// Honors the user's session via cookies and therefore respects RLS.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `set` throws when called from a Server Component; the middleware
            // will refresh the session instead. Safe to ignore here.
          }
        },
      },
    },
  );
}

// Service-role client. NEVER import this from a Client Component.
// Only use when bypassing RLS is unavoidable (e.g. admin operations, webhooks).
export function createServiceRoleClient() {
  const env = getServerEnv();
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
