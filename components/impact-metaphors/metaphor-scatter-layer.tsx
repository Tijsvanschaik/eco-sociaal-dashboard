"use client";

import { type ReactNode, useMemo } from "react";

/** Inset + visible overflow so scaled icons are not clipped at slide edges. */
export const METAPHOR_SCENE_LAYER_CLASS =
  "pointer-events-none absolute inset-3 overflow-visible sm:inset-4";

import { ScatterIcon } from "@/components/impact-metaphors/scatter-icon";
import {
  type ExcludeZone,
  METAPHOR_TEXT_EXCLUDE_ZONES,
  type SceneLayoutBias,
  createScenePlacements,
} from "@/lib/impact-metaphors/scene-layout";
import {
  type MetaphorSlidePhase,
  computeDespawnDelays,
  computeDespawnDuration,
  computeSpawnDuration,
  computeStaggerDelays,
} from "@/lib/impact-metaphors/slide-timing";

type MetaphorScatterLayerProps = {
  className?: string;
  count: number;
  excludeZones?: ExcludeZone[];
  minDistance?: number;
  phase: MetaphorSlidePhase;
  renderIcon: (index: number) => ReactNode;
  seed: string;
  yBias?: SceneLayoutBias;
};

export function MetaphorScatterLayer({
  className,
  count,
  excludeZones = METAPHOR_TEXT_EXCLUDE_ZONES,
  minDistance,
  phase,
  renderIcon,
  seed,
  yBias = "none",
}: MetaphorScatterLayerProps) {
  const placements = useMemo(
    () => createScenePlacements(count, seed, { excludeZones, minDistance, yBias }),
    [count, excludeZones, minDistance, seed, yBias],
  );

  const spawnDelays = useMemo(
    () => computeStaggerDelays(count, computeSpawnDuration(count)),
    [count],
  );
  const despawnDelays = useMemo(
    () => computeDespawnDelays(count, computeDespawnDuration(count)),
    [count],
  );

  return (
    <div aria-hidden className={className}>
      {placements.map((placement, index) => (
        <ScatterIcon
          key={`${seed}-${placement.x.toFixed(1)}-${placement.y.toFixed(1)}-${placement.rotation.toFixed(0)}`}
          despawnDelay={despawnDelays[index] ?? 0}
          phase={phase}
          placement={placement}
          spawnDelay={spawnDelays[index] ?? 0}
        >
          {renderIcon(index)}
        </ScatterIcon>
      ))}
    </div>
  );
}
