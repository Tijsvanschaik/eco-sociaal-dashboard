import { describe, expect, it } from "vitest";

import {
  assignIslandEntities,
  buildIslandTiles,
  gridDimensionForCount,
  gridToScreen,
  sortEntitiesForRender,
} from "@/lib/impact-metaphors/island-grid";

describe("island-grid", () => {
  it("scales grid dimension with entity count", () => {
    expect(gridDimensionForCount(2)).toBe(4);
    expect(gridDimensionForCount(12)).toBe(4);
    expect(gridDimensionForCount(20)).toBe(8);
    expect(gridDimensionForCount(40)).toBe(8);
    expect(gridDimensionForCount(200)).toBe(16);
  });

  it("maps iso coordinates with correct depth ordering", () => {
    const back = gridToScreen(0, 0);
    const front = gridToScreen(3, 3);
    const right = gridToScreen(3, 0);
    expect(front.y).toBeGreaterThan(back.y);
    expect(right.x).toBeGreaterThan(back.x);
  });

  it("assigns unique cells up to grid capacity", () => {
    const entities = assignIslandEntities({ count: 12, gridSize: 4, seed: "test" });
    expect(entities).toHaveLength(12);
    const keys = new Set(entities.map((entity) => `${entity.col}:${entity.row}`));
    expect(keys.size).toBe(12);
  });

  it("sorts tiles back-to-front", () => {
    const tiles = buildIslandTiles(4);
    const depths = tiles.map((tile) => tile.depth);
    expect(depths).toEqual([...depths].sort((a, b) => a - b));
  });

  it("sorts entities for painter order", () => {
    const sorted = sortEntitiesForRender([
      { depth: 4, col: 2, row: 2 },
      { depth: 1, col: 0, row: 1 },
      { depth: 1, col: 1, row: 0 },
    ]);
    expect(sorted[0]?.depth).toBe(1);
    expect(sorted.at(-1)?.depth).toBe(4);
  });
});
