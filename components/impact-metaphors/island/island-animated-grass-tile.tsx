"use client";

import { motion, useReducedMotion } from "framer-motion";

import { IslandGrassTileContent } from "@/components/impact-metaphors/island/island-grass-tile";
import type { IslandTile } from "@/lib/impact-metaphors/island-grid";
import { ISLAND_TILE_POP_MS } from "@/lib/impact-metaphors/island-slide-timing";
import type { IslandTuning } from "@/lib/impact-metaphors/island-tuning";
import type { MetaphorSlidePhase } from "@/lib/impact-metaphors/slide-timing";

type IslandAnimatedGrassTileProps = {
  animateSpawn: boolean;
  carouselTiming?: boolean;
  despawnDelayMs: number;
  phase: MetaphorSlidePhase;
  spawnDelayMs: number;
  tile: IslandTile;
  tuning: IslandTuning;
};

export function IslandAnimatedGrassTile({
  animateSpawn,
  carouselTiming = false,
  despawnDelayMs,
  phase,
  spawnDelayMs,
  tile,
  tuning,
}: IslandAnimatedGrassTileProps) {
  const reduceMotion = useReducedMotion();
  const isDespawning = phase === "despawn";
  const delaySec = (isDespawning ? despawnDelayMs : spawnDelayMs) / 1000;
  const spawnDuration = carouselTiming ? ISLAND_TILE_POP_MS / 1000 : 0.52;
  const despawnDuration = carouselTiming ? ISLAND_TILE_POP_MS / 1000 / 1.8 : 0.38;

  if (reduceMotion || !animateSpawn) {
    if (isDespawning) return null;

    return (
      <g transform={`translate(${tile.x} ${tile.y})`}>
        <IslandGrassTileContent tile={tile} tuning={tuning} />
      </g>
    );
  }

  return (
    <g transform={`translate(${tile.x} ${tile.y})`}>
      <motion.g
        animate={
          isDespawning
            ? { opacity: 0, scaleX: 0.85, scaleY: 0.35 }
            : { opacity: 1, scaleX: 1, scaleY: 1 }
        }
        initial={{ opacity: 0, scaleX: 1.08, scaleY: 0.2 }}
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
        transition={{
          delay: delaySec,
          duration: isDespawning ? despawnDuration : spawnDuration,
          ease: isDespawning ? [0.4, 0, 0.9, 0.2] : [0.22, 1.08, 0.36, 1],
        }}
      >
        <IslandGrassTileContent tile={tile} tuning={tuning} />
      </motion.g>
    </g>
  );
}
