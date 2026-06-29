import { afterEach, describe, expect, it, vi } from "vitest";

describe("isImpactSandboxEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is enabled outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ENABLE_IMPACT_SANDBOX", undefined);

    const { isImpactSandboxEnabled } = await import("@/lib/dev/impact-sandbox-enabled");
    expect(isImpactSandboxEnabled()).toBe(true);
  });

  it("is disabled on production by default", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ENABLE_IMPACT_SANDBOX", undefined);

    const { isImpactSandboxEnabled } = await import("@/lib/dev/impact-sandbox-enabled");
    expect(isImpactSandboxEnabled()).toBe(false);
  });

  it("can be enabled on production via env flag", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ENABLE_IMPACT_SANDBOX", "true");

    const { isImpactSandboxEnabled } = await import("@/lib/dev/impact-sandbox-enabled");
    expect(isImpactSandboxEnabled()).toBe(true);
  });
});
