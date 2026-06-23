import {
  GRASS_TILE_SOURCE,
  ISLAND_ASSET_URLS,
  grassTileRenderSize,
} from "@/lib/impact-metaphors/island-assets";
import type { IslandTile } from "@/lib/impact-metaphors/island-grid";
import { ISO_TILE_HEIGHT, ISO_TILE_WIDTH } from "@/lib/impact-metaphors/island-grid";

type IslandGrassTileProps = {
  tile: IslandTile;
};

/** Isometric grass tile from sandbox sprite sheet. */
export function IslandGrassTile({ tile }: IslandGrassTileProps) {
  const size = grassTileRenderSize(ISO_TILE_WIDTH);

  return (
    <g transform={`translate(${tile.x} ${tile.y})`}>
      <image
        height={size.height}
        href={ISLAND_ASSET_URLS.grassTile}
        preserveAspectRatio="xMidYMid meet"
        width={size.width}
        x={size.x}
        y={size.y}
      />
    </g>
  );
}

export function IslandGroundShadow({ tiles }: { tiles: IslandTile[] }) {
  if (tiles.length === 0) return null;

  const xs = tiles.map((tile) => tile.x);
  const ys = tiles.map((tile) => tile.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = Math.max(...ys) + ISO_TILE_HEIGHT * 2.5;

  return (
    <ellipse
      cx={cx}
      cy={cy}
      fill="#0a1a0a"
      opacity="0.35"
      rx={ISO_TILE_WIDTH * (Math.sqrt(tiles.length) / 2 + 0.55)}
      ry={ISO_TILE_HEIGHT * 2.4}
    />
  );
}

export { GRASS_TILE_SOURCE, ISO_TILE_HEIGHT, ISO_TILE_WIDTH };
