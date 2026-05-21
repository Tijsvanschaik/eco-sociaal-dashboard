import { describe, expect, it } from "vitest";

import {
  hasMetricTotal,
  sortedRowsForMetric,
  type CategorySlice,
} from "@/components/charts/category-donut-chart";

function slice(
  id: string,
  co2SavedKg: number,
  socialScoreTotal: number,
  registrationCount = 1,
): CategorySlice {
  return {
    id,
    name: id,
    co2SavedKg,
    socialScoreTotal,
    registrationCount,
  };
}

describe("sortedRowsForMetric", () => {
  it("filters zero values and sorts descending by active metric", () => {
    const items = [
      slice("a", 10, 50),
      slice("b", 100, 0),
      slice("c", 40, 200),
    ];

    expect(sortedRowsForMetric(items, "co2SavedKg").map((item) => item.id)).toEqual(["b", "c", "a"]);
    expect(sortedRowsForMetric(items, "socialScoreTotal").map((item) => item.id)).toEqual([
      "c",
      "a",
    ]);
  });
});

describe("hasMetricTotal", () => {
  it("returns true when any category has a positive metric total", () => {
    const items = [slice("a", 0, 0), slice("b", 0, 12)];

    expect(hasMetricTotal(items, "co2SavedKg")).toBe(false);
    expect(hasMetricTotal(items, "socialScoreTotal")).toBe(true);
  });
});
