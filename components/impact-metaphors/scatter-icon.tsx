"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import type { ScenePlacement } from "@/lib/impact-metaphors/scene-layout";
import type { MetaphorSlidePhase } from "@/lib/impact-metaphors/slide-timing";

type ScatterIconProps = {
  children: ReactNode;
  despawnDelay: number;
  phase: MetaphorSlidePhase;
  placement: ScenePlacement;
  spawnDelay: number;
};

export function ScatterIcon({
  children,
  despawnDelay,
  phase,
  placement,
  spawnDelay,
}: ScatterIconProps) {
  const reduceMotion = useReducedMotion();
  const isDespawning = phase === "despawn";

  const anchorStyle = {
    left: `${placement.x}%`,
    top: `${placement.y}%`,
    zIndex: placement.zIndex,
  } as const;

  if (reduceMotion) {
    if (isDespawning) return null;
    return (
      <div
        className="absolute"
        style={{
          ...anchorStyle,
          opacity: 0.95,
          transform: `translate(-50%, -50%) scale(${placement.scale}) rotate(${placement.rotation}deg)`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className="absolute"
      initial={{
        opacity: 0,
        scale: 0.15,
        x: "-50%",
        y: "-35%",
      }}
      animate={
        isDespawning
          ? {
              opacity: 0,
              scale: 0.1,
              x: "-50%",
              y: "-20%",
            }
          : {
              opacity: 0.95,
              scale: placement.scale,
              rotate: placement.rotation,
              x: "-50%",
              y: "-50%",
            }
      }
      style={anchorStyle}
      transition={{
        delay: (isDespawning ? despawnDelay : spawnDelay) / 1000,
        type: "spring",
        stiffness: 360,
        damping: 18,
        mass: 0.75,
      }}
    >
      {children}
    </motion.div>
  );
}
