"use client";

import { useMemo } from "react";

import { IslandAnimatedGrassTile } from "@/components/impact-metaphors/island/island-animated-grass-tile";
import {
  IslandEntity,
  type IslandEntityType,
} from "@/components/impact-metaphors/island/island-entity";
import { IslandGroundShadow } from "@/components/impact-metaphors/island/island-grass-tile";
import { IslandIdleFloat } from "@/components/impact-metaphors/island/island-idle-float";
import { useResponsiveIslandScale } from "@/components/impact-metaphors/island/use-responsive-island-scale";
import {
  type IslandViewBoxBounds,
  assignIslandEntities,
  buildIslandTiles,
  compactIslandTiles,
  computeIslandViewBoxFromTiles,
  formatIslandViewBox,
  gridDimensionForCount,
  sortEntitiesForRender,
} from "@/lib/impact-metaphors/island-grid";
import {
  ISLAND_ENTITY_START_FRACTION,
  ISLAND_TILE_DESPAWN_START_FRACTION,
  ISLAND_TILE_SPAWN_FRACTION,
  computeIslandDespawnBudget,
  computeIslandSpawnBudget,
} from "@/lib/impact-metaphors/island-slide-timing";
import { DEFAULT_ISLAND_TUNING, type IslandTuning } from "@/lib/impact-metaphors/island-tuning";
import {
  type MetaphorSlidePhase,
  computeDespawnDelays,
  computeDespawnDuration,
  computeSpawnDuration,
  computeStaggerDelays,
} from "@/lib/impact-metaphors/slide-timing";
import { cn } from "@/lib/utils";

export type IslandViewport = "mobile" | "tv";

export type ImpactIslandStageProps = {
  animateSpawn?: boolean;
  /** Use slower island spawn/despawn stagger (carousel). */
  carouselTiming?: boolean;
  className?: string;
  entityType?: IslandEntityType;
  enableIdleFloat?: boolean;
  fillContainer?: boolean;
  /** Headline sits above the island in a parent carousel (no aspect-ratio crop). */
  stackedHeadline?: boolean;
  formattedValue: string;
  iconCount: number;
  phase?: MetaphorSlidePhase;
  seed: string;
  showHeadline?: boolean;
  title: string;
  tuning?: IslandTuning;
  unitsPerIcon?: number;
  viewport?: IslandViewport;
  /** Scale island to ~fill container width; `tuning.islandScale` acts as boost. */
  responsiveIslandScale?: boolean;
  /** Shared carousel viewBox — keeps SVG stage height stable across slides. */
  viewBoxBounds?: IslandViewBoxBounds;
  /** Pin island footing to the shared viewBox baseline (carousel). */
  anchorToViewBoxFoot?: boolean;
};

function allowEntitySway({
  carouselTiming,
  enableIdleFloat,
  phase,
}: {
  carouselTiming: boolean;
  enableIdleFloat: boolean;
  phase: MetaphorSlidePhase;
}): boolean {
  if (phase === "spawn" || phase === "despawn") return false;
  if (carouselTiming) return enableIdleFloat;
  return true;
}

