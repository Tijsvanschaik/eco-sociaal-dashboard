import { describe, expect, it } from "vitest";

import {
  assignIslandEntities,
  buildIslandTiles,
  compactIslandTiles,
  computeIslandViewBoxBoundsFromTiles,
  computeResponsiveIslandScale,
  computeSharedIslandViewBoxBounds,
  gridDimensionForCount,
  gridToScreen,
  sortEntitiesForRender,
} from "@/lib/impact-metaphors/island-grid";
import { islandCellCapacity, islandIsoSpan } from "@/lib/impact-metaphors/island-shape";
import { DEFAULT_ISLAND_TUNING } from "@/lib/impact-metaphors/island-tuning";

describe("island-grid", () => {
  it("scales grid dimension with entity count (square)", () => {
    expect(gridDimensionForCount(0, "square")).toBe(4);
    expect(gridDimensionForCount(2, "square")).toBe(4);
    expect(gridDimensionForCount(12, "square")).toBe(4);
    expect(gridDimensionForCount(20, "square")).toBe(8);
    expect(gridDimensionForCount(40, "square")).toBe(8);
    expect(gridDimensionForCount(200, "square")).toBe(8);
  });

  it("uses a larger grid sooner for non-square shapes", () => {
    expect(islandCellCapacity(4, "circle")).toBeLessThan(16);
    expect(gridDimensionForCount(16, "circle")).toBe(8);
  });

  it("oval is wider than tall in iso projection", () => {
    const span = islandIsoSpan(8, "oval");
    expect(span.x).toBeGreaterThan(span.y);
  });

  it("oval has more horizontal span than circle on the same grid", () => {
    const oval = islandIsoSpan(8, "oval");
    const circle = islandIsoSpan(8, "circle");
    expect(oval.x).toBeGreaterThan(circle.x);
    expect(oval.y).toBeLessThanOrEqual(circle.y + 1);
  });

  it("maps iso coordinates with correct depth ordering", () => {
    const back = gridToScreen(0, 0);
    const front = gridToScreen(3, 3);
    const right = gridToScreen(3, 0);
    expect(front.y).toBeGreaterThan(back.y);
    expect(right.x).toBeGreaterThan(back.x);
  });

  it("builds fewer tiles for circle and diamond than square", () => {
    expect(buildIslandTiles(4, { ...DEFAULT_ISLAND_TUNING, islandShape: "square" })).toHaveLength(
      16,
    );
    expect(
      buildIslandTiles(4, { ...DEFAULT_ISLAND_TUNING, islandShape: "circle" }).length,
    ).toBeLessThan(16);
    expect(
      buildIslandTiles(4, { ...DEFAULT_ISLAND_TUNING, islandShape: "diamond" }).length,
    ).toBeLessThan(16);
  });

  it("assigns unique cells up to shape capacity", () => {
    const gridSize = 4;
    const tuning = { ...DEFAULT_ISLAND_TUNING, islandShape: "circle" as const };
    const capacity = islandCellCapacity(gridSize, tuning.islandShape);
    const entities = assignIslandEntities({
      count: capacity,
      gridSize,
      seed: "test",
      tuning,
    });
    const tiles = buildIslandTiles(gridSize, tuning);
    const tileKeys = new Set(tiles.map((tile) => `${tile.col}:${tile.row}`));

    expect(entities).toHaveLength(capacity);
    const keys = new Set(entities.map((entity) => `${entity.col}:${entity.row}`));
    expect(keys.size).toBe(capacity);

    for (const entity of entities) {
      expect(tileKeys.has(`${entity.col}:${entity.row}`)).toBe(true);
    }
  });

  it("assigns grass variants from the sprite pool", () => {
    const tiles = buildIslandTiles(4, DEFAULT_ISLAND_TUNING, "grass-variants");
    const variants = new Set(tiles.map((tile) => tile.grassVariant));
    expect(variants.size).toBeGreaterThan(1);
  });

  it("assigns person variants from the sprite pool", () => {
    const entities = assignIslandEntities({
      count: 12,
      gridSize: 4,
      seed: "variants",
      tuning: DEFAULT_ISLAND_TUNING,
    });
    const variants = new Set(entities.map((entity) => entity.personVariant));
    expect(variants.size).toBeGreaterThan(1);
  });

  it("assigns tree variants from the sprite pool", () => {
    const entities = assignIslandEntities({
      count: 12,
      gridSize: 4,
      seed: "tree-variants",
      tuning: DEFAULT_ISLAND_TUNING,
    });
    const variants = new Set(entities.map((entity) => entity.treeVariant));
    expect(variants.size).toBeGreaterThan(1);
  });

  it("prefers the grid with the highest fill ratio", () => {
    expect(gridDimensionForCount(12, "square")).toBe(4);
    expect(gridDimensionForCount(20, "square")).toBe(8);

    const gridForForty = gridDimensionForCount(40, "oval");
    expect(gridForForty).toBe(8);
    expect(islandCellCapacity(gridForForty, "oval")).toBeGreaterThan(24);
  });

  it("never exceeds the configured max grid size", () => {
    expect(gridDimensionForCount(200, "square", 8)).toBe(8);
    expect(gridDimensionForCount(200, "square", 16)).toBe(16);
    expect(gridDimensionForCount(40, "oval")).toBeLessThanOrEqual(8);
  });

  it("keeps entities on one contiguous cluster", () => {
    const gridSize = 8;
    const tuning = { ...DEFAULT_ISLAND_TUNING, islandShape: "oval" as const };
    const entities = assignIslandEntities({
      count: 10,
      gridSize,
      seed: "cluster-test",
      tuning,
    });

    const keys = new Set(entities.map((entity) => `${entity.col}:${entity.row}`));
    const visited = new Set<string>();
    let components = 0;

    for (const entity of entities) {
      const startKey = `${entity.col}:${entity.row}`;
      if (visited.has(startKey)) continue;

      components += 1;
      const queue = [{ col: entity.col, row: entity.row }];

      while (queue.length > 0) {
        const cell = queue.pop();
        if (!cell) break;

        const key = `${cell.col}:${cell.row}`;
        if (visited.has(key)) continue;
        visited.add(key);

        for (const neighbor of [
          { col: cell.col - 1, row: cell.row },
          { col: cell.col + 1, row: cell.row },
          { col: cell.col, row: cell.row - 1 },
          { col: cell.col, row: cell.row + 1 },
          { col: cell.col - 1, row: cell.row - 1 },
          { col: cell.col - 1, row: cell.row + 1 },
          { col: cell.col + 1, row: cell.row - 1 },
          { col: cell.col + 1, row: cell.row + 1 },
        ]) {
          const neighborKey = `${neighbor.col}:${neighbor.row}`;
          if (keys.has(neighborKey) && !visited.has(neighborKey)) {
            queue.push(neighbor);
          }
        }
      }
    }

    expect(components).toBe(1);
  });

  it("compacts sparse islands to one connected grass blob", () => {
    const gridSize = 4;
    const tuning = { ...DEFAULT_ISLAND_TUNING, islandShape: "oval" as const };
    const allTiles = buildIslandTiles(gridSize, tuning, "compact-connected");
    const entities = assignIslandEntities({
      count: 3,
      gridSize,
      seed: "compact-connected",
      tuning,
    });

    const compact = compactIslandTiles(allTiles, entities, gridSize, tuning.islandShape);
    const compactKeys = new Set(compact.map((tile) => `${tile.col}:${tile.row}`));
    const visited = new Set<string>();
    let components = 0;

    for (const tile of compact) {
      const startKey = `${tile.col}:${tile.row}`;
      if (visited.has(startKey)) continue;

      components += 1;
      const queue = [{ col: tile.col, row: tile.row }];

      while (queue.length > 0) {
        const cell = queue.pop();
        if (!cell) break;

        const key = `${cell.col}:${cell.row}`;
        if (visited.has(key)) continue;
        visited.add(key);

        for (const neighbor of [
          { col: cell.col - 1, row: cell.row },
          { col: cell.col + 1, row: cell.row },
          { col: cell.col, row: cell.row - 1 },
          { col: cell.col, row: cell.row + 1 },
        ]) {
          const neighborKey = `${neighbor.col}:${neighbor.row}`;
          if (compactKeys.has(neighborKey) && !visited.has(neighborKey)) {
            queue.push(neighbor);
          }
        }
      }
    }

    expect(compact.length).toBeLessThan(allTiles.length);
    expect(components).toBe(1);
  });

  it("uses random spawn order for entities", () => {
    const entities = assignIslandEntities({
      count: 8,
      gridSize: 4,
      seed: "spawn-order",
      tuning: DEFAULT_ISLAND_TUNING,
    });

    const spawnIndices = entities.map((entity) => entity.spawnIndex);
    expect(new Set(spawnIndices).size).toBe(entities.length);
    expect(spawnIndices).not.toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("compacts sparse islands to a tighter grass footprint", () => {
    const gridSize = 4;
    const tuning = { ...DEFAULT_ISLAND_TUNING, islandShape: "oval" as const };
    const allTiles = buildIslandTiles(gridSize, tuning, "compact-test");
    const entities = assignIslandEntities({
      count: 3,
      gridSize,
      seed: "compact-test",
      tuning,
    });

    const compact = compactIslandTiles(allTiles, entities, gridSize, tuning.islandShape);

    expect(compact.length).toBeLessThan(allTiles.length);
    expect(compact.length / entities.length).toBeLessThanOrEqual(3);
    expect(compact.length / entities.length).toBeGreaterThanOrEqual(1.5);
  });

  it("keeps the full oval when entities fill at least half the island", () => {
    const gridSize = 4;
    const tuning = { ...DEFAULT_ISLAND_TUNING, islandShape: "oval" as const };
    const allTiles = buildIslandTiles(gridSize, tuning, "dense-test");
    const capacity = allTiles.length;
    const entities = assignIslandEntities({
      count: Math.ceil(capacity * 0.5),
      gridSize,
      seed: "dense-test",
      tuning,
    });

    expect(compactIslandTiles(allTiles, entities, gridSize, tuning.islandShape)).toHaveLength(
      allTiles.length,
    );
  });

  it("assigns random spawn order to grass tiles", () => {
    const tiles = buildIslandTiles(4, DEFAULT_ISLAND_TUNING, "tile-spawn-order");
    const spawnIndices = tiles.map((tile) => tile.spawnIndex);
    expect(new Set(spawnIndices).size).toBe(tiles.length);
  });

  it("preserves iso grid spread when baselineAlign is full", () => {
    const tiles = buildIslandTiles(4, {
      ...DEFAULT_ISLAND_TUNING,
      islandShape: "circle",
      baselineAlign: 1,
    });
    const isoYs = new Set(tiles.map((tile) => tile.y));
    expect(isoYs.size).toBeGreaterThan(1);

    const surfaceYs = tiles.map((tile) => tile.y + tile.baselineOffset);
    expect(new Set(surfaceYs).size).toBe(1);
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

  it("computes responsive island scale from container and content span", () => {
    const scale = computeResponsiveIslandScale({
      boost: 1.25,
      containerHeight: 320,
      containerWidth: 512,
      contentSpan: 280,
      viewBoxHeight: 400,
      viewBoxWidth: 600,
    });

    expect(scale).toBeGreaterThan(1);
    expect(scale).toBeCloseTo(1.25 * ((0.92 * 512) / (280 * Math.min(512 / 600, 320 / 400))), 5);
  });

  it("uses one shared viewBox envelope for carousel slides", () => {
    const shared = computeSharedIslandViewBoxBounds(
      [
        { entityType: "tree", iconCount: 23, seed: "trees-shared" },
        { entityType: "person", iconCount: 31, seed: "people-shared" },
      ],
      DEFAULT_ISLAND_TUNING,
      48,
      { tightTop: true },
    );

    const treeBounds = computeIslandViewBoxBoundsFromTiles(
      buildIslandTiles(
        gridDimensionForCount(
          23,
          DEFAULT_ISLAND_TUNING.islandShape,
          DEFAULT_ISLAND_TUNING.maxGridSize,
        ),
        DEFAULT_ISLAND_TUNING,
        "trees-shared",
      ),
      DEFAULT_ISLAND_TUNING,
      48,
      { entityType: "tree", tightTop: true },
    );

    const peopleTiles = compactIslandTiles(
      buildIslandTiles(
        gridDimensionForCount(
          31,
          DEFAULT_ISLAND_TUNING.islandShape,
          DEFAULT_ISLAND_TUNING.maxGridSize,
        ),
        DEFAULT_ISLAND_TUNING,
        "people-shared",
      ),
      assignIslandEntities({
        count: 31,
        gridSize: gridDimensionForCount(
          31,
          DEFAULT_ISLAND_TUNING.islandShape,
          DEFAULT_ISLAND_TUNING.maxGridSize,
        ),
        seed: "people-shared",
        tuning: DEFAULT_ISLAND_TUNING,
      }),
      gridDimensionForCount(
        31,
        DEFAULT_ISLAND_TUNING.islandShape,
        DEFAULT_ISLAND_TUNING.maxGridSize,
      ),
      DEFAULT_ISLAND_TUNING.islandShape,
    );

    const peopleBounds = computeIslandViewBoxBoundsFromTiles(
      peopleTiles,
      DEFAULT_ISLAND_TUNING,
      48,
      {
        entityType: "person",
        tightTop: true,
      },
    );

    expect(shared.height).toBeGreaterThanOrEqual(treeBounds.height);
    expect(shared.height).toBeGreaterThanOrEqual(peopleBounds.height);
    expect(shared.width).toBeGreaterThanOrEqual(treeBounds.width);
    expect(shared.width).toBeGreaterThanOrEqual(peopleBounds.width);
  });
});
