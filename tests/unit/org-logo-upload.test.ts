import { describe, expect, it } from "vitest";

import {
  ORG_LOGO_MAX_BYTES,
  buildOrgLogoStoragePath,
  extractOrgLogoStoragePath,
  getOrgLogoPublicUrl,
  isManagedOrgLogoUrl,
  validateOrgLogoFile,
} from "@/lib/organizations/logo-upload";

const ORG_ID = "11111111-1111-1111-1111-111111111111";
const SUPABASE_URL = "https://example.supabase.co";

describe("validateOrgLogoFile", () => {
  it("accepts png, svg and webp under 5 MB", () => {
    expect(validateOrgLogoFile({ type: "image/png", size: 1024 })).toEqual({ ok: true });
    expect(validateOrgLogoFile({ type: "image/svg+xml", size: 512 })).toEqual({ ok: true });
    expect(validateOrgLogoFile({ type: "image/webp", size: 2048 })).toEqual({ ok: true });
  });

  it("rejects unsupported mime types", () => {
    const result = validateOrgLogoFile({ type: "image/jpeg", size: 1024 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/png/i);
    }
  });

  it("rejects files over 5 MB", () => {
    const result = validateOrgLogoFile({ type: "image/png", size: ORG_LOGO_MAX_BYTES + 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/te groot/i);
    }
  });
});

describe("org logo storage helpers", () => {
  it("builds a storage path under the org id", () => {
    const path = buildOrgLogoStoragePath(ORG_ID, { name: "logo.svg", type: "image/svg+xml" });
    expect(path.startsWith(`${ORG_ID}/`)).toBe(true);
    expect(path.endsWith(".svg")).toBe(true);
  });

  it("detects managed public logo urls", () => {
    const path = `${ORG_ID}/abc.png`;
    const publicUrl = getOrgLogoPublicUrl(SUPABASE_URL, path);

    expect(isManagedOrgLogoUrl(publicUrl, ORG_ID, SUPABASE_URL)).toBe(true);
    expect(isManagedOrgLogoUrl("https://cdn.example.com/logo.png", ORG_ID, SUPABASE_URL)).toBe(
      false,
    );
    expect(extractOrgLogoStoragePath(publicUrl, ORG_ID, SUPABASE_URL)).toBe(path);
  });
});
