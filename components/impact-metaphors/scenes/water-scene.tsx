"use client";

import { WaterMetaphorIcon } from "@/components/impact-metaphors/icons/metaphor-icons";
import {
  METAPHOR_SCENE_LAYER_CLASS,
  MetaphorScatterLayer,
} from "@/components/impact-metaphors/metaphor-scatter-layer";
import type { MetaphorSlidePhase } from "@/lib/impact-metaphors/slide-timing";

export function WaterScene({
  iconCount,
  phase,
}: {
  iconCount: number;
  phase: MetaphorSlidePhase;
}) {
  return (
    <MetaphorScatterLayer
      className={METAPHOR_SCENE_LAYER_CLASS}
      count={iconCount}
      minDistance={6.5}
      phase={phase}
      renderIcon={(index) => (
        <WaterMetaphorIcon
          clipIdSuffix={`${iconCount}-${index}`}
          fillPct={0.55 + (index % 4) * 0.1}
          instanceId={`water-${iconCount}-${index}`}
        />
      )}
      seed={`water-${iconCount}`}
    />
  );
}
