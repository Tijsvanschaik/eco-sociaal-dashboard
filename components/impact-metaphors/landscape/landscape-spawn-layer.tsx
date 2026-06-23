"use client";

import { type ReactNode, useMemo } from "react";

import {
  LandscapePersonIcon,
  LandscapeTreeIcon,
} from "@/components/impact-metaphors/landscape/landscape-icons";
import { LandscapeSpawnIcon } from "@/components/impact-metaphors/landscape/landscape-spawn-icon";
import type { MetaphorId } from "@/lib/impact-metaphors";
import { pickHillSlotsForCount } from "@/lib/impact-metaphors/hill-layout";
import {
  type MetaphorSlidePhase,
  computeDespawnDelays,
  computeDespawnDuration,
  computeSpawnDuration,
  computeStaggerDelays,
} from "@/lib/impact-metaphors/slide-timing";
import { cn } from "@/lib/utils";

export type LandscapeViewport = "mobile" | "tv";

type LandscapeSpawnLayerProps = {
  className?: string;
  iconCount: number;
  metaphorId: MetaphorId;
  phase: MetaphorSlidePhase;
  seed: string;
  viewport: LandscapeViewport;
};

function renderMetaphorIcon(metaphorId: MetaphorId, index: number, seed: string): ReactNode {
  const instanceId = `${seed}-${index}`;
  if (metaphorId === "trees") {
    return <LandscapeTreeIcon instanceId={instanceId} />;
  }
  if (metaphorId === "people") {
    return <LandscapePersonIcon instanceId={instanceId} />;
  }
  return null;
}

export function LandscapeSpawnLayer({
  className,
  iconCount,
  metaphorId,
  phase,
  seed,
  viewport,
}: LandscapeSpawnLayerProps) {
  const slots = useMemo(() => pickHillSlotsForCount(iconCount), [iconCount]);
  const iconSize = viewport === "tv" ? 58 : 46;

  const spawnDelays = useMemo(
    () => computeStaggerDelays(iconCount, computeSpawnDuration(iconCount)),
    [iconCount],
  );
  const despawnDelays = useMemo(
    () => computeDespawnDelays(iconCount, computeDespawnDuration(iconCount)),
    [iconCount],
  );

  if (iconCount <= 0 || (metaphorId !== "trees" && metaphorId !== "people")) {
    return null;
  }

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {slots.map((slot, index) => (
        <LandscapeSpawnIcon
          key={`${seed}-${slot.hill}-${slot.x.toFixed(0)}-${index}`}
          despawnDelay={despawnDelays[index] ?? 0}
          iconSize={iconSize}
          phase={phase}
          slot={slot}
          spawnDelay={spawnDelays[index] ?? 0}
        >
          <div className="h-full w-full [&_svg]:h-full [&_svg]:w-full">
            {renderMetaphorIcon(metaphorId, index, seed)}
          </div>
        </LandscapeSpawnIcon>
      ))}
    </div>
  );
}
