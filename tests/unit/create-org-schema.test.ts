import { createOrgSchema } from "@/lib/admin-schema";
import { describe, expect, it } from "vitest";

describe("createOrgSchema", () => {
  it("accepts a valid organization payload", () => {
    expect(() =>
      createOrgSchema.parse({
        orgName: "Welzijn Eindhoven",
        orgSlug: "welzijn-eindhoven",
        adminEmail: "beheer@welzijn-eindhoven.nl",
      }),
    ).not.toThrow();
  });

  it("rejects invalid slugs", () => {
    const result = createOrgSchema.safeParse({
      orgName: "Welzijn Eindhoven",
      orgSlug: "Welzijn Eindhoven",
      adminEmail: "beheer@welzijn-eindhoven.nl",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((issue) => issue.message)).toContain(
      "Gebruik alleen kleine letters, cijfers en koppeltekens.",
    );
  });

  it("rejects invalid admin emails", () => {
    const result = createOrgSchema.safeParse({
      orgName: "Welzijn Eindhoven",
      orgSlug: "welzijn-eindhoven",
      adminEmail: "geen-email",
    });

    expect(result.success).toBe(false);
  });
});
