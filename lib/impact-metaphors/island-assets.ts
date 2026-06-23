/** Sandbox isometric sprites — served from /public/dev/island-assets/ */
export const ISLAND_ASSET_URLS = {
  grassTile: "/dev/island-assets/grass-tile.png",
  tree: "/dev/island-assets/tree.png",
} as const;

/** Source PNG dimensions (grass-tile.png). */
export const GRASS_TILE_SOURCE = {
  width: 170,
  height: 196,
} as const;

/** Source PNG dimensions (tree.png). */
export const TREE_SOURCE = {
  width: 286,
  height: 281,
} as const;

/** Scale tile sprite to match ISO_TILE_WIDTH in island-grid.ts. */
export function grassTileRenderSize(isoTileWidth: number) {
  const scale = isoTileWidth / GRASS_TILE_SOURCE.width;
  return {
    height: GRASS_TILE_SOURCE.height * scale,
    scale,
    width: isoTileWidth,
    /** Sprite anchor: bottom-center of the block sits on the cell origin. */
    x: -(GRASS_TILE_SOURCE.width * scale) / 2,
    y: -(GRASS_TILE_SOURCE.height * scale) + isoTileWidth * 0.12,
  };
}

/** Tree anchored at the light-green base circle in the PNG. */
export function treeRenderSize(isoTileWidth: number) {
  const scale = (isoTileWidth * 1.15) / TREE_SOURCE.width;
  const anchorY = TREE_SOURCE.height * 0.94;
  return {
    height: TREE_SOURCE.height * scale,
    scale,
    width: TREE_SOURCE.width * scale,
    x: -(TREE_SOURCE.width * scale) / 2,
    y: -(anchorY * scale),
  };
}
