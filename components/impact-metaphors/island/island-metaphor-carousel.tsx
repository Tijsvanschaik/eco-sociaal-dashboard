"use client";

import { useEffect, useMemo, useState } from "react";

import { ImpactIslandStage } from "@/components/impact-metaphors/island/impact-island-stage";
import type { IslandViewport } from "@/components/impact-metaphors/island/impact-island-stage";
import type { MetaphorUnit } from "@/lib/impact-metaphors";
import {
  computeSharedIslandViewBoxBounds,
  gridDimensionForCount,
} from "@/lib/impact-metaphors/island-grid";
import { islandCellCapacity } from "@/lib/impact-metaphors/island-shape";
import {
  type IslandCarouselPhase,
  computeIslandCarouselTimeline,
} from "@/lib/impact-metaphors/island-slide-timing";
import { DEFAULT_ISLAND_TUNING, type IslandTuning } from "@/lib/impact-metaphors/island-tuning";
import type { MetaphorSlidePhase } from "@/lib/impact-metaphors/slide-timing";
import { cn } from "@/lib/utils";

export type IslandMetaphorCarouselProps = {
  className?: string;
  fillContainer?: boolean;
  /** Headline block above the island (production dashboard). */
  headlineOverlay?: boolean;
  paused?: boolean;
  seedPrefix?: string;
  showHeadline?: boolean;
  showSlideDots?: boolean;
  tuning?: IslandTuning;
  units: MetaphorUnit[];
  viewport?: IslandViewport;
};

function toStagePhase(carouselPhase: IslandCarouselPhase): MetaphorSlidePhase {
  if (carouselPhase === "spawn") return "spawn";
  if (carouselPhase === "despawn") return "despawn";
  return "idle";
}

function entityTypeForUnit(unit: MetaphorUnit): "person" | "tree" {
  return unit.id === "people" ? "person" : "tree";
}

