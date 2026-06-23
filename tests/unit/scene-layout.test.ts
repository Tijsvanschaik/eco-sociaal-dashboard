import { describe, expect, it } from "vitest";

import {
  METAPHOR_TEXT_EXCLUDE_ZONES,
  countDistinctPlacementBuckets,
  createScenePlacements,
} from "@/lib/impact-metaphors/scene-layout";

describe("createScenePlacements", () => {
  it("returns stable placements for the same seed", () => {
    const first = createScenePlacements(12, "trees-12");
    const second = createScenePlacements(12, "trees-12");

    expect(first).toEqual(second);
  });

  it("returns the requested number of placements within bounds", () => {
    const placements = createScenePlacements(18, "people-18");

    expect(placements).toHaveLength(18);
    for (const placement of placements) {
      expect(placement.x).toBeGreaterThanOrEqual(8);
      expect(placement.x).toBeLessThanOrEqual(92);
      expect(placement.y).toBeGreaterThanOrEqual(8);
      expect(placement.y).toBeLessThanOrEqual(92);
      expect(placement.scale).toBeGreaterThan(0.5);
    }
  });

  it("spreads icons instead of stacking on one point", () => {
    const placements = createScenePlacements(24, "trees-24", {
      excludeZones: METAPHOR_TEXT_EXCLUDE_ZONES,
    });

    expect(countDistinctPlacementBuckets(placements, 0)).toBeGreaterThan(12);
  });

  it("keeps icons out of the center text exclusion band", () => {
    const [zone] = METAPHOR_TEXT_EXCLUDE_ZONES;
    if (!zone) throw new Error("Expected default exclusion zone");
    const placements = createScenePlacements(24, "people-24", {
      excludeZones: METAPHOR_TEXT_EXCLUDE_ZONES,
    });

    expect(
      placements.every(
        (placement) =>
          !(
            placement.x >= zone.xMin &&
            placement.x <= zone.xMax &&
            placement.y >= zone.yMin &&
            placement.y <= zone.yMax
          ),
      ),
    ).toBe(true);
  });
});
