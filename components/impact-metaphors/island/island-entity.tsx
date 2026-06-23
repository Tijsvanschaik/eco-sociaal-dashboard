"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import {
  IslandPersonSprite,
  IslandTreeSprite,
} from "@/components/impact-metaphors/island/island-sprites";
import type { IslandEntityPlacement } from "@/lib/impact-metaphors/island-grid";
import { gridToScreen } from "@/lib/impact-metaphors/island-grid";

export type IslandEntityType = "person" | "tree";

type IslandEntityProps = {
  animateSpawn: boolean;
  entity: IslandEntityPlacement;
  spawnDelayMs: number;
  type: IslandEntityType;
};

export function IslandEntity({ animateSpawn, entity, spawnDelayMs, type }: IslandEntityProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const { x, y } = gridToScreen(entity.col, entity.row);
  const swayDelay = (entity.col * 0.17 + entity.row * 0.23) % 2;
  const delaySec = spawnDelayMs / 1000;

  const sprite =
    type === "tree" ? (
      <IslandTreeSprite highlighted={hovered} />
    ) : (
      <IslandPersonSprite highlighted={hovered} />
    );

  const tooltip = hovered ? (
    <foreignObject height="44" width="148" x="-74" y="-68">
      <div className="rounded-lg bg-[#0f2a0f]/92 px-2 py-1 text-center text-[10px] leading-tight text-white shadow-lg backdrop-blur-sm">
        <strong>{type === "tree" ? "Boom geplant" : "Persoon bereikt"}</strong>
        <br />
        {entity.team}
        <br />
        {entity.plantedAt}
      </div>
    </foreignObject>
  ) : null;

  if (reduceMotion || !animateSpawn) {
    return (
      <g
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        transform={`translate(${x} ${y})`}
      >
        <g style={{ transform: hovered ? "scale(1.08)" : undefined, transformOrigin: "0px 0px" }}>
          {sprite}
        </g>
        {tooltip}
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y})`}>
      <motion.g
        animate={
          hovered
            ? { scale: 1.08 }
            : {
                opacity: 1,
                scaleX: [1.15, 0.9, 1.06, 0.98, 1],
                scaleY: [0.12, 1.12, 0.88, 1.04, 1],
                y: [-32, -4, -10, -7, 0],
              }
        }
        initial={{ opacity: 0, scaleX: 1.15, scaleY: 0.12, y: -32 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
        transition={
          hovered
            ? { duration: 0.18 }
            : { delay: delaySec, duration: 0.7, ease: [0.22, 1.15, 0.36, 1] }
        }
      >
        <motion.g
          animate={{ rotate: hovered ? 0 : [-1.2, 1.2, -1.2] }}
          transition={{
            delay: delaySec + swayDelay,
            duration: 3.8,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "mirror",
          }}
        >
          <motion.g
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.25 }}
            transition={{ delay: delaySec + 0.32, duration: 0.38, ease: "backOut" }}
          >
            {sprite}
          </motion.g>
        </motion.g>
      </motion.g>
      {tooltip}
    </g>
  );
}
