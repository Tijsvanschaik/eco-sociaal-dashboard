import { ISLAND_ASSET_URLS, treeRenderSize } from "@/lib/impact-metaphors/island-assets";
import { ISO_TILE_WIDTH } from "@/lib/impact-metaphors/island-grid";

type IslandTreeSpriteProps = {
  highlighted?: boolean;
};

/** Tree sprite from sandbox PNG asset. */
export function IslandTreeSprite({ highlighted = false }: IslandTreeSpriteProps) {
  const size = treeRenderSize(ISO_TILE_WIDTH);

  return (
    <g transform={`translate(0 ${-ISO_TILE_WIDTH * 0.08})`}>
      {highlighted ? (
        <ellipse
          cx="0"
          cy="6"
          fill="#befa7f"
          opacity="0.35"
          rx={size.width * 0.22}
          ry={size.width * 0.07}
        />
      ) : null}
      <image
        height={size.height}
        href={ISLAND_ASSET_URLS.tree}
        opacity={highlighted ? 1 : 0.98}
        preserveAspectRatio="xMidYMax meet"
        style={highlighted ? { filter: "brightness(1.08) saturate(1.1)" } : undefined}
        width={size.width}
        x={size.x}
        y={size.y}
      />
    </g>
  );
}

type IslandPersonSpriteProps = {
  highlighted?: boolean;
};

/** Placeholder until a matching person PNG is supplied. */
export function IslandPersonSprite({ highlighted = false }: IslandPersonSpriteProps) {
  return (
    <g transform="translate(0 -2)">
      <ellipse cx="0" cy="4" fill="#1a1208" opacity={highlighted ? 0.2 : 0.12} rx="8" ry="2.5" />
      <circle
        cx="0"
        cy="-22"
        fill={highlighted ? "#ff8fc9" : "var(--primary)"}
        r="6.5"
        stroke="color-mix(in srgb, var(--primary) 60%, #36322d)"
        strokeWidth="0.75"
      />
      <path
        d="M0 -14c-5 0-8 3.5-8 8v8c0 1 .8 1.8 1.8 1.8h12.4c1 0 1.8-.8 1.8-1.8v-8c0-4.5-3-8-8-8z"
        fill={highlighted ? "#ff8fc9" : "var(--primary)"}
        stroke="color-mix(in srgb, var(--primary) 60%, #36322d)"
        strokeWidth="0.75"
      />
    </g>
  );
}
