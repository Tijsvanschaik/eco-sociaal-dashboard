import { afterEach, describe, expect, it } from "vitest";

import { checkRateLimit, resetRateLimitsForTests } from "@/lib/auth/magic-link-rate-limit";

describe("checkRateLimit", () => {
  afterEach(() => {
    resetRateLimitsForTests();
  });

  it("allows requests under the limit", () => {
    expect(checkRateLimit("email:test@example.com", 3, 60_000)).toBe(true);
    expect(checkRateLimit("email:test@example.com", 3, 60_000)).toBe(true);
    expect(checkRateLimit("email:test@example.com", 3, 60_000)).toBe(true);
  });

  it("blocks requests over the limit within the window", () => {
    expect(checkRateLimit("email:test@example.com", 2, 60_000)).toBe(true);
    expect(checkRateLimit("email:test@example.com", 2, 60_000)).toBe(true);
    expect(checkRateLimit("email:test@example.com", 2, 60_000)).toBe(false);
  });

  it("tracks keys independently", () => {
    expect(checkRateLimit("email:a@example.com", 1, 60_000)).toBe(true);
    expect(checkRateLimit("email:b@example.com", 1, 60_000)).toBe(true);
    expect(checkRateLimit("email:a@example.com", 1, 60_000)).toBe(false);
    expect(checkRateLimit("email:b@example.com", 1, 60_000)).toBe(false);
  });
});
