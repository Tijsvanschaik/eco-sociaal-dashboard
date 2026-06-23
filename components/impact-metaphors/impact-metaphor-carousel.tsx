"use client";

import { useEffect, useState } from "react";

import type { MetaphorUnit } from "@/lib/impact-metaphors";
import {
  METAPHOR_ROTATION_MS,
  type MetaphorSlidePhase,
  computeDespawnDuration,
  computeSpawnDuration,
} from "@/lib/impact-metaphors/slide-timing";
import { cn } from "@/lib/utils";

import { MealsScene } from "./scenes/meals-scene";
import { PeopleScene } from "./scenes/people-scene";
import { TreeScene } from "./scenes/tree-scene";
import { WaterScene } from "./scenes/water-scene";

function MetaphorSceneVisual({
  phase,
  unit,
}: {
  phase: MetaphorSlidePhase;
  unit: MetaphorUnit;
}) {
  switch (unit.id) {
    case "trees":
      return <TreeScene iconCount={unit.iconCount} phase={phase} />;
    case "people":
      return <PeopleScene iconCount={unit.iconCount} phase={phase} />;
    case "water":
      return <WaterScene iconCount={unit.iconCount} phase={phase} />;
    case "meals":
      return <MealsScene iconCount={unit.iconCount} phase={phase} />;
    default:
      return null;
  }
}

export function ImpactMetaphorCarousel({ units }: { units: MetaphorUnit[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<MetaphorSlidePhase>("spawn");
  const [slideEpoch, setSlideEpoch] = useState(0);
  const unitsKey = units.map((unit) => `${unit.id}:${unit.numericValue}`).join("|");

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset carousel when units change
  useEffect(() => {
    setActiveIndex(0);
    setPhase("spawn");
    setSlideEpoch((value) => value + 1);
  }, [unitsKey]);

  const activeUnit = units[activeIndex];

  // biome-ignore lint/correctness/useExhaustiveDependencies: phase cycle tied to active slide
  useEffect(() => {
    if (!activeUnit) return;

    setPhase("spawn");
    const count = activeUnit.iconCount;
    const spawnMs = computeSpawnDuration(count);
    const despawnMs = computeDespawnDuration(count);
    const despawnStartMs = Math.max(spawnMs + 500, METAPHOR_ROTATION_MS - despawnMs);

    const idleTimer = window.setTimeout(() => setPhase("idle"), spawnMs);
    const despawnTimer = window.setTimeout(() => setPhase("despawn"), despawnStartMs);

    return () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(despawnTimer);
    };
  }, [activeIndex, activeUnit?.id, activeUnit?.numericValue, unitsKey, slideEpoch]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: restart rotation when units change
  useEffect(() => {
    if (units.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % units.length);
      setSlideEpoch((value) => value + 1);
    }, METAPHOR_ROTATION_MS);
    return () => window.clearInterval(id);
  }, [units.length, unitsKey]);

  if (units.length === 0 || !activeUnit) return null;

  return (
    <div aria-live="polite" className="pt-2 sm:pt-3">
      <div className="relative min-h-[16rem] sm:min-h-[17rem]">
        {units.map((unit, index) => (
          <article
            key={unit.id}
            aria-hidden={index !== activeIndex}
            className={cn(
              "absolute inset-0 overflow-visible transition-opacity duration-500 ease-in-out",
              index === activeIndex ? "z-10 opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {index === activeIndex ? (
              <MetaphorSceneVisual
                key={`${unit.id}-${unitsKey}-${slideEpoch}`}
                phase={phase}
                unit={unit}
              />
            ) : null}

            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 text-center">
              <h2
                className="flex max-w-[min(100%,20rem)] flex-col items-center gap-1 sm:max-w-3xl sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-4"
                {...(index === activeIndex ? { id: "impact-overview-heading" } : {})}
              >
                <span className="text-[3.5rem] font-extrabold leading-[0.95] tracking-tight text-primary sm:text-[5.75rem]">
                  {unit.formattedValue}
                </span>
                <span className="text-[1.35rem] font-bold leading-tight text-foreground sm:text-[2.125rem]">
                  {unit.title}
                </span>
              </h2>
            </div>
          </article>
        ))}
      </div>

      {units.length > 1 ? (
        <div
          aria-label="Impactvisualisaties"
          className="mt-5 flex items-center justify-center gap-2 sm:mt-6"
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
