import { describe, expect, it } from "vitest";

import {
  computeIslandCarouselTimeline,
  computeIslandDespawnEndMs,
  computeIslandSpawnEndMs,
} from "@/lib/impact-metaphors/island-slide-timing";

describe("island-slide-timing", () => {
  it("spawn end grows with tile and entity counts", () => {
    const small = computeIslandSpawnEndMs(8, 3);
    const large = computeIslandSpawnEndMs(32, 18);
    expect(large).toBeGreaterThan(small);
  });

  it("carousel timeline includes hold and float pauses", () => {
    const timeline = computeIslandCarouselTimeline(16, 8);
    expect(timeline.totalMs).toBe(
      timeline.spawnMs + timeline.holdMs + timeline.floatMs + timeline.despawnMs,
    );
    expect(timeline.holdMs).toBeGreaterThan(2000);
    expect(timeline.floatMs).toBeGreaterThan(3000);
  });

  it("despawn end is non-zero for populated islands", () => {
    expect(computeIslandDespawnEndMs(12, 6)).toBeGreaterThan(400);
  });
});
