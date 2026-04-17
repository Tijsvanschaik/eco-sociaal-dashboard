"use server";

import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().min(1, "Voer een e-mailadres in.").email("Voer een geldig e-mailadres in."),
  redirectTo: z.string().optional(),
});

export type SendMagicLinkResult =
  | { status: "ok"; email: string }
  | { status: "error"; message: string };

// Requests a magic-link email for the given address. To avoid leaking which
// e-mails exist, we return "ok" on any Supabase error as well and log the
// real reason server-side.
export async function sendMagicLink(formData: FormData): Promise<SendMagicLinkResult> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Ongeldige invoer.",
    };
  }

  const supabase = await createClient();
  const callbackUrl = new URL("/auth/callback", publicEnv.NEXT_PUBLIC_APP_URL);
  if (parsed.data.redirectTo) {
    callbackUrl.searchParams.set("next", parsed.data.redirectTo);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      // Only admins (Fase 2) can provision users; self-registration is disabled.
      shouldCreateUser: false,
    },
  });

  if (error) {
    console.error("sendMagicLink error:", error.message);
  }

  // Always respond with success to the client to avoid user-enumeration.
  return { status: "ok", email: parsed.data.email };
}
