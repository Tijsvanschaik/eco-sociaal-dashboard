import type { IslandShape } from "@/lib/impact-metaphors/island-shape";

export type { IslandShape };

export type IslandTuning = {
  /** 0 = raw iso staircase, 1 = align all tile bottoms on one baseline. */
  baselineAlign: number;
  /** Uniform scale for the entire island (tiles, entities, shadow). */
  islandScale: number;
  islandShape: IslandShape;
  /** Hard cap on grid dimension (4|8|16|32|64); limits tile count and animation cost. */
  maxGridSize: number;
  /** Show a dot at each cell anchor (debug). */
  showCellOrigin: boolean;
  /** Soft ground ellipse under the island. */
  showGroundShadow: boolean;
  tileAnchorY: number;
  tileGap: number;
  tileHeight: number;
  tileSpriteOffsetX: number;
  tileSpriteOffsetY: number;
  tileSpriteScale: number;
  tileWidth: number;
  personAnchorY: number;
  personOffsetX: number;
  personOffsetY: number;
  personScale: number;
  treeAnchorY: number;
  treeOffsetX: number;
  treeOffsetY: number;
  treeScale: number;
};

export const DEFAULT_ISLAND_TUNING: IslandTuning = {
  tileWidth: 54,
  tileHeight: 34,
  tileGap: 6,
  tileSpriteScale: 1,
  tileAnchorY: 0,
  tileSpriteOffsetX: 0,
  tileSpriteOffsetY: 6,
  baselineAlign: 0.1,
  islandScale: 1.1,
  islandShape: "oval",
  maxGridSize: 8,
  personScale: 0.4,
  personAnchorY: 1,
  personOffsetX: -2,
  personOffsetY: -34,
  treeScale: 0.49,
  treeAnchorY: 0.93,
  treeOffsetX: 0,
  treeOffsetY: -35,
  showCellOrigin: false,
  showGroundShadow: true,
};

export function cloneIslandTuning(tuning: IslandTuning): IslandTuning {
  return { ...tuning };
}
