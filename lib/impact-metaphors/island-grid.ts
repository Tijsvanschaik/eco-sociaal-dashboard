import type {
  GrassVariantId,
  PersonVariantId,
  TreeVariantId,
} from "@/lib/impact-metaphors/island-assets";
import {
  ISLAND_GRASS_VARIANTS,
  ISLAND_PERSON_VARIANTS,
  ISLAND_TREE_VARIANTS,
  personRenderSize,
  treeRenderSize,
} from "@/lib/impact-metaphors/island-assets";
import {
  type IslandGridCell,
  getIslandCells,
  isCellInIslandShape,
  islandCellCapacity,
  maxDepthAmongCells,
} from "@/lib/impact-metaphors/island-shape";
import type { IslandShape } from "@/lib/impact-metaphors/island-shape";
import { DEFAULT_ISLAND_SHAPE } from "@/lib/impact-metaphors/island-shape";
import {
  DEFAULT_ISLAND_TUNING,
  type IslandTuning,
  cloneIslandTuning,
} from "@/lib/impact-metaphors/island-tuning";

/** @deprecated Use DEFAULT_ISLAND_TUNING.tileWidth — kept for legacy imports. */
export const ISO_TILE_WIDTH = DEFAULT_ISLAND_TUNING.tileWidth;
/** @deprecated Use DEFAULT_ISLAND_TUNING.tileHeight */
export const ISO_TILE_HEIGHT = DEFAULT_ISLAND_TUNING.tileHeight;
/** @deprecated Use DEFAULT_ISLAND_TUNING.tileGap */
export const ISO_TILE_GAP = DEFAULT_ISLAND_TUNING.tileGap;
/** @deprecated Use DEFAULT_ISLAND_TUNING.tileSpriteScale */
export const ISO_TILE_SPRITE_SCALE = DEFAULT_ISLAND_TUNING.tileSpriteScale;

export type GridCell = IslandGridCell;

export type IslandEntityPlacement = GridCell & {
  baselineOffset: number;
  depth: number;
  id: string;
  personVariant: PersonVariantId;
  treeVariant: TreeVariantId;
  renderY: number;
  spawnIndex: number;
  team: string;
  plantedAt: string;
  x: number;
};

export type IslandTile = GridCell & {
  baselineOffset: number;
  depth: number;
  grassVariant: GrassVariantId;
  renderY: number;
  spawnIndex: number;
  x: number;
  y: number;
};

export const DEFAULT_ISLAND_TILE_SEED = "island";

export const ISLAND_MIN_GRID_SIZE = 4;

/** Prefer at least this entity-to-grass ratio before using the full oval footprint. */
export const ISLAND_FULL_SHAPE_FILL_THRESHOLD = 0.48;
/** Target fill when compacting sparse islands. */
export const ISLAND_COMPACT_TARGET_FILL = 0.58;

/** Allowed grid dimensions (cells per side). */
export const ISLAND_GRID_SIZES = [4, 8, 16, 32, 64] as const;

export type IslandGridSize = (typeof ISLAND_GRID_SIZES)[number];

/** Production default — keeps tile + entity count bounded for smooth carousel animation. */
export const ISLAND_MAX_GRID_SIZE: IslandGridSize = 8;

export function clampIslandMaxGridSize(maxGridSize: number): IslandGridSize {
  const allowed = ISLAND_GRID_SIZES.filter((size) => size <= maxGridSize);
  return allowed.at(-1) ?? ISLAND_MIN_GRID_SIZE;
}

export function gridDimensionForCount(
  count: number,
  shape: IslandShape = DEFAULT_ISLAND_SHAPE,
  maxGridSize: number = ISLAND_MAX_GRID_SIZE,
): number {
  if (count <= 0) return ISLAND_MIN_GRID_SIZE;

  const cappedMax = clampIslandMaxGridSize(maxGridSize);
  const sizes = ISLAND_GRID_SIZES.filter((size) => size <= cappedMax);

  let bestSize: number | null = null;
  let bestFill = -1;

  for (const size of sizes) {
    const capacity = islandCellCapacity(size, shape);
    if (capacity < count) continue;

    const fill = count / capacity;
    if (fill > bestFill || (fill === bestFill && bestSize !== null && size < bestSize)) {
      bestFill = fill;
      bestSize = size;
    }
  }

  return bestSize ?? cappedMax;
}

