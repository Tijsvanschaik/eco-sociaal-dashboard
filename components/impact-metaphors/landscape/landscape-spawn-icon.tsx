"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import type { HillSlot } from "@/lib/impact-metaphors/hill-layout";
import { slotToPercent } from "@/lib/impact-metaphors/hill-layout";
import type { MetaphorSlidePhase } from "@/lib/impact-metaphors/slide-timing";

type LandscapeSpawnIconProps = {
  children: ReactNode;
  despawnDelay: number;
  iconSize: number;
  phase: MetaphorSlidePhase;
  slot: HillSlot;
  spawnDelay: number;
};

export function LandscapeSpawnIcon({
  children,
  despawnDelay,
  iconSize,
  phase,
  slot,
  spawnDelay,
}: LandscapeSpawnIconProps) {
  const reduceMotion = useReducedMotion();
  const isDespawning = phase === "despawn";
  const position = slotToPercent(slot);
  const scale = slot.scale;
  const rotation = slot.hill === "left" ? -3 + (slot.x % 6) * 0.5 : 3 - (slot.x % 6) * 0.5;

  const anchorStyle = {
    left: position.left,
    top: position.top,
    width: iconSize,
    height: iconSize,
    zIndex: Math.round(slot.y),
  } as const;

  const transformAtRest = `translate(-50%, -88%) scale(${scale}) rotate(${rotation}deg)`;

  if (reduceMotion) {
    if (isDespawning) return null;
    return (
      <div className="absolute" style={{ ...anchorStyle, opacity: 1, transform: transformAtRest }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className="absolute"
      initial={{
        opacity: 0,
        scale: 0.05,
        x: "-50%",
        y: "-75%",
      }}
      animate={
        isDespawning
          ? {
              opacity: 0,
              scale: scale * 0.08,
              x: "-50%",
              y: "-78%",
            }
          : {
              opacity: 1,
              scale,
              rotate: rotation,
              x: "-50%",
              y: "-88%",
            }
      }
      style={anchorStyle}
      transition={{
        delay: (isDespawning ? despawnDelay : spawnDelay) / 1000,
        type: "spring",
        stiffness: 280,
        damping: 22,
        mass: 0.85,
      }}
    >
      {children}
    </motion.div>
  );
}
