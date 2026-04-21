"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    color: string;
    label: string;
  }
>;

const ChartContext = React.createContext<ChartConfig | null>(null);

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
        className={cn("h-[260px] w-full text-sm", className)}
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