function cellKey(col: number, row: number): string {
  return `${col}:${row}`;
}

function neighborCells(
  col: number,
  row: number,
  gridSize: number,
  shape: IslandShape,
): IslandGridCell[] {
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ] as const;

  return deltas
    .map(([dCol, dRow]) => ({ col: col + dCol, row: row + dRow }))
    .filter((cell) => isCellInIslandShape(cell.col, cell.row, gridSize, shape));
}

function pickCellsForEntities({
  cells,
  count,
  gridSize,
  seed,
  shape,
}: {
  cells: GridCell[];
  count: number;
  gridSize: number;
  seed: string;
  shape: IslandShape;
}): GridCell[] {
  if (count <= 0 || cells.length === 0) return [];

  const capped = Math.min(count, cells.length);
  const cellByKey = new Map(cells.map((cell) => [cellKey(cell.col, cell.row), cell]));
  const random = mulberry32(hashSeed(`${seed}-pick-start`));
  const start = cells[Math.floor(random() * cells.length)];
  if (!start) return [];

  const picked: GridCell[] = [];
  const visited = new Set<string>();
  const queue: GridCell[] = [start];

  while (picked.length < capped && queue.length > 0) {
    const cell = queue.shift();
    if (!cell) break;

    const key = cellKey(cell.col, cell.row);
    if (visited.has(key)) continue;
    visited.add(key);
    picked.push(cell);

    const neighbors = shuffleWithSeed(
      neighborCells(cell.col, cell.row, gridSize, shape).filter((neighbor) =>
        cellByKey.has(cellKey(neighbor.col, neighbor.row)),
      ),
      `${seed}-pick-${key}`,
    );

    for (const neighbor of neighbors) {
      const neighborKey = cellKey(neighbor.col, neighbor.row);
      if (!visited.has(neighborKey)) queue.push(neighbor);
    }
  }

  return picked;
}

function findCellNearestToCentroid(cells: GridCell[]): GridCell {
  const avgCol = cells.reduce((sum, cell) => sum + cell.col, 0) / cells.length;
  const avgRow = cells.reduce((sum, cell) => sum + cell.row, 0) / cells.length;

  let nearest = cells[0] as GridCell;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const cell of cells) {
    const distance = Math.hypot(cell.col - avgCol, cell.row - avgRow);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = cell;
    }
  }

  return nearest;
}

/** Adds in-shape cells fully enclosed by active orthogonal neighbors. */
function fillIslandInteriorGaps(active: Set<string>, gridSize: number, shape: IslandShape): void {
  let changed = true;

  while (changed) {
    changed = false;

    for (let col = 0; col < gridSize; col++) {
      for (let row = 0; row < gridSize; row++) {
        const key = cellKey(col, row);
        if (active.has(key) || !isCellInIslandShape(col, row, gridSize, shape)) continue;

        const orthoNeighbors = [
          [col - 1, row],
          [col + 1, row],
          [col, row - 1],
          [col, row + 1],
        ] as const;

        const inShape = orthoNeighbors.filter(([c, r]) =>
          isCellInIslandShape(c, r, gridSize, shape),
        );

        if (inShape.length >= 3 && inShape.every(([c, r]) => active.has(cellKey(c, r)))) {
          active.add(key);
          changed = true;
        }
      }
    }
  }
}