export function ImpactIslandStage({
  animateSpawn = true,
  carouselTiming = false,
  className,
  entityType = "tree",
  enableIdleFloat = true,
  fillContainer = false,
  formattedValue,
  iconCount,
  phase = "idle",
  seed,
  showHeadline = true,
  stackedHeadline = false,
  title,
  tuning = DEFAULT_ISLAND_TUNING,
  unitsPerIcon = 1,
  viewport = "mobile",
  responsiveIslandScale = true,
  viewBoxBounds,
  anchorToViewBoxFoot = false,
}: ImpactIslandStageProps) {
  const gridSize = gridDimensionForCount(iconCount, tuning.islandShape, tuning.maxGridSize);
  const allTiles = useMemo(
    () => buildIslandTiles(gridSize, tuning, seed),
    [gridSize, seed, tuning],
  );
  const entityCount = Math.min(iconCount, allTiles.length);
  const entities = useMemo(
    () =>
      sortEntitiesForRender(assignIslandEntities({ count: entityCount, gridSize, seed, tuning })),
    [gridSize, entityCount, seed, tuning],
  );
  const tiles = useMemo(
    () => compactIslandTiles(allTiles, entities, gridSize, tuning.islandShape),
    [allTiles, entities, gridSize, tuning.islandShape],
  );

  const viewBoxOptions = useMemo(
    () => ({
      entityType,
      tightTop: stackedHeadline,
    }),
    [entityType, stackedHeadline],
  );

  const { containerRef, islandScale } = useResponsiveIslandScale({
    boost: tuning.islandScale,
    enabled: responsiveIslandScale,
    tiles,
    tuning,
    viewBoxBounds,
    viewBoxOptions,
  });
  const viewBox = useMemo(() => {
    if (viewBoxBounds) return formatIslandViewBox(viewBoxBounds);
    return computeIslandViewBoxFromTiles(tiles, tuning, 48, viewBoxOptions);
  }, [tiles, tuning, viewBoxBounds, viewBoxOptions]);

  const entityByCell = useMemo(() => {
    const map = new Map<string, (typeof entities)[number]>();
    for (const entity of entities) {
      map.set(`${entity.col}:${entity.row}`, entity);
    }
    return map;
  }, [entities]);

  const tileSpawnDelays = useMemo(() => {
    const tileSpawnMs = carouselTiming
      ? computeIslandSpawnBudget(tiles.length) * ISLAND_TILE_SPAWN_FRACTION
      : computeSpawnDuration(tiles.length) * 0.55;
    const delays = computeStaggerDelays(tiles.length, tileSpawnMs);
    return tiles.map((tile) => delays[tile.spawnIndex] ?? 0);
  }, [carouselTiming, tiles]);

  const tileDespawnDelays = useMemo(() => {
    const entityDespawnMs = carouselTiming
      ? computeIslandDespawnBudget(entityCount)
      : computeDespawnDuration(entityCount);
    const tileDespawnMs = carouselTiming
      ? computeIslandDespawnBudget(tiles.length)
      : computeDespawnDuration(tiles.length);
    const tileStartOffset = carouselTiming
      ? entityDespawnMs * ISLAND_TILE_DESPAWN_START_FRACTION
      : entityDespawnMs * 0.55;
    const delays = computeDespawnDelays(tiles.length, tileDespawnMs);
    return tiles.map((tile) => tileStartOffset + (delays[tile.spawnIndex] ?? 0));
  }, [carouselTiming, entityCount, tiles]);

  const entitySpawnDelays = useMemo(() => {
    const tileSpawnMs = carouselTiming
      ? computeIslandSpawnBudget(tiles.length) * ISLAND_TILE_SPAWN_FRACTION
      : computeSpawnDuration(tiles.length) * 0.55;
    const entitySpawnMs = carouselTiming
      ? computeIslandSpawnBudget(entityCount)
      : computeSpawnDuration(entityCount);
    const entityStartOffset = carouselTiming
      ? tileSpawnMs * ISLAND_ENTITY_START_FRACTION
      : tileSpawnMs * 0.35;
    const delays = computeStaggerDelays(entityCount, entitySpawnMs);
    return entities.map((entity) => entityStartOffset + (delays[entity.spawnIndex] ?? 0));
  }, [carouselTiming, entities, entityCount, tiles.length]);

  const entityDespawnDelays = useMemo(() => {
    const despawnMs = carouselTiming
      ? computeIslandDespawnBudget(entityCount)
      : computeDespawnDuration(entityCount);
    const delays = computeDespawnDelays(entityCount, despawnMs);
    return entities.map((entity) => delays[entity.spawnIndex] ?? 0);
  }, [carouselTiming, entities, entityCount]);

  const entityDelayByCell = useMemo(() => {
    const map = new Map<string, { despawnMs: number; spawnMs: number }>();
    for (const [index, entity] of entities.entries()) {
      map.set(`${entity.col}:${entity.row}`, {
        spawnMs: entitySpawnDelays[index] ?? 0,
        despawnMs: entityDespawnDelays[index] ?? 0,
      });
    }
    return map;
  }, [entities, entityDespawnDelays, entitySpawnDelays]);

  const islandAnchor = useMemo(() => {
    if (tiles.length === 0) return { x: 0, y: 0 };

    const xs = tiles.map((tile) => tile.x);
    const surfaceYs = tiles.map((tile) => tile.y + tile.baselineOffset);

    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: Math.max(...surfaceYs),
    };
  }, [tiles]);

  const islandCenter = useMemo(() => {
    if (tiles.length === 0) return { x: 0, y: 0 };

    const xs = tiles.map((tile) => tile.x);
    const surfaceYs = tiles.map((tile) => tile.y + tile.baselineOffset);

    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...surfaceYs) + Math.max(...surfaceYs)) / 2,
    };
  }, [tiles]);

  const viewBoxFoot = useMemo(() => {
    if (!viewBoxBounds) return null;

    return {
      x: viewBoxBounds.x + viewBoxBounds.width / 2,
      y: viewBoxBounds.y + viewBoxBounds.height - 48,
    };
  }, [viewBoxBounds]);

  const islandTransform = useMemo(() => {
    if (anchorToViewBoxFoot && viewBoxFoot) {
      return `translate(${viewBoxFoot.x} ${viewBoxFoot.y}) scale(${islandScale}) translate(${-islandAnchor.x} ${-islandAnchor.y})`;
    }

    return `translate(${islandCenter.x} ${islandCenter.y}) scale(${islandScale}) translate(${-islandCenter.x} ${-islandCenter.y})`;
  }, [anchorToViewBoxFoot, islandAnchor, islandCenter, islandScale, viewBoxFoot]);

  const scaleNote =
    unitsPerIcon > 1
      ? entityType === "tree"
        ? `elk icoon ≈ ${unitsPerIcon} bomen`
        : `elk icoon ≈ ${unitsPerIcon} personen`
      : null;

  const toneClass = entityType === "tree" ? "text-tertiary" : "text-primary";
  const entitySway = allowEntitySway({ carouselTiming, enableIdleFloat, phase });

  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-[2rem]",
        fillContainer
          ? "h-full max-h-full min-h-0 max-w-none"
          : stackedHeadline
            ? viewBoxBounds
              ? "w-full max-w-none"
              : "min-h-[160px] max-w-none"
            : viewport === "tv"
              ? "aspect-[16/10] min-h-[300px]"
              : "aspect-[4/3] min-h-[260px] max-w-lg",
        className,
      )}
      style={
        stackedHeadline && viewBoxBounds
          ? { aspectRatio: `${viewBoxBounds.width} / ${viewBoxBounds.height}` }
          : undefined
      }
    >
      {showHeadline ? (
        <div className="z-20 shrink-0 px-4 pb-1 pt-2 text-center sm:px-6 sm:pb-2">
          <p className={cn("text-6xl font-extrabold tracking-tight", toneClass)}>
            {formattedValue}
          </p>
          <p className="text-lg font-bold text-foreground sm:text-xl">{title}</p>
          {scaleNote ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{scaleNote}</p>
          ) : null}
        </div>
      ) : null}

      <div ref={containerRef} className="min-h-0 w-full flex-1 overflow-hidden">
        <svg
          aria-hidden
          className="h-full w-full overflow-hidden"
          preserveAspectRatio={stackedHeadline ? "xMidYMin meet" : "xMidYMid meet"}
          role="presentation"
          viewBox={viewBox}
        >
          <g transform={islandTransform}>
            <IslandIdleFloat
              active={phase !== "spawn" && phase !== "despawn" && enableIdleFloat && animateSpawn}
              seed={seed}
            >
              {phase !== "despawn" ? <IslandGroundShadow tiles={tiles} tuning={tuning} /> : null}
              {tiles.map((tile, tileIndex) => {
                const entity = entityByCell.get(`${tile.col}:${tile.row}`);

                return (
                  <g key={`cell-${tile.col}-${tile.row}`}>
                    <IslandAnimatedGrassTile
                      animateSpawn={animateSpawn}
                      carouselTiming={carouselTiming}
                      despawnDelayMs={tileDespawnDelays[tileIndex] ?? 0}
                      phase={phase}
                      spawnDelayMs={tileSpawnDelays[tileIndex] ?? 0}
                      tile={tile}
                      tuning={tuning}
                    />
                    {entity ? (
                      <g transform={`translate(${tile.x} ${tile.y})`}>
                        <IslandEntity
                          allowSway={entitySway}
                          anchored
                          animateSpawn={animateSpawn}
                          carouselTiming={carouselTiming}
                          despawnDelayMs={
                            entityDelayByCell.get(`${tile.col}:${tile.row}`)?.despawnMs ?? 0
                          }
                          entity={entity}
                          phase={phase}
                          spawnDelayMs={
                            entityDelayByCell.get(`${tile.col}:${tile.row}`)?.spawnMs ?? 0
                          }
                          tuning={tuning}
                          type={entityType}
                        />
                      </g>
                    ) : null}
                  </g>
                );
              })}
            </IslandIdleFloat>
          </g>
        </svg>
      </div>
    </div>
  );
}
