/** Percentage rectangle where icons must not spawn (text overlay). */
export type ExcludeZone = {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
};

/** Center band reserved for headline — icons spawn around it. */
export const METAPHOR_TEXT_EXCLUDE_ZONES: ExcludeZone[] = [
  { xMin: 8, xMax: 92, yMin: 28, yMax: 72 },
];

export type ScenePlacement = {
  rotation: number;
  scale: number;
  x: number;
  y: number;
  zIndex: number;
};

export type SceneLayoutBias = "bottom" | "center" | "none";

type CreateScenePlacementsOptions = {
  excludeZones?: ExcludeZone[];
  minDistance?: number;
  minPadding?: number;
  yBias?: SceneLayoutBias;
};

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
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

function isInExcludeZone(x: number, y: number, zones: ExcludeZone[]): boolean {
  return zones.some((zone) => x >= zone.xMin && x <= zone.xMax && y >= zone.yMin && y <= zone.yMax);
}

function sampleY(random: () => number, bias: SceneLayoutBias, minPadding: number): number {
  const span = 100 - minPadding * 2;
  if (bias === "bottom") {
    return minPadding + span * (0.38 + random() * 0.58);
  }
  if (bias === "center") {
    const centered = 0.5 + (random() - 0.5) * 0.8;
    return minPadding + span * centered;
  }
  return minPadding + random() * span;
}

function distance(a: ScenePlacement, x: number, y: number): number {
  return Math.hypot(a.x - x, a.y - y);
}

function isValidPlacement(
  x: number,
  y: number,
  placements: ScenePlacement[],
  minDistance: number,
  excludeZones: ExcludeZone[],
): boolean {
  if (isInExcludeZone(x, y, excludeZones)) return false;
  return !placements.some((placement) => distance(placement, x, y) < minDistance);
}

/**
 * Stable pseudo-random placements for metaphor scenes.
 * Positions are re-generated only when seed/count changes — not every render.
 */
export function createScenePlacements(
  count: number,
  seed: string,
  options: CreateScenePlacementsOptions = {},
): ScenePlacement[] {
  if (count <= 0) return [];

  const minPadding = options.minPadding ?? 8;
  const minDistance = options.minDistance ?? 6.5;
  const yBias = options.yBias ?? "none";
  const excludeZones = options.excludeZones ?? [];
  const random = mulberry32(hashSeed(seed));
  const span = 100 - minPadding * 2;
  const placements: ScenePlacement[] = [];

  for (let index = 0; index < count; index++) {
    let x = minPadding + random() * span;
    let y = sampleY(random, yBias, minPadding);
    let attempts = 0;

    while (attempts < 80 && !isValidPlacement(x, y, placements, minDistance, excludeZones)) {
      x = minPadding + random() * span;
      y = sampleY(random, yBias, minPadding);
      attempts++;
    }

    placements.push({
      x,
      y,
      scale: 0.8 + random() * 0.5,
      rotation: -14 + random() * 28,
      zIndex: 1 + Math.floor(random() * 12),
    });
  }

  return placements;
}

/** At least this many distinct bucket positions (guards against accidental stacking). */
export function countDistinctPlacementBuckets(placements: ScenePlacement[], precision = 0): number {
  const keys = new Set(
    placements.map(
      (placement) => `${placement.x.toFixed(precision)}:${placement.y.toFixed(precision)}`,
    ),
  );
  return keys.size;
}