/** Drops outer grass when the island would look sparse; always keeps one connected blob. */
export function compactIslandTiles(
  tiles: IslandTile[],
  entities: IslandEntityPlacement[],
  gridSize: number,
  shape: IslandShape,
): IslandTile[] {
  if (tiles.length === 0 || entities.length === 0) return tiles;

  const capacity = tiles.length;
  const fillRatio = entities.length / capacity;
  if (fillRatio >= ISLAND_FULL_SHAPE_FILL_THRESHOLD) return tiles;

  const targetSize = Math.min(
    capacity,
    Math.max(entities.length + 1, Math.ceil(entities.length / ISLAND_COMPACT_TARGET_FILL)),
  );

  const tileKeys = new Set(tiles.map((tile) => cellKey(tile.col, tile.row)));
  const entityCells = entities.map(({ col, row }) => ({ col, row }));
  const seed = findCellNearestToCentroid(entityCells);
  const active = new Set<string>();
  const queue: GridCell[] = [seed];

  while (active.size < targetSize && queue.length > 0) {
    const cell = queue.shift();
    if (!cell) break;

    const key = cellKey(cell.col, cell.row);
    if (!tileKeys.has(key) || active.has(key)) continue;

    active.add(key);

    const neighbors = shuffleWithSeed(
      neighborCells(cell.col, cell.row, gridSize, shape).filter((neighbor) =>
        tileKeys.has(cellKey(neighbor.col, neighbor.row)),
      ),
      `${key}-compact`,
    );

    for (const neighbor of neighbors) {
      const neighborKey = cellKey(neighbor.col, neighbor.row);
      if (active.has(neighborKey)) continue;
      queue.push(neighbor);
      if (active.size >= targetSize) break;
    }
  }

  for (const entity of entityCells) {
    active.add(cellKey(entity.col, entity.row));
  }

  fillIslandInteriorGaps(active, gridSize, shape);

  return tiles.filter((tile) => active.has(cellKey(tile.col, tile.row)));
}

function resolveTuning(tuning?: IslandTuning): IslandTuning {
  return tuning ?? DEFAULT_ISLAND_TUNING;
}

function isoCellStepX(tuning: IslandTuning): number {
  return tuning.tileWidth / 2 + tuning.tileGap / 2;
}

function isoCellStepY(tuning: IslandTuning): number {
  return tuning.tileHeight / 2 + tuning.tileGap / 2;
}

function maxCellDepthSum(gridSize: number, shape: IslandShape): number {
  if (shape === "square") {
    return (gridSize - 1) * 2;
  }

  return maxDepthAmongCells(getIslandCells(gridSize, shape));
}

export function cellDepth(col: number, row: number): number {
  return col + row;
}

export function islandCellAnchor(
  col: number,
  row: number,
  gridSize: number,
  tuning?: IslandTuning,
): { baselineOffset: number; depth: number; renderY: number; x: number; y: number } {
  const t = resolveTuning(tuning);
  const x = (col - row) * isoCellStepX(t);
  const y = (col + row) * isoCellStepY(t);
  const maxDepth = maxCellDepthSum(gridSize, t.islandShape);
  const baselineOffset = (maxDepth - (col + row)) * isoCellStepY(t) * t.baselineAlign;

  return {
    x,
    y,
    renderY: y,
    baselineOffset,
    depth: cellDepth(col, row),
  };
}

export function gridToScreen(
  col: number,
  row: number,
  tuning?: IslandTuning,
): { x: number; y: number } {
  const t = resolveTuning(tuning);
  return {
    x: (col - row) * isoCellStepX(t),
    y: (col + row) * isoCellStepY(t),
  };
}

