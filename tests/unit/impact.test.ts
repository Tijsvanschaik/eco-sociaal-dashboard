import { calculateCo2, eodDaysGained } from "@/lib/impact";
import { describe, expect, it } from "vitest";

describe("calculateCo2", () => {
  it("returns zero when quantity is zero", () => {
    expect(calculateCo2(0, 1.25)).toBe(0);
  });

  it("throws when quantity is negative", () => {
    expect(() => calculateCo2(-1, 1.25)).toThrow(/negative/i);
  });

  it("supports decimals and rounds to thousandths", () => {
    expect(calculateCo2(12.345, 0.1234)).toBe(1.523);
  });
});

describe("eodDaysGained", () => {
  it("returns zero when the baseline is zero", () => {
    expect(eodDaysGained(100, 0)).toBe(0);
  });

  it("returns a rounded half-year for half the baseline", () => {
    expect(eodDaysGained(5_000, 10_000)).toBe(183);
  });

  it("caps at one year", () => {
    expect(eodDaysGained(20_000, 10_000)).toBe(365);
  });
});
