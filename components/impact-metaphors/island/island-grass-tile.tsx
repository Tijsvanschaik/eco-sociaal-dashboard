import { grassTileRenderSize } from "@/lib/impact-metaphors/island-assets";
import type { IslandTile } from "@/lib/impact-metaphors/island-grid";
import type { IslandTuning } from "@/lib/impact-metaphors/island-tuning";

type IslandGrassTileProps = {
  tile: IslandTile;
  tuning: IslandTuning;
};

export function IslandGrassTileContent({ tile, tuning }: IslandGrassTileProps) {
  const size = grassTileRenderSize(tuning, tile.grassVariant);

  return (
    <>
      {tuning.showCellOrigin ? (
        <>
          <circle cx="0" cy="0" fill="#ff4d4d" opacity="0.9" r="2.5" />
          <circle
            cx="0"
            cy={tile.baselineOffset}
            fill="none"
            opacity="0.5"
            r="4"
            stroke="#ff4d4d"
            strokeDasharray="2 2"
            strokeWidth="0.75"
          />
        </>
      ) : null}
      <image
        height={size.height}
        href={size.url}
        preserveAspectRatio="xMidYMid meet"
        width={size.width}
        x={size.x}
        y={size.y + tile.baselineOffset}
      />
    </>
  );
}

export function IslandGrassTile({ tile, tuning }: IslandGrassTileProps) {
  return (
    <g transform={`translate(${tile.x} ${tile.y})`}>
      <IslandGrassTileContent tile={tile} tuning={tuning} />
    </g>
  );
}

export function IslandGroundShadow({
  tiles,
  tuning,
}: {
  tiles: IslandTile[];
  tuning: IslandTuning;
}) {
  if (tiles.length === 0 || !tuning.showGroundShadow) return null;

  const xs = tiles.map((tile) => tile.x);
  const surfaceYs = tiles.map((tile) => tile.y + tile.baselineOffset);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = Math.max(...surfaceYs) + tuning.tileHeight * 1.1;

  return (
    <ellipse
      cx={cx}
      cy={cy}
      fill="#0a1a0a"
      opacity="0.12"
      rx={tuning.tileWidth * (Math.sqrt(tiles.length) / 2 + 0.28)}
      ry={tuning.tileHeight * 0.95}
    />
  );
}