export function buildIslandTiles(
  gridSize: number,
  tuning?: IslandTuning,
  seed: string = DEFAULT_ISLAND_TILE_SEED,
): IslandTile[] {
  const t = resolveTuning(tuning);
  const cells = getIslandCells(gridSize, t.islandShape);

  const spawnOrder = assignSpawnIndices(cells.length, `${seed}-tile-spawn`);

  const tiles = cells.map((cell, index) => {
    const anchor = islandCellAnchor(cell.col, cell.row, gridSize, t);
    const random = mulberry32(hashSeed(`${seed}-grass-${cell.col}-${cell.row}`));
    const grassVariant =
      ISLAND_GRASS_VARIANTS[Math.floor(random() * ISLAND_GRASS_VARIANTS.length)]?.id ?? "grass1";
    return {
      col: cell.col,
      row: cell.row,
      x: anchor.x,
      y: anchor.y,
      renderY: anchor.renderY,
      baselineOffset: anchor.baselineOffset,
      depth: anchor.depth,
      grassVariant,
      spawnIndex: spawnOrder[index] ?? index,
    };
  });

  return tiles.sort((a, b) => a.depth - b.depth || a.col - b.col);
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index++) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle with a stable seeded PRNG. */
export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const random = mulberry32(hashSeed(seed));
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex] as T;
    shuffled[swapIndex] = current as T;
  }

  return shuffled;
}

function assignSpawnIndices(count: number, seed: string): number[] {
  return shuffleWithSeed(
    Array.from({ length: count }, (_, index) => index),
    seed,
  );
}

const MOCK_TEAMS = ["Team Helmond", "Team Asten", "Team Deurne", "Team Peel", "Team Maas"];

export function assignIslandEntities({
  count,
  gridSize,
  seed,
  tuning,
}: {
  count: number;
  gridSize: number;
  seed: string;
  tuning?: IslandTuning;
}): IslandEntityPlacement[] {
  if (count <= 0) return [];

  const t = resolveTuning(tuning);
  const tileCells = buildIslandTiles(gridSize, t, seed).map(({ col, row }) => ({ col, row }));
  const capped = Math.min(count, tileCells.length);
  const chosenCells = pickCellsForEntities({
    cells: tileCells,
    count: capped,
    gridSize,
    seed,
    shape: t.islandShape,
  });
  const spawnOrder = assignSpawnIndices(chosenCells.length, `${seed}-entity-spawn`);

  return chosenCells.map((cell, index) => {
    const random = mulberry32(hashSeed(`${seed}-${cell.col}-${cell.row}-${index}`));
    const team = MOCK_TEAMS[Math.floor(random() * MOCK_TEAMS.length)] as string;
    const day = 1 + Math.floor(random() * 28);
    const month = 1 + Math.floor(random() * 12);
    const anchor = islandCellAnchor(cell.col, cell.row, gridSize, t);
    const personVariant =
      ISLAND_PERSON_VARIANTS[Math.floor(random() * ISLAND_PERSON_VARIANTS.length)]?.id ?? "man1";
    const treeVariant =
      ISLAND_TREE_VARIANTS[Math.floor(random() * ISLAND_TREE_VARIANTS.length)]?.id ?? "tree1";
    return {
      ...cell,
      depth: anchor.depth,
      id: `${seed}-${cell.col}-${cell.row}`,
      renderY: anchor.renderY,
      baselineOffset: anchor.baselineOffset,
      spawnIndex: spawnOrder[index] ?? index,
      personVariant,
      treeVariant,
      team,
      plantedAt: `${day} ${DUTCH_MONTHS[month - 1]}`,
      x: anchor.x,
    };
  });
}

const DUTCH_MONTHS = [
  "jan",
  "feb",
  "mrt",
  "apr",
  "mei",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
];

export function computeIslandViewBox(
  gridSize: number,
  tuning?: IslandTuning,
  padding = 48,
): string {
  const bounds = computeIslandViewBoxBounds(gridSize, tuning, padding);
  return `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`;
}

export type IslandViewBoxBounds = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export function computeIslandViewBoxBounds(
  gridSize: number,
  tuning?: IslandTuning,
  padding = 48,
): IslandViewBoxBounds {
  const tiles = buildIslandTiles(gridSize, tuning);
  return computeIslandViewBoxBoundsFromTiles(tiles, tuning, padding);
}

