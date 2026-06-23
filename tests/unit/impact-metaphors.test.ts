import { describe, expect, it } from "vitest";

import {
  KG_CO2_PER_GLASS,
  buildMetaphorUnits,
  glassesOfWaterEquivalent,
  resolveMetaphorIconVisual,
  visibleMetaphorCount,
} from "@/lib/impact-metaphors";

describe("impact-metaphors", () => {
  it("converts CO2 to glasses of water", () => {
    expect(glassesOfWaterEquivalent(0)).toBe(0);
    expect(glassesOfWaterEquivalent(1)).toBe(Math.round(1 / KG_CO2_PER_GLASS));
    expect(glassesOfWaterEquivalent(10)).toBe(20);
  });

  it("maps one icon per unit when under the visible cap", () => {
    expect(resolveMetaphorIconVisual("trees", 5)).toEqual({ iconCount: 5, unitsPerIcon: 1 });
    expect(visibleMetaphorCount("trees", 5)).toBe(5);
    expect(visibleMetaphorCount("trees", 0)).toBe(0);
  });

  it("scales icons when the headline number exceeds the cap", () => {
    const visual = resolveMetaphorIconVisual("water", 88);
    expect(visual.unitsPerIcon).toBe(4);
    expect(visual.iconCount).toBe(22);
    expect(visual.iconCount * visual.unitsPerIcon).toBe(88);
    expect(resolveMetaphorIconVisual("trees", 100).unitsPerIcon).toBe(3);
    expect(visibleMetaphorCount("trees", 100)).toBe(34);
  });

  it("builds LEV default units (trees + people only)", () => {
    const units = buildMetaphorUnits({ totalCo2Kg: 44, totalSocialScore: 12 });
    expect(units.map((u) => u.id)).toEqual(["trees", "people"]);
    expect(units[0]?.numericValue).toBe(2);
    expect(units[0]?.iconCount).toBe(2);
    expect(units[0]?.unitsPerIcon).toBe(1);
    expect(units[1]?.numericValue).toBe(12);
    expect(units[1]?.iconCount).toBe(12);
  });

  it("can still build water when explicitly enabled", () => {
    const units = buildMetaphorUnits({
      enabledIds: ["water"],
      totalCo2Kg: 44,
      totalSocialScore: 0,
    });
    expect(units.map((u) => u.id)).toEqual(["water"]);
  });

  it("omits units with zero value", () => {
    const units = buildMetaphorUnits({ totalCo2Kg: 0, totalSocialScore: 5 });
    expect(units.map((u) => u.id)).toEqual(["people"]);
  });
});
