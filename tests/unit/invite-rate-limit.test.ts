import { afterEach, describe, expect, it, vi } from "vitest";

import { INVITE_EMAIL_RATE_LIMIT, checkInviteRateLimit } from "@/lib/auth/invite-rate-limit";
import { resetRateLimitsForTests } from "@/lib/auth/magic-link-rate-limit";

vi.mock("@/lib/auth/client-ip", () => ({
  getClientIpKey: vi.fn(async () => "ip:127.0.0.1"),
}));

describe("checkInviteRateLimit", () => {
  afterEach(() => {
    resetRateLimitsForTests();
  });

  it("allows invites under all limits", async () => {
    const result = await checkInviteRateLimit("worker@example.com", "demo-org");
    expect(result).toEqual({ allowed: true });
  });

  it("blocks when the email limit is exceeded", async () => {
    for (let i = 0; i < INVITE_EMAIL_RATE_LIMIT.max; i += 1) {
      const allowed = await checkInviteRateLimit("worker@example.com", "demo-org");
      expect(allowed).toEqual({ allowed: true });
    }

    const blocked = await checkInviteRateLimit("worker@example.com", "demo-org");
    expect(blocked).toEqual({
      allowed: false,
      message: "Te veel uitnodigingen in korte tijd. Probeer het later opnieuw.",
    });
  });
});
