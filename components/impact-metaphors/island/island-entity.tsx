"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  IslandPersonSprite,
  IslandTreeSprite,
} from "@/components/impact-metaphors/island/island-sprites";
import type { IslandEntityPlacement } from "@/lib/impact-metaphors/island-grid";
import { ISLAND_ENTITY_POP_MS } from "@/lib/impact-metaphors/island-slide-timing";
import type { IslandTuning } from "@/lib/impact-metaphors/island-tuning";
import type { MetaphorSlidePhase } from "@/lib/impact-metaphors/slide-timing";

export type IslandEntityType = "person" | "tree";

type IslandEntityProps = {
  allowSway?: boolean;
  anchored?: boolean;
  animateSpawn: boolean;
  carouselTiming?: boolean;
  despawnDelayMs?: number;
  entity: IslandEntityPlacement;
  phase?: MetaphorSlidePhase;
  spawnDelayMs: number;
  tuning: IslandTuning;
  type: IslandEntityType;
};

export function IslandEntity({
  allowSway = true,
  anchored = false,
  animateSpawn,
  carouselTiming = false,
  despawnDelayMs = 0,
  entity,
  phase = "idle",
  spawnDelayMs,
  tuning,
  type,
}: IslandEntityProps) {
  const reduceMotion = useReducedMotion();
  const { baselineOffset, renderY, x } = entity;
  const swayDelay = (entity.col * 0.17 + entity.row * 0.23) % 2;
  const isDespawning = phase === "despawn";
  const delaySec = (isDespawning ? despawnDelayMs : spawnDelayMs) / 1000;
  const spawnDuration = carouselTiming ? ISLAND_ENTITY_POP_MS / 1000 : 0.65;
  const despawnDuration = carouselTiming ? ISLAND_ENTITY_POP_MS / 1000 / 2.7 : 0.34;
  const spritePopDelay = carouselTiming ? 0.42 : 0.32;
  const spritePopDuration = carouselTiming ? 0.48 : 0.38;

  const sprite =
    type === "tree" ? (
      <IslandTreeSprite tuning={tuning} variant={entity.treeVariant} />
    ) : (
      <IslandPersonSprite tuning={tuning} variant={entity.personVariant} />
    );

  const rootTransform = anchored
    ? `translate(0 ${baselineOffset})`
    : `translate(${x} ${renderY + baselineOffset})`;

  if (reduceMotion || !animateSpawn) {
    if (isDespawning) return null;
    return <g transform={rootTransform}>{sprite}</g>;
  }

  if (isDespawning) {
    return (
      <g transform={rootTransform}>
        <motion.g
          animate={{ opacity: 0, scaleX: 0.9, scaleY: 0.2 }}
          initial={{ opacity: 1, scaleX: 1, scaleY: 1 }}
          style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
          transition={{
            delay: delaySec,
            duration: despawnDuration,
            ease: [0.4, 0, 0.9, 0.2],
          }}
        >
          {sprite}
        </motion.g>
      </g>
    );
  }

  return (
    <g transform={rootTransform}>
      <motion.g
        animate={{
          opacity: 1,
          scaleX: [1.15, 0.92, 1.05, 0.98, 1],
          scaleY: [0.15, 1.08, 0.92, 1.02, 1],
        }}
        initial={{ opacity: 0, scaleX: 1.15, scaleY: 0.15 }}
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
        transition={{ delay: delaySec, duration: spawnDuration, ease: [0.22, 1.12, 0.36, 1] }}
      >
        <motion.g
          animate={allowSway ? { rotate: [-1.2, 1.2, -1.2] } : { rotate: 0 }}
          transition={
            allowSway
              ? {
                  delay: delaySec + swayDelay,
                  duration: 3.8,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "mirror",
                }
              : { duration: 0.2, ease: "easeOut" }
          }
        >
          <motion.g
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.25 }}
            transition={{
              delay: delaySec + spritePopDelay,
              duration: spritePopDuration,
              ease: "backOut",
            }}
          >
            {sprite}
          </motion.g>
        </motion.g>
      </motion.g>
    </g>
  );
}
