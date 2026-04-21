import { headers } from "next/headers";

export async function getRequestOrigin(): Promise<string> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) return origin;

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  if (!host) {
    throw new Error("Cannot determine request origin.");
  }

  return `${protocol}://${host}`;
}
