import { z } from "zod";

const publicSupabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = publicSupabaseSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  EMBED_FRAME_ANCESTORS: z.string().min(1).default("'self'"),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM: z.string().min(1),
  RESEND_REPLY_TO: z.string().email().optional(),
});

type PublicSupabaseEnv = z.infer<typeof publicSupabaseSchema>;
type ServerEnv = z.infer<typeof serverSchema>;

let cachedPublicSupabaseEnv: PublicSupabaseEnv | null = null;

export function getPublicSupabaseEnv(): PublicSupabaseEnv {
  if (cachedPublicSupabaseEnv) return cachedPublicSupabaseEnv;

  cachedPublicSupabaseEnv = publicSupabaseSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  return cachedPublicSupabaseEnv;
}

// Parsed lazily so importing this module from a Client Component does not crash.
// Only call `getServerEnv()` from Server Components, Server Actions, or Route Handlers.
let cachedServerEnv: ServerEnv | null = null;
export function getServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;
  const publicEnv = getPublicSupabaseEnv();
  cachedServerEnv = serverSchema.parse({
    ...publicEnv,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    EMBED_FRAME_ANCESTORS: process.env.EMBED_FRAME_ANCESTORS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM,
    RESEND_REPLY_TO: process.env.RESEND_REPLY_TO || undefined,
  });
  return cachedServerEnv;
}
