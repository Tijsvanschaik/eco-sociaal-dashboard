"use client";

import { HeartMetaphorIcon } from "@/components/impact-metaphors/icons/metaphor-icons";
import {
  METAPHOR_SCENE_LAYER_CLASS,
  MetaphorScatterLayer,
} from "@/components/impact-metaphors/metaphor-scatter-layer";
import type { MetaphorSlidePhase } from "@/lib/impact-metaphors/slide-timing";

export function PeopleScene({
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
      renderIcon={(index) => <HeartMetaphorIcon instanceId={`people-${iconCount}-${index}`} />}
      seed={`people-${iconCount}`}
    />
  );
}
