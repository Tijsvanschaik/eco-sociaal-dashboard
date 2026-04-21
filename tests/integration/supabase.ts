import { assertSupabaseJwtRole } from "@/lib/supabase/jwt-role";
import type { Database } from "@/supabase/types/supabase";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";

// Env-var sanity: fail loudly if the test runner was invoked without
// Supabase credentials rather than silently hitting `undefined` URLs.
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing env var: ${name}. Set it in .env.local before running integration tests.`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  if (url.includes("example.supabase.co")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is still the placeholder host. Put your real project URL in .env.local (integration tests read that file before process.env).",
    );
  }
  return url;
}

export function anonKey(): string {
  const key = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  assertSupabaseJwtRole(key, "anon", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return key;
}

export function serviceRoleKey(): string {
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  assertSupabaseJwtRole(key, "service_role", "SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

// Service-role client bypasses RLS. Use ONLY for fixture setup and teardown.
export function adminClient(): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl(), serviceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Anon client, no session. Use to assert the "anon" RLS posture.
export function anonClient(): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl(), anonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Signs in a pre-created user by password and returns a client that carries
// that session. Supabase RLS will evaluate as if that user made the request.
export async function signedInClient(
  email: string,
  password: string,
): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(supabaseUrl(), anonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Failed to sign in ${email}: ${error.message}`);
  return client;
}
