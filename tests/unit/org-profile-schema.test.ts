import { describe, expect, it } from "vitest";

import { orgProfileSchema } from "@/lib/admin-schema";

describe("orgProfileSchema", () => {
  it("accepts valid profile content within limits", () => {
    const result = orgProfileSchema.safeParse({
      name: "LEV Groep",
      missionShort: "Korte pitch",
      description: "Uitgebreide missie",
      impactDisclaimer: "Indicatieve cijfers",
    });

    expect(result.success).toBe(true);
  });

  it("rejects mission short over 280 characters", () => {
    const result = orgProfileSchema.safeParse({
      name: "LEV Groep",
      missionShort: "x".repeat(281),
    });

    expect(result.success).toBe(false);
  });
});
