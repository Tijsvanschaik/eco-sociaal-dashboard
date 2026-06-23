export type MetaphorSlidePhase = "spawn" | "idle" | "despawn";

export const METAPHOR_ROTATION_MS = 9000;
export const METAPHOR_SPAWN_BUDGET_MS = 3200;
export const METAPHOR_DESPAWN_BUDGET_MS = 900;

export function computeSpawnDuration(count: number): number {
  if (count <= 0) return 0;
  return Math.min(METAPHOR_SPAWN_BUDGET_MS, 400 + count * 52);
}

export function computeDespawnDuration(count: number): number {
  if (count <= 0) return 0;
  return Math.min(METAPHOR_DESPAWN_BUDGET_MS, 280 + count * 16);
}

/** Accelerating stagger — first icon waits longest gap, later icons spawn faster. */
export function computeStaggerDelays(count: number, totalMs: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];

  const gaps = Array.from({ length: count - 1 }, (_, index) => 1 / (index + 1));
  const gapSum = gaps.reduce((sum, gap) => sum + gap, 0);
  const delays = [0];
  let elapsed = 0;

  for (const gap of gaps) {
    elapsed += (gap / gapSum) * totalMs;
    delays.push(elapsed);
  }

  return delays;
}

/** Last spawned icon despawn first (reverse order, same accelerating rhythm). */
export function computeDespawnDelays(count: number, totalMs: number): number[] {
  const spawnDelays = computeStaggerDelays(count, totalMs);
  return spawnDelays.map((_, index) => spawnDelays[count - 1 - index] ?? 0);
}
