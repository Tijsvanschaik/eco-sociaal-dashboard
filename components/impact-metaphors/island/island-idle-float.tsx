"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Vertical bob amplitude in SVG viewBox units. */
const IDLE_FLOAT_AMPLITUDE = 5;
const IDLE_FLOAT_DURATION_S = 5.2;

type IslandIdleFloatProps = {
  active: boolean;
  children: ReactNode;
  /** Stable seed for slight per-slide duration variation. */
  seed?: string;
};

function idleDurationFromSeed(seed: string | undefined): number {
  if (!seed) return IDLE_FLOAT_DURATION_S;

  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  const jitter = (Math.abs(hash) % 900) / 1000;
  return IDLE_FLOAT_DURATION_S + jitter * 0.9;
}

export function IslandIdleFloat({ active, children, seed }: IslandIdleFloatProps) {
  const reduceMotion = useReducedMotion();
  const shouldFloat = active && !reduceMotion;

  return (
    <motion.g
      animate={shouldFloat ? { y: [0, -IDLE_FLOAT_AMPLITUDE, 0] } : { y: 0 }}
      initial={false}
      transition={
        shouldFloat
          ? {
              duration: idleDurationFromSeed(seed),
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
            }
          : { duration: 0.4, ease: "easeOut" }
      }
    >
      {children}
    </motion.g>
  );
}
