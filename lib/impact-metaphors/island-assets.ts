import { DEFAULT_ISLAND_TUNING, type IslandTuning } from "@/lib/impact-metaphors/island-tuning";

const ISLAND_ASSET_BASE = "/assets/island";

export const ISLAND_GRASS_VARIANTS = [
  {
    id: "grass1",
    source: { width: 170, height: 196 },
    url: `${ISLAND_ASSET_BASE}/grass-1.svg`,
  },
  {
    id: "grass2",
    source: { width: 170, height: 196 },
    url: `${ISLAND_ASSET_BASE}/grass-2.svg`,
  },
] as const;

/** @deprecated Use ISLAND_GRASS_VARIANTS — kept for legacy imports. */
export const ISLAND_ASSET_URLS = {
  grassTile: ISLAND_GRASS_VARIANTS[0].url,
} as const;

export const ISLAND_TREE_VARIANTS = [
  {
    id: "tree1",
    source: { width: 130, height: 210 },
    url: `${ISLAND_ASSET_BASE}/tree-1.svg`,
  },
  {
    id: "tree2",
    source: { width: 130, height: 210 },
    url: `${ISLAND_ASSET_BASE}/tree-2.svg`,
  },
  {
    id: "tree3",
    source: { width: 130, height: 210 },
    url: `${ISLAND_ASSET_BASE}/tree-3.svg`,
  },
  {
    id: "tree4",
    source: { width: 130, height: 210 },
    url: `${ISLAND_ASSET_BASE}/tree-4.svg`,
  },
  {
    id: "tree5",
    source: { width: 130, height: 210 },
    url: `${ISLAND_ASSET_BASE}/tree-5.svg`,
  },
  {
    id: "tree6",
    source: { width: 130, height: 210 },
    url: `${ISLAND_ASSET_BASE}/tree-6.svg`,
  },
] as const;

export const ISLAND_PERSON_VARIANTS = [
  {
    id: "man1",
    source: { width: 60, height: 142 },
    url: `${ISLAND_ASSET_BASE}/man1.svg`,
  },
  {
    id: "man2",
    source: { width: 60, height: 142 },
    url: `${ISLAND_ASSET_BASE}/man2.svg`,
  },
  {
    id: "fem1",
    source: { width: 60, height: 142 },
    url: `${ISLAND_ASSET_BASE}/fem1.svg`,
  },
  {
    id: "fem2",
    source: { width: 60, height: 142 },
    url: `${ISLAND_ASSET_BASE}/fem2.svg`,
  },
] as const;

export type GrassVariantId = (typeof ISLAND_GRASS_VARIANTS)[number]["id"];
export type TreeVariantId = (typeof ISLAND_TREE_VARIANTS)[number]["id"];
export type PersonVariantId = (typeof ISLAND_PERSON_VARIANTS)[number]["id"];

/** @deprecated Use ISLAND_PERSON_VARIANTS[0].source — kept for legacy imports. */
export const PERSON_SOURCE = ISLAND_PERSON_VARIANTS[0].source;

/** Default grass source size (all grass variants share the same viewBox). */
export const GRASS_TILE_SOURCE = ISLAND_GRASS_VARIANTS[0].source;

/** Default tree source size (all tree variants share the same viewBox). */
export const TREE_SOURCE = ISLAND_TREE_VARIANTS[0].source;

export function resolveGrassVariant(variant: GrassVariantId = "grass1") {
  return ISLAND_GRASS_VARIANTS.find((entry) => entry.id === variant) ?? ISLAND_GRASS_VARIANTS[0];
}

export function resolveTreeVariant(variant: TreeVariantId = "tree1") {
  return ISLAND_TREE_VARIANTS.find((entry) => entry.id === variant) ?? ISLAND_TREE_VARIANTS[0];
}

export function resolvePersonVariant(variant: PersonVariantId = "man1") {
  return ISLAND_PERSON_VARIANTS.find((entry) => entry.id === variant) ?? ISLAND_PERSON_VARIANTS[0];
}

export function grassTileRenderSize(
  tuning: IslandTuning = DEFAULT_ISLAND_TUNING,
  variant: GrassVariantId = "grass1",
) {
  const spec = resolveGrassVariant(variant);
  const footprint = tuning.tileWidth * tuning.tileSpriteScale;
  const scale = footprint / spec.source.width;
  return {
    height: spec.source.height * scale,
    scale,
    url: spec.url,
    width: footprint,
    x: -(spec.source.width * scale) / 2 + tuning.tileSpriteOffsetX,
    y: -(spec.source.height * scale) + footprint * tuning.tileAnchorY + tuning.tileSpriteOffsetY,
  };
}

export function treeRenderSize(
  tuning: IslandTuning = DEFAULT_ISLAND_TUNING,
  variant: TreeVariantId = "tree1",
) {
  const spec = resolveTreeVariant(variant);
  const scale = (tuning.tileWidth * tuning.treeScale) / spec.source.width;
  const anchorY = spec.source.height * tuning.treeAnchorY;
  return {
    height: spec.source.height * scale,
    scale,
    url: spec.url,
    width: spec.source.width * scale,
    x: -(spec.source.width * scale) / 2 + tuning.treeOffsetX,
    y: -(anchorY * scale) + tuning.treeOffsetY,
  };
}

export function personRenderSize(
  tuning: IslandTuning = DEFAULT_ISLAND_TUNING,
  variant: PersonVariantId = "man1",
) {
  const spec = resolvePersonVariant(variant);
  const scale = (tuning.tileWidth * tuning.personScale) / spec.source.width;
  const anchorY = spec.source.height * tuning.personAnchorY;
  return {
    height: spec.source.height * scale,
    scale,
    url: spec.url,
    width: spec.source.width * scale,
    x: -(spec.source.width * scale) / 2 + tuning.personOffsetX,
    y: -(anchorY * scale) + tuning.personOffsetY,
  };
}
