import {
  type PersonVariantId,
  type TreeVariantId,
  personRenderSize,
  treeRenderSize,
} from "@/lib/impact-metaphors/island-assets";
import type { IslandTuning } from "@/lib/impact-metaphors/island-tuning";

type IslandTreeSpriteProps = {
  tuning: IslandTuning;
  variant: TreeVariantId;
};

export function IslandTreeSprite({ tuning, variant }: IslandTreeSpriteProps) {
  const size = treeRenderSize(tuning, variant);

  return (
    <g transform={`translate(0 ${-tuning.tileWidth * 0.08})`}>
      <image
        height={size.height}
        href={size.url}
        opacity={0.98}
        preserveAspectRatio="xMidYMax meet"
        width={size.width}
        x={size.x}
        y={size.y}
      />
    </g>
  );
}

type IslandPersonSpriteProps = {
  tuning: IslandTuning;
  variant: PersonVariantId;
};

export function IslandPersonSprite({ tuning, variant }: IslandPersonSpriteProps) {
  const size = personRenderSize(tuning, variant);

  return (
    <g transform={`translate(0 ${-tuning.tileWidth * 0.04})`}>
      <image
        height={size.height}
        href={size.url}
        opacity={0.98}
        preserveAspectRatio="xMidYMax meet"
        width={size.width}
        x={size.x}
        y={size.y}
      />
    </g>
  );
}
