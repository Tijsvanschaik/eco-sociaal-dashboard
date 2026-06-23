import { z } from "zod";

const appUrlSchema = z.string().url();

/** Canonical app origin from `NEXT_PUBLIC_APP_URL` (no trailing slash). */
export function getAppUrl(): string {
  const parsed = appUrlSchema.safeParse(process.env.NEXT_PUBLIC_APP_URL);
  if (!parsed.success) {
    throw new Error("NEXT_PUBLIC_APP_URL is missing or invalid.");
  }
  return parsed.data.replace(/\/$/, "");
}

/** Supabase auth callback URL with optional in-app redirect path. */
export function buildAuthCallbackUrl(redirectPath?: string): string {
  const url = new URL("/auth/callback", getAppUrl());
  if (redirectPath) {
    const normalized = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
    url.searchParams.set("next", normalized);
  }
  return url.toString();
}

/** App callback URL for admin.generateLink hashed tokens (SSR-friendly, no URL hash). */
export function buildMagicLinkConfirmUrl(tokenHash: string, redirectPath?: string): string {
  const url = new URL("/auth/callback", getAppUrl());
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", "magiclink");
  if (redirectPath) {
    const normalized = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
    url.searchParams.set("next", normalized);
  }
  return url.toString();
}
