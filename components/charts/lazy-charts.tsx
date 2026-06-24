"use client";

import dynamic from "next/dynamic";

import { ChartSkeleton } from "@/components/charts/chart-skeleton";

export const LazyTrendAreaChartBody = dynamic(
  () => import("@/components/charts/trend-area-chart").then((mod) => mod.TrendAreaChartBody),
  {
    loading: () => <ChartSkeleton fillContainer />,
    ssr: false,
  },
);

export const LazyCategoryDonutPanel = dynamic(
  () => import("@/components/charts/category-donut-chart").then((mod) => mod.CategoryDonutPanel),
  {
    loading: () => <ChartSkeleton height={220} />,
    ssr: false,
  },
);
