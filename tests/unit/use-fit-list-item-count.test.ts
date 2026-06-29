import { computeFitListItemCount } from "@/components/dashboard/use-fit-list-item-count";
import { describe, expect, it } from "vitest";

describe("computeFitListItemCount", () => {
  it("returns zero when container height is zero", () => {
    expect(
      computeFitListItemCount({
        containerHeightPx: 0,
        fallbackCount: 5,
        gapPx: 16,
        itemCount: 10,
        itemHeightPx: 62,
      }),
    ).toBe(5);
  });

  it("caps at itemCount", () => {
    expect(
      computeFitListItemCount({
        containerHeightPx: 2_000,
        fallbackCount: 5,
        gapPx: 16,
        itemCount: 9,
        itemHeightPx: 62,
        minCount: 1,
      }),
    ).toBe(9);
  });

  it("hides rows that would clip at the bottom", () => {
    // ~9 rows fit; the 10th should be omitted.
    expect(
      computeFitListItemCount({
        containerHeightPx: 700,
        fallbackCount: 5,
        gapPx: 16,
        itemCount: 10,
        itemHeightPx: 62,
        minCount: 1,
      }),
    ).toBe(9);
  });
});
