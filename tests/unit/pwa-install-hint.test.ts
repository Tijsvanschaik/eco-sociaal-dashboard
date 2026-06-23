import { describe, expect, it } from "vitest";

import {
  INSTALL_HINT_DISMISSED_KEY,
  INSTALL_HINT_VISIT_KEY,
  MIN_VISITS_BEFORE_HINT,
  isAndroidChrome,
  isIosSafari,
  shouldShowInstallHint,
} from "@/lib/pwa/install-hint";

describe("shouldShowInstallHint", () => {
  const base = {
    visitCount: MIN_VISITS_BEFORE_HINT,
    dismissed: false,
    isStandalone: false,
    isMobile: true,
  };

  it("shows after the minimum visit count on mobile", () => {
    expect(shouldShowInstallHint(base)).toBe(true);
  });

  it("hides before the minimum visit count", () => {
    expect(shouldShowInstallHint({ ...base, visitCount: MIN_VISITS_BEFORE_HINT - 1 })).toBe(false);
  });

  it("hides when already installed as standalone", () => {
    expect(shouldShowInstallHint({ ...base, isStandalone: true })).toBe(false);
  });

  it("hides when dismissed", () => {
    expect(shouldShowInstallHint({ ...base, dismissed: true })).toBe(false);
  });

  it("hides on desktop", () => {
    expect(shouldShowInstallHint({ ...base, isMobile: false })).toBe(false);
  });
});

describe("platform helpers", () => {
  it("detects iOS Safari", () => {
    expect(isIosSafari("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(true);
    expect(isIosSafari("Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile")).toBe(false);
  });

  it("detects Android Chrome", () => {
    expect(isAndroidChrome("Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile")).toBe(true);
    expect(isAndroidChrome("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(false);
  });
});

describe("install hint storage keys", () => {
  it("uses stable localStorage keys", () => {
    expect(INSTALL_HINT_DISMISSED_KEY).toBe("eco-pwa-install-dismissed");
    expect(INSTALL_HINT_VISIT_KEY).toBe("eco-pwa-install-visits");
  });
});