/** Vertical extent of trees/person sprites above the grass surface anchor. */
export function computeEntityOverhangAboveSurface(
  tuning?: IslandTuning,
  entityType: "person" | "tree" = "tree",
): number {
  const t = resolveTuning(tuning);
  const nudge = t.tileWidth * (entityType === "tree" ? 0.08 : 0.04);
  const size = entityType === "tree" ? treeRenderSize(t, "tree1") : personRenderSize(t, "man1");
  const top = size.y - nudge;

  return Math.abs(Math.min(0, top)) + t.tileHeight * 0.15;
}

export type IslandViewBoxOptions = {
  entityType?: "person" | "tree";
  /** Less empty space above the island when the headline sits outside the SVG. */
  tightTop?: boolean;
};

export function computeIslandViewBoxBoundsFromTiles(
  tiles: IslandTile[],
  tuning?: IslandTuning,
  padding = 48,
  options?: IslandViewBoxOptions,
): IslandViewBoxBounds {
  const t = resolveTuning(tuning);
  if (tiles.length === 0) {
    return { x: -padding, y: -padding, width: padding * 2, height: padding * 2 };
  }

  const entityType = options?.entityType ?? "tree";
  const tightTop = options?.tightTop ?? false;
  const xs = tiles.map((tile) => tile.x);
  const surfaceYs = tiles.map((tile) => tile.y + tile.baselineOffset);
  const minX = Math.min(...xs) - t.tileWidth;
  const maxX = Math.max(...xs) + t.tileWidth;
  const entityOverhang = computeEntityOverhangAboveSurface(t, entityType);
  const scaleCushion = t.tileHeight * Math.max(0, t.islandScale - 1) * (tightTop ? 0.75 : 2.5);
  const topMargin = tightTop
    ? entityOverhang + scaleCushion + t.tileHeight * 0.1
    : Math.max(t.tileHeight * 5, entityOverhang + scaleCushion);
  const minY = Math.min(...surfaceYs) - topMargin;
  const maxY = Math.max(...surfaceYs) + t.tileHeight * 1.35;
  const horizontalPadding = tightTop ? Math.min(padding, 28) : padding;
  const topPadding = tightTop ? 4 : padding;
  const bottomPadding = tightTop ? 16 : padding;

  return {
    x: minX - horizontalPadding,
    y: minY - topPadding,
    width: maxX - minX + horizontalPadding * 2,
    height: maxY - minY + topPadding + bottomPadding,
  };
}

export function computeIslandViewBoxFromTiles(
  tiles: IslandTile[],
  tuning?: IslandTuning,
  padding = 48,
  options?: IslandViewBoxOptions,
): string {
  const bounds = computeIslandViewBoxBoundsFromTiles(tiles, tuning, padding, options);
  return formatIslandViewBox(bounds);
}

export function formatIslandViewBox(bounds: IslandViewBoxBounds): string {
  return `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`;
}

export type IslandStageLayoutInput = {
  entityType: "person" | "tree";
  iconCount: number;
  seed: string;
};

export function buildIslandStageTiles(
  iconCount: number,
  seed: string,
  tuning?: IslandTuning,
): {
  entities: IslandEntityPlacement[];
  gridSize: number;
  tiles: IslandTile[];
} {
  const t = resolveTuning(tuning);
  const gridSize = gridDimensionForCount(iconCount, t.islandShape, t.maxGridSize);
  const allTiles = buildIslandTiles(gridSize, t, seed);
  const entityCount = Math.min(iconCount, allTiles.length);
  const entities = sortEntitiesForRender(
    assignIslandEntities({ count: entityCount, gridSize, seed, tuning: t }),
  );
  const tiles = compactIslandTiles(allTiles, entities, gridSize, t.islandShape);

  return { entities, gridSize, tiles };
}