export function IslandMetaphorCarousel({
  className,
  fillContainer = false,
  headlineOverlay = false,
  paused = false,
  seedPrefix = "impact",
  showHeadline = true,
  showSlideDots = true,
  tuning = DEFAULT_ISLAND_TUNING,
  units,
  viewport = "mobile",
}: IslandMetaphorCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselPhase, setCarouselPhase] = useState<IslandCarouselPhase>("spawn");
  const [slideEpoch, setSlideEpoch] = useState(0);
  const unitsKey = units.map((unit) => `${unit.id}:${unit.numericValue}`).join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset carousel when units change
  useEffect(() => {
    setActiveIndex(0);
    setCarouselPhase("spawn");
    setSlideEpoch((value) => value + 1);
  }, [unitsKey]);

  const activeUnit = units[activeIndex];

  const tileCount = useMemo(() => {
    if (!activeUnit) return 0;
    const gridSize = gridDimensionForCount(
      activeUnit.iconCount,
      tuning.islandShape,
      tuning.maxGridSize,
    );
    return islandCellCapacity(gridSize, tuning.islandShape);
  }, [activeUnit, tuning]);

  const timeline = useMemo(
    () => computeIslandCarouselTimeline(tileCount, activeUnit?.iconCount ?? 0),
    [activeUnit?.iconCount, tileCount],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: phase cycle tied to active slide
  useEffect(() => {
    if (paused || !activeUnit) return;

    setCarouselPhase("spawn");

    const holdAt = timeline.spawnMs;
    const floatAt = timeline.spawnMs + timeline.holdMs;
    const despawnAt = timeline.spawnMs + timeline.holdMs + timeline.floatMs;

    const holdTimer = window.setTimeout(() => setCarouselPhase("hold"), holdAt);
    const floatTimer = window.setTimeout(() => setCarouselPhase("float"), floatAt);
    const despawnTimer = window.setTimeout(() => setCarouselPhase("despawn"), despawnAt);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(floatTimer);
      window.clearTimeout(despawnTimer);
    };
  }, [activeIndex, activeUnit?.iconCount, activeUnit?.id, paused, timeline, unitsKey, slideEpoch]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: restart rotation when units change
  useEffect(() => {
    if (paused || units.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % units.length);
      setSlideEpoch((value) => value + 1);
    }, timeline.totalMs);

    return () => window.clearInterval(id);
  }, [paused, timeline.totalMs, units.length, unitsKey]);

  if (units.length === 0 || !activeUnit) return null;

  const stagePhase = toStagePhase(carouselPhase);
  const enableIdleFloat = carouselPhase === "float";

  const sharedViewBoxBounds = useMemo(() => {
    if (units.length <= 1) return undefined;

    return computeSharedIslandViewBoxBounds(
      units.map((unit) => ({
        entityType: entityTypeForUnit(unit),
        iconCount: unit.iconCount,
        seed: `${seedPrefix}-${unit.id}`,
      })),
      tuning,
      48,
      { tightTop: headlineOverlay },
    );
  }, [headlineOverlay, seedPrefix, tuning, units]);

  return (
    <div aria-live="polite" className={cn("relative w-full", className)}>
      {units.map((unit, index) => (
        <article
          key={unit.id}
          aria-hidden={index !== activeIndex}
          className={cn(
            "transition-opacity duration-500 ease-in-out",
            index === activeIndex
              ? "relative z-10 flex flex-col opacity-100"
              : "pointer-events-none absolute inset-0 opacity-0",
          )}
        >
          {headlineOverlay ? (
            <div className="relative z-20 shrink-0 bg-surface-container-low px-4 pb-2 pt-1 text-center sm:px-6 sm:pb-3 sm:pt-1.5">
              <h2
                className="flex flex-col items-center gap-0.5"
                {...(index === activeIndex ? { id: "impact-overview-heading" } : {})}
              >
                <span
                  className={cn(
                    "text-[2.75rem] font-extrabold leading-[0.95] tracking-tight sm:text-[4.25rem]",
                    entityTypeForUnit(unit) === "tree" ? "text-tertiary" : "text-primary",
                  )}
                >
                  {unit.formattedValue}
                </span>
                <span className="text-[1.15rem] font-bold leading-tight text-foreground sm:text-[1.65rem]">
                  {unit.title}
                </span>
              </h2>
              {unit.unitsPerIcon > 1 ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {unit.id === "trees"
                    ? `elk icoon ≈ ${unit.unitsPerIcon} bomen`
                    : `elk icoon ≈ ${unit.unitsPerIcon} personen`}
                </p>
              ) : null}
            </div>
          ) : null}

          {index === activeIndex ? (
            <ImpactIslandStage
              key={`${unit.id}-${unitsKey}-${slideEpoch}`}
              anchorToViewBoxFoot={false}
              animateSpawn={!paused}
              carouselTiming
              className={cn(
                "max-w-none rounded-none bg-transparent shadow-none",
                fillContainer && "h-full max-h-full min-h-0",
                headlineOverlay && "min-h-[160px]",
              )}
              enableIdleFloat={enableIdleFloat}
              entityType={entityTypeForUnit(unit)}
              fillContainer={fillContainer}
              formattedValue={unit.formattedValue}
              iconCount={unit.iconCount}
              phase={stagePhase}
              seed={`${seedPrefix}-${unit.id}-${slideEpoch}`}
              showHeadline={showHeadline && !headlineOverlay}
              stackedHeadline={headlineOverlay}
              title={unit.title}
              tuning={tuning}
              unitsPerIcon={unit.unitsPerIcon}
              viewBoxBounds={sharedViewBoxBounds}
              viewport={viewport}
            />
          ) : null}
        </article>
      ))}

      {showSlideDots && units.length > 1 ? (
        <div
          aria-label="Impactvisualisaties"
          className="mt-2 flex items-center justify-center gap-2 sm:mt-2.5"
          role="tablist"
        >
          {units.map((unit, index) => (
            <button
              key={unit.id}
              aria-label={`${unit.title} (${unit.formattedValue})`}
              aria-selected={index === activeIndex}
              className={cn(
                "rounded-full transition-all duration-300",
                index === activeIndex
                  ? "h-1.5 w-8 bg-primary"
                  : "h-1 w-5 bg-primary/25 hover:bg-primary/40",
              )}
              onClick={() => {
                setActiveIndex(index);
                setSlideEpoch((value) => value + 1);
              }}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
