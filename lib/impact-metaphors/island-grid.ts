export const ISO_TILE_WIDTH = 68;
export const ISO_TILE_HEIGHT = 34;

export type GridCell = {
  col: number;
  row: number;
};

export type IslandEntityPlacement = GridCell & {
  depth: number;
  id: string;
  spawnIndex: number;
  team: string;
  plantedAt: string;
};

export type IslandTile = GridCell & {
  depth: number;
  x: number;
  y: number;
};

/** Grid side length grows with entity count (briefing: 4 → 8 → 16 → 32 → 64). */
export function gridDimensionForCount(count: number): number {
  if (count <= 16) return 4;
  if (count <= 64) return 8;
  if (count <= 256) return 16;
  if (count <= 1024) return 32;
  return 64;
}

export function gridToScreen(col: number, row: number): { x: number; y: number } {
  return {
    x: (col - row) * (ISO_TILE_WIDTH / 2),
    y: (col + row) * (ISO_TILE_HEIGHT / 2),
  };
}

export function cellDepth(col: number, row: number): number {
  return col + row;
}

export function buildIslandTiles(gridSize: number): IslandTile[] {
  const tiles: IslandTile[] = [];

  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row < gridSize; row++) {
      const { x, y } = gridToScreen(col, row);
      tiles.push({ col, row, x, y, depth: cellDepth(col, row) });
    }
  }

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

const MOCK_TEAMS = ["Team Helmond", "Team Asten", "Team Deurne", "Team Peel", "Team Maas"];

/** Picks random unoccupied cells; stable for a given seed. */
export function assignIslandEntities({
  count,
  gridSize,
  seed,
}: {
  count: number;
  gridSize: number;
  seed: string;
}): IslandEntityPlacement[] {
  if (count <= 0) return [];

  const allCells: GridCell[] = [];
  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row < gridSize; row++) {
      allCells.push({ col, row });
    }
  }

  const random = mulberry32(hashSeed(seed));
  for (let index = allCells.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    const temp = allCells[index] as GridCell;
    allCells[index] = allCells[swapIndex] as GridCell;
    allCells[swapIndex] = temp;
  }

  const capped = Math.min(count, allCells.length);

  return allCells.slice(0, capped).map((cell, index) => {
    const team = MOCK_TEAMS[Math.floor(random() * MOCK_TEAMS.length)] as string;
    const day = 1 + Math.floor(random() * 28);
    const month = 1 + Math.floor(random() * 12);
    return {
      ...cell,
      depth: cellDepth(cell.col, cell.row),
      id: `${seed}-${cell.col}-${cell.row}`,
      spawnIndex: index,
      team,
      plantedAt: `${day} ${DUTCH_MONTHS[month - 1]}`,
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

export function computeIslandViewBox(gridSize: number, padding = 48): string {
  const tiles = buildIslandTiles(gridSize);
  const xs = tiles.map((tile) => tile.x);
  const ys = tiles.map((tile) => tile.y);
  const minX = Math.min(...xs) - ISO_TILE_WIDTH;
  const maxX = Math.max(...xs) + ISO_TILE_WIDTH;
  const minY = Math.min(...ys) - ISO_TILE_HEIGHT * 10;
  const maxY = Math.max(...ys) + ISO_TILE_HEIGHT * 3;

  const x = minX - padding;
  const y = minY - padding;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return `${x} ${y} ${width} ${height}`;
}

export function sortEntitiesForRender<T extends { depth: number; col: number }>(
  entities: T[],
): T[] {
  return [...entities].sort((a, b) => a.depth - b.depth || a.col - b.col);
}
