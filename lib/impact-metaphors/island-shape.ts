export type IslandShape = "circle" | "diamond" | "oval" | "square";

export type IslandGridCell = {
  col: number;
  row: number;
};

export const ISLAND_SHAPE_LABELS: Record<IslandShape, string> = {
  oval: "Ovaal (breed)",
  square: "Vierkant",
  circle: "Cirkel",
  diamond: "Ruit",
};

/** Default: wider than tall in iso screen space (uses horizontal layout better). */
export const DEFAULT_ISLAND_SHAPE: IslandShape = "oval";

/** Iso-horizontal (col − row) vs iso-vertical (col + row) stretch for oval. */
const OVAL_ISO_HORIZONTAL_STRETCH = 1.68;
const OVAL_ISO_VERTICAL_STRETCH = 0.68;

function shapeCenter(gridSize: number): { cx: number; cy: number } {
  return { cx: (gridSize - 1) / 2, cy: (gridSize - 1) / 2 };
}

function shapeRadius(gridSize: number): number {
  return gridSize / 2;
}

/** Oval mask in iso axes: u ≈ depth (col + row), v ≈ screen width (col − row). */
function ovalIsoAxes(dx: number, dy: number): { u: number; v: number } {
  return { u: dx + dy, v: dx - dy };
}

function ovalIsoRadii(gridSize: number): { uRadius: number; vRadius: number } {
  const base = shapeRadius(gridSize);
  return {
    vRadius: base * OVAL_ISO_HORIZONTAL_STRETCH,
    uRadius: base * OVAL_ISO_VERTICAL_STRETCH,
  };
}

function ellipseContains(a: number, b: number, aRadius: number, bRadius: number): boolean {
  return (a * a) / (aRadius * aRadius) + (b * b) / (bRadius * bRadius) <= 1;
}

export function isCellInIslandShape(
  col: number,
  row: number,
  gridSize: number,
  shape: IslandShape,
): boolean {
  if (shape === "square") return col >= 0 && row >= 0 && col < gridSize && row < gridSize;

  const { cx, cy } = shapeCenter(gridSize);
  const dx = col - cx;
  const dy = row - cy;

  if (shape === "oval") {
    const { u, v } = ovalIsoAxes(dx, dy);
    const { uRadius, vRadius } = ovalIsoRadii(gridSize);
    return ellipseContains(u, v, uRadius, vRadius);
  }

  if (shape === "circle") {
    const radius = shapeRadius(gridSize);
    return dx * dx + dy * dy <= radius * radius;
  }

  const radius = shapeRadius(gridSize);
  return Math.abs(dx) + Math.abs(dy) <= radius;
}

export function getIslandCells(gridSize: number, shape: IslandShape): IslandGridCell[] {
  const cells: IslandGridCell[] = [];

  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row < gridSize; row++) {
      if (isCellInIslandShape(col, row, gridSize, shape)) {
        cells.push({ col, row });
      }
    }
  }

  return cells;
}

export function islandCellCapacity(gridSize: number, shape: IslandShape): number {
  return getIslandCells(gridSize, shape).length;
}

export function maxDepthAmongCells(cells: IslandGridCell[]): number {
  if (cells.length === 0) return 0;
  return Math.max(...cells.map((cell) => cell.col + cell.row));
}

/** Approximate iso horizontal/vertical span of a shape (for layout checks). */
export function islandIsoSpan(gridSize: number, shape: IslandShape): { x: number; y: number } {
  const cells = getIslandCells(gridSize, shape);
  if (cells.length === 0) return { x: 0, y: 0 };

  const xs = cells.map((cell) => cell.col - cell.row);
  const ys = cells.map((cell) => cell.col + cell.row);

  return {
    x: Math.max(...xs) - Math.min(...xs),
    y: Math.max(...ys) - Math.min(...ys),
  };
}

/** Higher = further from the shape edge (better for sprites that overhang the cell). */
export function cellInsetScore(
  col: number,
  row: number,
  gridSize: number,
  shape: IslandShape,
): number {
  const { cx, cy } = shapeCenter(gridSize);
  const dx = col - cx;
  const dy = row - cy;
  const radius = shapeRadius(gridSize);

  if (shape === "square") {
    return radius - Math.max(Math.abs(dx), Math.abs(dy));
  }

  if (shape === "oval") {
    const { u, v } = ovalIsoAxes(dx, dy);
    const { uRadius, vRadius } = ovalIsoRadii(gridSize);
    return 1 - Math.hypot(u / uRadius, v / vRadius);
  }

  if (shape === "circle") {
    return radius - Math.hypot(dx, dy);
  }

  return radius - (Math.abs(dx) + Math.abs(dy));
}
