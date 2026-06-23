"use client";

import { IslandMetaphorCarousel } from "@/components/impact-metaphors/island/island-metaphor-carousel";
import type { MetaphorUnit } from "@/lib/impact-metaphors";
import type { IslandTuning } from "@/lib/impact-metaphors/island-tuning";

const ISLAND_METAPHOR_IDS = new Set<MetaphorUnit["id"]>(["people", "trees"]);

export function ImpactMetaphorCarousel({
  fitToContainer = false,
  paused = false,
  seedPrefix = "impact",
  tuning,
  units,
}: {
  fitToContainer?: boolean;
  paused?: boolean;
  seedPrefix?: string;
  tuning?: IslandTuning;
  units: MetaphorUnit[];
}) {
  const islandUnits = units.filter((unit) => ISLAND_METAPHOR_IDS.has(unit.id));

  return (
    <IslandMetaphorCarousel
      fillContainer={fitToContainer}
      headlineOverlay
      paused={paused}
      seedPrefix={seedPrefix}
      showHeadline={false}
      showSlideDots
      tuning={tuning}
      units={islandUnits}
      viewport={fitToContainer ? "tv" : "mobile"}
    />
  );
}
