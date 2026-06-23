import { z } from "zod";

/** Supabase `generateLink` returns an 8-digit `email_otp`, not 6. */
export const LOGIN_OTP_LENGTH = 8;

export const loginOtpTokenSchema = z
  .string()
  .trim()
  .regex(
    new RegExp(`^\\d{${LOGIN_OTP_LENGTH}}$`),
    `Voer de ${LOGIN_OTP_LENGTH}-cijferige code uit je e-mail in.`,
  );

export function sanitizeLoginOtpInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, LOGIN_OTP_LENGTH);
}
