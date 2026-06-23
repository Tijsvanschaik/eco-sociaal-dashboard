import { describe, expect, it } from "vitest";

import { buildAuthCallbackUrl, buildMagicLinkConfirmUrl, getAppUrl } from "@/lib/app-url";

describe("getAppUrl", () => {
  it("returns NEXT_PUBLIC_APP_URL without trailing slash", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://www.eco-sociaal.nl/";
    expect(getAppUrl()).toBe("https://www.eco-sociaal.nl");
  });

  it("throws when NEXT_PUBLIC_APP_URL is missing", () => {
    const previous = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = undefined;
    expect(() => getAppUrl()).toThrow(/NEXT_PUBLIC_APP_URL/);
    process.env.NEXT_PUBLIC_APP_URL = previous;
  });
});

describe("buildAuthCallbackUrl", () => {
  it("builds callback URL without redirect path", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://www.eco-sociaal.nl";
    expect(buildAuthCallbackUrl()).toBe("https://www.eco-sociaal.nl/auth/callback");
  });

  it("adds next query param for redirect path", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://www.eco-sociaal.nl";
    expect(buildAuthCallbackUrl("/lev-groep/dashboard")).toBe(
      "https://www.eco-sociaal.nl/auth/callback?next=%2Flev-groep%2Fdashboard",
    );
  });
});

describe("buildMagicLinkConfirmUrl", () => {
  it("builds token_hash callback URL for SSR magic links", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    expect(buildMagicLinkConfirmUrl("abc123", "/lev-groep/dashboard")).toBe(
      "http://localhost:3000/auth/callback?token_hash=abc123&type=magiclink&next=%2Flev-groep%2Fdashboard",
    );
  });
});
