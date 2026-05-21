import { registrationSchema } from "@/lib/registrations/schema";
import { describe, expect, it } from "vitest";

const validInput = {
  teamId: "11111111-1111-1111-1111-111111111111",
  interventionId: "22222222-2222-2222-2222-222222222222",
  quantity: 12.5,
  socialQuantity: 8,
  happenedOn: "2026-04-21",
  note: "Met de fiets naar kantoor.",
};

describe("registrationSchema", () => {
  it("accepts a valid registration payload", () => {
    expect(() => registrationSchema.parse(validInput)).not.toThrow();
  });

  it("requires team, intervention and positive eco/social quantities", () => {
    const result = registrationSchema.safeParse({
      ...validInput,
      teamId: "",
      interventionId: "",
      quantity: -1,
      socialQuantity: 0,
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const messages = result.error.issues.map((issue) => issue.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        "Kies een team.",
        "Kies een interventie.",
        "Eco-hoeveelheid moet groter zijn dan 0.",
        "Sociale hoeveelheid moet groter zijn dan 0.",
      ]),
    );
  });

  it("rejects quantities above the configured maximum", () => {
    const result = registrationSchema.safeParse({
      ...validInput,
      quantity: 1_000_001,
    });

    expect(result.success).toBe(false);
  });
});
