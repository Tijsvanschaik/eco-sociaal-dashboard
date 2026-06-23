import "server-only";

import { headers } from "next/headers";

/** Client IP for rate limiting (Vercel forwards x-forwarded-for). */
export async function getClientIpKey(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? headerStore.get("x-real-ip") ?? "unknown";
  return `ip:${ip}`;
}