/** One viewBox envelope for carousel slides so the stage height does not shift. */
export function computeSharedIslandViewBoxBounds(
  layouts: IslandStageLayoutInput[],
  tuning?: IslandTuning,
  padding = 48,
  options?: Omit<IslandViewBoxOptions, "entityType">,
): IslandViewBoxBounds {
  if (layouts.length === 0) {
    return { x: -padding, y: -padding, height: padding * 2, width: padding * 2 };
  }

  const t = resolveTuning(tuning);
  const tightTop = options?.tightTop ?? false;
  const slideMetrics = layouts.map(({ entityType, iconCount, seed }) => {
    const { tiles } = buildIslandStageTiles(iconCount, seed, tuning);
    const xs = tiles.map((tile) => tile.x);
    const surfaceYs = tiles.map((tile) => tile.y + tile.baselineOffset);

    return {
      maxX: Math.max(...xs) + t.tileWidth,
      maxSurfaceY: Math.max(...surfaceYs),
      minX: Math.min(...xs) - t.tileWidth,
      minSurfaceY: Math.min(...surfaceYs),
      overhang: computeEntityOverhangAboveSurface(t, entityType),
    };
  });

  const minX = Math.min(...slideMetrics.map((metric) => metric.minX));
  const maxX = Math.max(...slideMetrics.map((metric) => metric.maxX));
  const minSurfaceY = Math.min(...slideMetrics.map((metric) => metric.minSurfaceY));
  const maxSurfaceY = Math.max(...slideMetrics.map((metric) => metric.maxSurfaceY));
  const maxOverhang = Math.max(...slideMetrics.map((metric) => metric.overhang));
  const scaleCushion = t.tileHeight * Math.max(0, t.islandScale - 1) * (tightTop ? 0.75 : 2.5);
  const topMargin = tightTop
    ? maxOverhang + scaleCushion + t.tileHeight * 0.1
    : Math.max(t.tileHeight * 5, maxOverhang + scaleCushion);
  const horizontalPadding = tightTop ? Math.min(padding, 28) : padding;
  const topPadding = tightTop ? 4 : padding;
  const bottomPadding = tightTop ? 16 : padding;
  const minY = minSurfaceY - topMargin;
  const maxY = maxSurfaceY + t.tileHeight * 1.35;

  return {
    x: minX - horizontalPadding,
    y: minY - topPadding,
    width: maxX - minX + horizontalPadding * 2,
    height: maxY - minY + topPadding + bottomPadding,
  };
}

/** Horizontal span of tile anchors plus sprite overhang (trees/grass). */
export function computeIslandHorizontalSpan(gridSize: number, tuning?: IslandTuning): number {
  return computeIslandHorizontalSpanFromTiles(buildIslandTiles(gridSize, tuning), tuning);
}

export function computeIslandHorizontalSpanFromTiles(
  tiles: IslandTile[],
  tuning?: IslandTuning,
): number {
  const t = resolveTuning(tuning);
  if (tiles.length === 0) return t.tileWidth * 4;

  const xs = tiles.map((tile) => tile.x);
  const margin = t.tileWidth * 1.25;

  return Math.max(...xs) - Math.min(...xs) + margin * 2;
}

export function computeResponsiveIslandScale({
  boost = 1,
  containerHeight,
  containerWidth,
  contentSpan,
  fillRatio = 0.92,
  viewBoxHeight,
  viewBoxWidth,
}: {
  boost?: number;
  containerHeight: number;
  containerWidth: number;
  contentSpan: number;
  fillRatio?: number;
  viewBoxHeight: number;
  viewBoxWidth: number;
}): number {
  if (contentSpan <= 0 || viewBoxWidth <= 0 || viewBoxHeight <= 0) {
    return boost;
  }

  if (containerWidth <= 0 || containerHeight <= 0) {
    return ((fillRatio * viewBoxWidth) / contentSpan) * boost;
  }

  const viewportScale = Math.min(containerWidth / viewBoxWidth, containerHeight / viewBoxHeight);
  if (viewportScale <= 0) return boost;

  return ((fillRatio * containerWidth) / (contentSpan * viewportScale)) * boost;
}

export function sortEntitiesForRender<T extends { depth: number; col: number }>(
  entities: T[],
): T[] {
  return [...entities].sort((a, b) => a.depth - b.depth || a.col - b.col);
}

export { cloneIslandTuning, DEFAULT_ISLAND_TUNING };
