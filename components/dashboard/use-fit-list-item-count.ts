"use client";

import { useEffect, useState } from "react";

/** Default visible rows before layout measurement (SSR, tests, mobile). */
export const DEFAULT_FIT_LIST_ITEM_COUNT = 5;

/** Approximate row height for team bars in the impact overview panel. */
export const TEAM_BAR_ROW_HEIGHT_PX = 58;
/** Slightly taller estimate on kiosk/TV (rank badge + bar + gaps). */
export const KIOSK_TEAM_BAR_ROW_HEIGHT_PX = 62;
export const TEAM_BAR_ROW_GAP_PX = 10;
/** List gap when team rows are not links (TV / embed). */
export const KIOSK_TEAM_BAR_ROW_GAP_PX = 16;

export function computeFitListItemCount({
  containerHeightPx,
  fallbackCount = DEFAULT_FIT_LIST_ITEM_COUNT,
  gapPx = TEAM_BAR_ROW_GAP_PX,
  itemCount,
  itemHeightPx = TEAM_BAR_ROW_HEIGHT_PX,
  minCount = 1,
}: {
  containerHeightPx: number;
  fallbackCount?: number;
  gapPx?: number;
  itemCount: number;
  itemHeightPx?: number;
  minCount?: number;
}): number {
  if (itemCount === 0) return 0;
  if (containerHeightPx <= 0) return Math.min(itemCount, fallbackCount);

  const rowSpan = itemHeightPx + gapPx;
  const count = Math.floor((containerHeightPx + gapPx) / rowSpan);
  return Math.min(itemCount, Math.max(minCount, count));
}

export function useFitListItemCount({
  enabled,
  fallbackCount = DEFAULT_FIT_LIST_ITEM_COUNT,
  gapPx = TEAM_BAR_ROW_GAP_PX,
  itemCount,
  itemHeightPx = TEAM_BAR_ROW_HEIGHT_PX,
  minCount = 1,
}: {
  enabled: boolean;
  fallbackCount?: number;
  gapPx?: number;
  itemCount: number;
  itemHeightPx?: number;
  minCount?: number;
}): {
  containerRef: (node: HTMLDivElement | null) => void;
  fitCount: number;
} {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [fitCount, setFitCount] = useState(fallbackCount);

  useEffect(() => {
    if (!enabled || !container || itemCount === 0) {
      setFitCount(Math.min(itemCount, fallbackCount));
      return;
    }

    const measure = () => {
      setFitCount(
        computeFitListItemCount({
          containerHeightPx: container.clientHeight,
          fallbackCount,
          gapPx,
          itemCount,
          itemHeightPx,
          minCount,
        }),
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);

    return () => observer.disconnect();
  }, [container, enabled, fallbackCount, gapPx, itemCount, itemHeightPx, minCount]);

  return { containerRef: setContainer, fitCount };
}

export function useLargeScreenLayout(enabled = true): boolean {
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsLarge(false);
      return;
    }

    if (typeof window.matchMedia !== "function") {
      setIsLarge(false);
      return;
    }

    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLarge(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [enabled]);

  return isLarge;
}
