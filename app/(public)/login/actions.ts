"use server";

import { getClientIpKey } from "@/lib/auth/client-ip";
import { syncInviteMembershipFromAuthUser } from "@/lib/auth/invite-membership";
import { loginOtpTokenSchema } from "@/lib/auth/login-otp";
import { checkRateLimit } from "@/lib/auth/magic-link-rate-limit";
import { sendMagicLinkEmail } from "@/lib/auth/send-magic-link-email";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().min(1, "Voer een e-mailadres in.").email("Voer een geldig e-mailadres in."),
  redirectTo: z.string().optional(),
});

const passwordSchema = schema.extend({
  password: z.string().min(1, "Voer je wachtwoord in."),
});

const otpSchema = schema.extend({
  otp: loginOtpTokenSchema,
});

const EMAIL_RATE_LIMIT = { max: 3, windowMs: 15 * 60 * 1000 };
const IP_RATE_LIMIT = { max: 10, windowMs: 60 * 60 * 1000 };
const OTP_VERIFY_RATE_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };

export type SendMagicLinkResult =
  | { status: "ok"; email: string }
  | { status: "error"; message: string };

export type PasswordLoginResult =
  | { status: "ok"; redirectTo: string }
  | { status: "error"; message: string };

export type VerifyLoginOtpResult =
  | { status: "ok"; redirectTo: string }
  | { status: "error"; message: string };

// Requests a magic-link email for the given address. To avoid leaking which
// e-mails exist, we return "ok" on any delivery failure as well and log the
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

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const ipKey = await getClientIpKey();
  const emailAllowed = checkRateLimit(
    `email:${normalizedEmail}`,
    EMAIL_RATE_LIMIT.max,
    EMAIL_RATE_LIMIT.windowMs,
  );
  const ipAllowed = checkRateLimit(ipKey, IP_RATE_LIMIT.max, IP_RATE_LIMIT.windowMs);

  if (!emailAllowed || !ipAllowed) {
    console.error("sendMagicLink rate limited:", { ipKey, email: normalizedEmail });
    return { status: "ok", email: normalizedEmail };
  }

  const result = await sendMagicLinkEmail({
    email: normalizedEmail,
    kind: "login",
    redirectPath: parsed.data.redirectTo,
  });

  if (!result.ok) {
    console.error("sendMagicLink delivery failed:", result.reason);
  }

  // Always respond with success to the client to avoid user-enumeration.
  return { status: "ok", email: normalizedEmail };
}

export async function verifyLoginOtp(formData: FormData): Promise<VerifyLoginOtpResult> {
  const parsed = otpSchema.safeParse({
    email: formData.get("email"),
    redirectTo: formData.get("redirectTo") ?? undefined,
    otp: formData.get("otp"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Ongeldige invoer.",
    };
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const ipKey = await getClientIpKey();
  const allowed = checkRateLimit(
    `otp:${normalizedEmail}:${ipKey}`,
    OTP_VERIFY_RATE_LIMIT.max,
    OTP_VERIFY_RATE_LIMIT.windowMs,
  );
  if (!allowed) {
    return {
      status: "error",
      message: "Te veel pogingen. Vraag een nieuwe code aan en probeer het later opnieuw.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: parsed.data.otp,
    type: "email",
  });
  if (error) {
    console.error("verifyLoginOtp error:", error.message);
    return {
      status: "error",
      message: "Code ongeldig of verlopen. Vraag eventueel een nieuwe login-link aan.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await syncInviteMembershipFromAuthUser(user);
  }

  return {
    status: "ok",
    redirectTo: parsed.data.redirectTo || "/",
  };
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
