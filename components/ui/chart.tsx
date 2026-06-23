"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    color: string;
    label: string;
  }
>;

const ChartContext = React.createContext<ChartConfig | null>(null);

const DEFAULT_CHART_INITIAL_DIMENSION = {
  width: 360,
  height: 260,
} as const;

type ChartResponsiveContainerProps = React.ComponentProps<typeof ResponsiveContainer> & {
  /** Fallback height until ResizeObserver measures the parent. */
  initialHeight?: number;
  /** Fallback width until ResizeObserver measures the parent. */
  initialWidth?: number;
};

export function ChartResponsiveContainer({
  children,
  height = "100%",
  initialDimension,
  initialHeight = DEFAULT_CHART_INITIAL_DIMENSION.height,
  initialWidth = DEFAULT_CHART_INITIAL_DIMENSION.width,
  minWidth = 0,
  width = "100%",
  ...props
}: ChartResponsiveContainerProps) {
  return (
    <ResponsiveContainer
      height={height}
      initialDimension={initialDimension ?? { width: initialWidth, height: initialHeight }}
      minWidth={minWidth}
      width={width}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
}

export function ChartContainer({
  children,
  className,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
}) {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    style[`--color-${key}`] = value.color;
  }

  return (
    <ChartContext.Provider value={config}>
      <div
        className={cn("h-[260px] min-h-0 w-full min-w-0 text-sm", className)}
        style={style as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
}

export function useChartConfig() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChartConfig must be used within a ChartContainer.");
  }

  return context;
}

export function ChartTooltipContent({
  active,
  className,
  formatter,
  label,
  payload,
}: {
  active?: boolean;
  className?: string;
  formatter?: (value: number, name: string) => string;
  label?: string | number;
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    fill?: string;
    name?: string;
    value?: number | string;
  }>;
}) {
  const config = React.useContext(ChartContext);

  if (!active || !payload?.length) return null;

  return (
    <div className={cn("rounded-lg border bg-background px-3 py-2 shadow-sm", className)}>
      {label ? <p className="mb-2 text-xs text-muted-foreground">{String(label)}</p> : null}
      <div className="space-y-1.5">
        {payload.map((item) => {
          const itemConfig = config?.[item.dataKey as string];
          const itemLabel = itemConfig?.label ?? item.name ?? String(item.dataKey);
          const value = typeof item.value === "number" ? item.value : Number(item.value ?? 0);

          return (
            <div key={String(item.dataKey)} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color ?? item.fill ?? itemConfig?.color }}
                />
                <span>{itemLabel}</span>
              </div>
              <span className="font-medium">
                {formatter ? formatter(value, String(item.dataKey)) : value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
