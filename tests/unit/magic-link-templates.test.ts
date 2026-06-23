import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { EMAIL_BRAND } from "@/lib/email/brand-tokens";
import { buildMagicLinkEmailContent } from "@/lib/email/magic-link-templates";

describe("buildMagicLinkEmailContent", () => {
  const actionLink = "https://example.supabase.co/auth/v1/verify?token=abc";
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://www.eco-sociaal.nl";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl;
  });

  it("builds login mail copy in Dutch", () => {
    const content = buildMagicLinkEmailContent({ actionLink, kind: "login" });
    expect(content.subject).toContain("Inloggen");
    expect(content.text).toContain(actionLink);
    expect(content.html).toContain("Inloggen");
  });

  it("includes OTP code in login mail when provided", () => {
    const content = buildMagicLinkEmailContent({
      actionLink,
      emailOtp: "67109300",
      kind: "login",
    });
    expect(content.text).toContain("67109300");
    expect(content.html).toContain("67109300");
    expect(content.text).toContain("8-cijferige code");
  });

  it("uses branded layout with logo and primary color", () => {
    const content = buildMagicLinkEmailContent({ actionLink, kind: "login" });
    expect(content.html).toContain(EMAIL_BRAND.primary);
    expect(content.html).toContain(EMAIL_BRAND.background);
    expect(content.html).toContain("https://www.eco-sociaal.nl/brand/cftf-logo-email.png");
    expect(content.html).toContain("Created for the Future");
  });

  it("includes org name for admin invite", () => {
    const content = buildMagicLinkEmailContent({
      actionLink,
      kind: "org_admin_invite",
      orgName: "Welzijn Eindhoven",
    });
    expect(content.subject).toContain("Welzijn Eindhoven");
    expect(content.text).toContain("Welzijn Eindhoven");
  });

  it("escapes HTML in org names", () => {
    const content = buildMagicLinkEmailContent({
      actionLink,
      kind: "member_invite",
      orgName: "Test & Co <script>",
    });
    expect(content.html).toContain("Test &amp; Co &lt;script&gt;");
    expect(content.html).not.toContain("<script>");
  });
});
