import { describe, expect, it } from "vitest";

import {
  computeDespawnDelays,
  computeSpawnDuration,
  computeStaggerDelays,
} from "@/lib/impact-metaphors/slide-timing";

describe("slide-timing", () => {
  it("accelerates spawn delays toward the end", () => {
    const delays = computeStaggerDelays(8, 2000);

    expect(delays[0]).toBe(0);
    expect(delays.at(-1)).toBeCloseTo(2000, 0);
    const firstGap = (delays[1] ?? 0) - (delays[0] ?? 0);
    const lastGap = (delays.at(-1) ?? 0) - (delays.at(-2) ?? 0);
    expect(firstGap).toBeGreaterThan(lastGap);
  });

  it("despawns in reverse spawn order", () => {
    const spawn = computeStaggerDelays(5, 1000);
    const despawn = computeDespawnDelays(5, 1000);

    expect(despawn[4]).toBe(spawn[0]);
    expect(despawn[0]).toBe(spawn[4]);
  });

  it("scales spawn duration with icon count", () => {
    expect(computeSpawnDuration(0)).toBe(0);
    expect(computeSpawnDuration(5)).toBeLessThan(computeSpawnDuration(30));
  });
});
