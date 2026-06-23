import { computeDespawnDelays, computeStaggerDelays } from "@/lib/impact-metaphors/slide-timing";

/** Static pause after spawn completes — carousel only. */
export const ISLAND_CAROUSEL_HOLD_MS = 2800;
/** Gentle float before despawn — carousel only. */
export const ISLAND_CAROUSEL_FLOAT_MS = 3600;

export const ISLAND_SPAWN_BUDGET_MS = 6200;
export const ISLAND_DESPAWN_BUDGET_MS = 2200;

export const ISLAND_TILE_SPAWN_FRACTION = 0.68;
export const ISLAND_ENTITY_START_FRACTION = 0.42;
export const ISLAND_TILE_DESPAWN_START_FRACTION = 0.58;

/** Pop-in duration for grass tiles (ms). */
export const ISLAND_TILE_POP_MS = 760;
/** Pop-in duration for trees/people (ms). */
export const ISLAND_ENTITY_POP_MS = 920;

export type IslandCarouselPhase = "despawn" | "float" | "hold" | "spawn";

export type IslandCarouselTimeline = {
  despawnMs: number;
  floatMs: number;
  holdMs: number;
  spawnMs: number;
  totalMs: number;
};

export function computeIslandSpawnBudget(count: number): number {
  if (count <= 0) return 0;
  return Math.min(ISLAND_SPAWN_BUDGET_MS, 650 + count * 78);
}

export function computeIslandDespawnBudget(count: number): number {
  if (count <= 0) return 0;
  return Math.min(ISLAND_DESPAWN_BUDGET_MS, 420 + count * 32);
}

export function computeIslandSpawnEndMs(tileCount: number, entityCount: number): number {
  const tileBudget = computeIslandSpawnBudget(tileCount) * ISLAND_TILE_SPAWN_FRACTION;
  const tileDelays = computeStaggerDelays(tileCount, tileBudget);
  const lastTileDelay = tileDelays[Math.max(tileCount - 1, 0)] ?? 0;
  const tileEnd = lastTileDelay + ISLAND_TILE_POP_MS;

  const entityBudget = computeIslandSpawnBudget(entityCount);
  const entityStart = tileBudget * ISLAND_ENTITY_START_FRACTION;
  const entityDelays = computeStaggerDelays(entityCount, entityBudget);
  const lastEntityDelay = entityStart + (entityDelays[Math.max(entityCount - 1, 0)] ?? 0);
  const entityEnd = lastEntityDelay + ISLAND_ENTITY_POP_MS;

  return Math.max(tileEnd, entityEnd, 0);
}

export function computeIslandDespawnEndMs(tileCount: number, entityCount: number): number {
  const entityBudget = computeIslandDespawnBudget(entityCount);
  const entityDelays = computeDespawnDelays(entityCount, entityBudget);
  const entityLead = entityDelays[0] ?? 0;
  const entityEnd = entityLead + ISLAND_ENTITY_POP_MS * 0.55;

  const tileBudget = computeIslandDespawnBudget(tileCount);
  const tileStart = entityBudget * ISLAND_TILE_DESPAWN_START_FRACTION;
  const tileDelays = computeDespawnDelays(tileCount, tileBudget);
  const tileLead = tileStart + (tileDelays[0] ?? 0);
  const tileEnd = tileLead + ISLAND_TILE_POP_MS * 0.55;

  return Math.max(entityEnd, tileEnd, 0);
}

export function computeIslandCarouselTimeline(
  tileCount: number,
  entityCount: number,
): IslandCarouselTimeline {
  const spawnMs = computeIslandSpawnEndMs(tileCount, entityCount);
  const holdMs = ISLAND_CAROUSEL_HOLD_MS;
  const floatMs = ISLAND_CAROUSEL_FLOAT_MS;
  const despawnMs = computeIslandDespawnEndMs(tileCount, entityCount);

  return {
    spawnMs,
    holdMs,
    floatMs,
    despawnMs,
    totalMs: spawnMs + holdMs + floatMs + despawnMs,
  };
}
