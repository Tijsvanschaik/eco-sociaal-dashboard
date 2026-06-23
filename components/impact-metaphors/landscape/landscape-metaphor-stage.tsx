"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { LandscapeBackground } from "@/components/impact-metaphors/landscape/landscape-background";
import {
  LandscapeSpawnLayer,
  type LandscapeViewport,
} from "@/components/impact-metaphors/landscape/landscape-spawn-layer";
import type { MetaphorUnit } from "@/lib/impact-metaphors";
import {
  METAPHOR_ROTATION_MS,
  type MetaphorSlidePhase,
  computeDespawnDuration,
  computeSpawnDuration,
} from "@/lib/impact-metaphors/slide-timing";
import { cn } from "@/lib/utils";

export type LandscapeMetaphorStageProps = {
  className?: string;
  paused?: boolean;
  units: MetaphorUnit[];
  viewport?: LandscapeViewport;
};

export function LandscapeMetaphorStage({
  className,
  paused = false,
  units,
  viewport = "mobile",
}: LandscapeMetaphorStageProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<MetaphorSlidePhase>("spawn");
  const [slideEpoch, setSlideEpoch] = useState(0);

  const unitsKey = units.map((unit) => `${unit.id}:${unit.numericValue}`).join("|");
  const activeUnit = units[activeIndex];

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset when data changes
  useEffect(() => {
    setActiveIndex(0);
    setPhase("spawn");
    setSlideEpoch((value) => value + 1);
  }, [unitsKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: phase tied to active slide
  useEffect(() => {
    if (!activeUnit || paused) return;

    setPhase("spawn");
    const count = activeUnit.iconCount;
    const spawnMs = computeSpawnDuration(count);
    const despawnMs = computeDespawnDuration(count);
    const despawnStartMs = Math.max(spawnMs + 1200, METAPHOR_ROTATION_MS - despawnMs);

    const idleTimer = window.setTimeout(() => setPhase("idle"), spawnMs);
    const despawnTimer = window.setTimeout(() => setPhase("despawn"), despawnStartMs);

    return () => {
      window.clearTimeout(idleTimer);
      window.clearTimeout(despawnTimer);
    };
  }, [activeIndex, activeUnit?.id, activeUnit?.iconCount, paused, slideEpoch, unitsKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: loop when units change
  useEffect(() => {
    if (units.length <= 1 || paused) return;

    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % units.length);
      setSlideEpoch((value) => value + 1);
    }, METAPHOR_ROTATION_MS);

    return () => window.clearInterval(id);
  }, [paused, units.length, unitsKey]);

  const seed = activeUnit ? `${activeUnit.id}-${unitsKey}-${slideEpoch}` : "empty";

  const scaleNote =
    activeUnit && activeUnit.unitsPerIcon > 1
      ? activeUnit.id === "trees"
        ? `elk boompje ≈ ${activeUnit.unitsPerIcon} bomen`
        : `elk poppetje ≈ ${activeUnit.unitsPerIcon} personen`
      : null;

  const toneClass = activeUnit?.tone === "eco" ? "text-tertiary" : "text-primary";
  const headlineClass =
    viewport === "tv"
      ? "text-[4.5rem] leading-[0.92] sm:text-[5.5rem]"
      : "text-[3.25rem] leading-[0.95] sm:text-[4rem]";
  const subtitleClass = viewport === "tv" ? "text-xl sm:text-2xl" : "text-base sm:text-lg";
  const stageAspect =
    viewport === "tv" ? "aspect-[16/10] min-h-[280px]" : "aspect-[4/3] min-h-[240px] max-w-lg";

  return (
    <div
      aria-live="polite"
      className={cn(
        "relative w-full overflow-hidden rounded-[2rem] border border-white/60 bg-surface-container-low shadow-[0_24px_48px_rgba(54,50,45,0.08)]",
        stageAspect,
        className,
      )}
    >
      <LandscapeBackground className="absolute inset-0" />

      <div className="absolute inset-x-0 top-[6%] z-20 px-4 text-center sm:top-[8%]">
        <AnimatePresence mode="wait">
          {activeUnit ? (
            <motion.div
              key={`${activeUnit.id}-${unitsKey}`}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex flex-col items-center gap-0.5 rounded-[1.5rem] border border-white/50 bg-white/55 px-5 py-3 shadow-[0_8px_24px_rgba(54,50,45,0.06)] backdrop-blur-md sm:px-7 sm:py-4"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
            >
              <span
                className={cn(
                  "font-extrabold tracking-tight drop-shadow-sm",
                  headlineClass,
                  toneClass,
                )}
              >
                {activeUnit.formattedValue}
              </span>
              <span className={cn("font-bold text-foreground/85", subtitleClass)}>
                {activeUnit.title}
              </span>
              {scaleNote ? (
                <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {scaleNote}
                </span>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {activeUnit ? (
        <LandscapeSpawnLayer
          key={seed}
          iconCount={activeUnit.iconCount}
          metaphorId={activeUnit.id}
          phase={reduceMotion ? "idle" : phase}
          seed={seed}
          viewport={viewport}
        />
      ) : null}
    </div>
  );
}
