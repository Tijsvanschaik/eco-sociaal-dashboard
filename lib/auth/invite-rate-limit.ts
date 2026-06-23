import { getClientIpKey } from "@/lib/auth/client-ip";
import { checkRateLimit } from "@/lib/auth/magic-link-rate-limit";

/** Max invite emails to the same address within the window. */
export const INVITE_EMAIL_RATE_LIMIT = { max: 3, windowMs: 15 * 60 * 1000 };
/** Max invite emails per org within the window. */
export const INVITE_ORG_RATE_LIMIT = { max: 20, windowMs: 60 * 60 * 1000 };
/** Max invite emails from the same client IP within the window. */
export const INVITE_IP_RATE_LIMIT = { max: 30, windowMs: 60 * 60 * 1000 };

export type InviteRateLimitResult = { allowed: true } | { allowed: false; message: string };

const RATE_LIMIT_MESSAGE = "Te veel uitnodigingen in korte tijd. Probeer het later opnieuw.";

/** Sliding-window limits on invite email sends (per email, org, and IP). */
export async function checkInviteRateLimit(
  email: string,
  orgSlug: string,
): Promise<InviteRateLimitResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const ipKey = await getClientIpKey();

  const emailAllowed = checkRateLimit(
    `invite:email:${normalizedEmail}`,
    INVITE_EMAIL_RATE_LIMIT.max,
    INVITE_EMAIL_RATE_LIMIT.windowMs,
  );
  const orgAllowed = checkRateLimit(
    `invite:org:${orgSlug}`,
    INVITE_ORG_RATE_LIMIT.max,
    INVITE_ORG_RATE_LIMIT.windowMs,
  );
  const ipAllowed = checkRateLimit(
    `invite:${ipKey}`,
    INVITE_IP_RATE_LIMIT.max,
    INVITE_IP_RATE_LIMIT.windowMs,
  );

  if (!emailAllowed || !orgAllowed || !ipAllowed) {
    console.error("invite rate limited:", { ipKey, email: normalizedEmail, orgSlug });
    return { allowed: false, message: RATE_LIMIT_MESSAGE };
  }

  return { allowed: true };
}
