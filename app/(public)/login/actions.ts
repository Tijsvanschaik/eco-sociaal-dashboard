"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { z } from "zod";

const schema = z.object({
  email: z.string().min(1, "Voer een e-mailadres in.").email("Voer een geldig e-mailadres in."),
  redirectTo: z.string().optional(),
});

const passwordSchema = schema.extend({
  password: z.string().min(1, "Voer je wachtwoord in."),
});

export type SendMagicLinkResult =
  | { status: "ok"; email: string }
  | { status: "error"; message: string };

export type PasswordLoginResult =
  | { status: "ok"; redirectTo: string }
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
  const callbackUrl = new URL("/auth/callback", await getRequestOrigin());
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

export async function signInWithPassword(formData: FormData): Promise<PasswordLoginResult> {
  const parsed = passwordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Ongeldige invoer.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    console.error("signInWithPassword error:", error.message);
    return {
      status: "error",
      message: "Inloggen lukte niet. Controleer je e-mailadres en wachtwoord.",
    };
  }

  return {
    status: "ok",
    redirectTo: parsed.data.redirectTo || "/",
  };
}

async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) return origin;

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  if (!host) {
    throw new Error("Cannot determine request origin for magic-link callback.");
  }

  return `${protocol}://${host}`;
}
