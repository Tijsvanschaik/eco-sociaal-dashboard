"use client";

import { useMemo } from "react";

import {
  IslandEntity,
  type IslandEntityType,
} from "@/components/impact-metaphors/island/island-entity";
import {
  IslandGrassTile,
  IslandGroundShadow,
} from "@/components/impact-metaphors/island/island-grass-tile";
import {
  assignIslandEntities,
  buildIslandTiles,
  computeIslandViewBox,
  gridDimensionForCount,
  sortEntitiesForRender,
} from "@/lib/impact-metaphors/island-grid";
import { cn } from "@/lib/utils";

export type IslandViewport = "mobile" | "tv";

export type ImpactIslandStageProps = {
  animateSpawn?: boolean;
  className?: string;
  entityType?: IslandEntityType;
  formattedValue: string;
  iconCount: number;
  seed: string;
  title: string;
  unitsPerIcon?: number;
  viewport?: IslandViewport;
};

export function ImpactIslandStage({
  animateSpawn = true,
  className,
  entityType = "tree",
  formattedValue,
  iconCount,
  seed,
  title,
  unitsPerIcon = 1,
  viewport = "mobile",
}: ImpactIslandStageProps) {
  const gridSize = gridDimensionForCount(iconCount);
  const viewBox = computeIslandViewBox(gridSize);

  const tiles = useMemo(() => buildIslandTiles(gridSize), [gridSize]);
  const entities = useMemo(
    () => sortEntitiesForRender(assignIslandEntities({ count: iconCount, gridSize, seed })),
    [gridSize, iconCount, seed],
  );

  const scaleNote =
    unitsPerIcon > 1
      ? entityType === "tree"
        ? `elk icoon ≈ ${unitsPerIcon} bomen`
        : `elk icoon ≈ ${unitsPerIcon} personen`
      : null;

  const toneClass = entityType === "tree" ? "text-tertiary-container" : "text-primary-container";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_56px_rgba(0,0,0,0.28)]",
        viewport === "tv" ? "aspect-[16/10] min-h-[300px]" : "aspect-[4/3] min-h-[260px] max-w-lg",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[#163816]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(126,207,74,0.18),transparent_55%)]" />

      <div className="absolute inset-x-0 top-4 z-20 flex justify-center px-4 sm:top-6">
        <div className="rounded-[1.25rem] border border-white/15 bg-[#0f2a0f]/55 px-5 py-3 text-center backdrop-blur-md sm:px-7">
          <p className={cn("text-4xl font-extrabold tracking-tight sm:text-5xl", toneClass)}>
            {formattedValue}
          </p>
          <p className="text-sm font-bold text-white/90 sm:text-base">{title}</p>
          {scaleNote ? <p className="mt-1 text-[11px] text-white/60">{scaleNote}</p> : null}
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-white/45">
            Grid {gridSize}×{gridSize} · {iconCount} {entityType === "tree" ? "bomen" : "personen"}
          </p>
        </div>
      </div>

      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        viewBox={viewBox}
      >
        <IslandGroundShadow tiles={tiles} />
        {tiles.map((tile) => (
          <IslandGrassTile key={`tile-${tile.col}-${tile.row}`} tile={tile} />
        ))}
        {entities.map((entity) => (
          <IslandEntity
            key={entity.id}
            animateSpawn={animateSpawn}
            entity={entity}
            spawnDelayMs={entity.spawnIndex * 55}
            type={entityType}
          />
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-end gap-4 text-xs font-semibold text-white/70">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-tertiary-container" />
          {entityType === "tree" ? "Bomen" : "Mensen"}
        </span>
        <span>
          {gridSize}×{gridSize} eiland
        </span>
      </div>
    </div>
  );
}
