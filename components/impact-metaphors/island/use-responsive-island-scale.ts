"use client";

import { useEffect, useMemo, useState } from "react";

import {
  computeIslandHorizontalSpanFromTiles,
  computeIslandViewBoxBoundsFromTiles,
  computeResponsiveIslandScale,
} from "@/lib/impact-metaphors/island-grid";
import type {
  IslandTile,
  IslandViewBoxBounds,
  IslandViewBoxOptions,
} from "@/lib/impact-metaphors/island-grid";
import type { IslandTuning } from "@/lib/impact-metaphors/island-tuning";

export function useResponsiveIslandScale({
  boost,
  enabled,
  tiles,
  tuning,
  viewBoxBounds,
  viewBoxOptions,
}: {
  boost: number;
  enabled: boolean;
  tiles: IslandTile[];
  tuning: IslandTuning;
  viewBoxBounds?: IslandViewBoxBounds;
  viewBoxOptions?: IslandViewBoxOptions;
}): {
  containerRef: (node: HTMLDivElement | null) => void;
  islandScale: number;
} {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ height: 0, width: 0 });

  useEffect(() => {
    if (!container || !enabled) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { height, width } = entry.contentRect;
      setSize({ height, width });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [container, enabled]);

  const viewBox = useMemo(
    () => viewBoxBounds ?? computeIslandViewBoxBoundsFromTiles(tiles, tuning, 48, viewBoxOptions),
    [tiles, tuning, viewBoxBounds, viewBoxOptions],
  );
  const contentSpan = useMemo(
    () => computeIslandHorizontalSpanFromTiles(tiles, tuning),
    [tiles, tuning],
  );

  const islandScale = useMemo(() => {
    if (!enabled) return boost;

    return computeResponsiveIslandScale({
      boost,
      containerHeight: size.height,
      containerWidth: size.width,
      contentSpan,
      viewBoxHeight: viewBox.height,
      viewBoxWidth: viewBox.width,
    });
  }, [boost, contentSpan, enabled, size.height, size.width, viewBox.height, viewBox.width]);

  return {
    containerRef: setContainer,
    islandScale,
  };
}
