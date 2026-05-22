"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Icon } from "@/components/ui/icon";
import type { WeeklyTimeseriesRow } from "@/lib/timeseries";
import { cn } from "@/lib/utils";

type TrendViewMode = "eco" | "social" | "both";

type WeeklyRowExtras = WeeklyTimeseriesRow & {
  cumulativeCo2Kg?: number;
  cumulativeSocial?: number;
};

const METRIC_EPSILON = 0.0005;
const Y_AXIS_HEADROOM = 1.12;

function yAxisMaxWithHeadroom(max: number): number {
  if (!Number.isFinite(max) || max <= 0) return 1;
  return Math.ceil(max * Y_AXIS_HEADROOM);
}

function formatKg(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function formatScore(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function formatWeek(value: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function hasTrendSocialData(data: WeeklyTimeseriesRow[]): boolean {
  return data.some((row) => row.socialScoreSaved > METRIC_EPSILON);
}

function buildChartData(data: WeeklyTimeseriesRow[], cumulative: boolean): WeeklyRowExtras[] {
  if (!cumulative) return data;

  return data.reduce<WeeklyRowExtras[]>((rows, row) => {
    const prev = rows.at(-1);
    rows.push({
      ...row,
      cumulativeCo2Kg: (prev?.cumulativeCo2Kg ?? 0) + row.co2SavedKg,
      cumulativeSocial: (prev?.cumulativeSocial ?? 0) + row.socialScoreSaved,
    });
    return rows;
  }, []);
}

function TrendViewSelector({
  hasSocial,
  viewMode,
  onChange,
}: {
  hasSocial: boolean;
  viewMode: TrendViewMode;
  onChange: (mode: TrendViewMode) => void;
}) {
  if (!hasSocial) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon aria-hidden name="eco" filled className="text-sm text-tertiary" />
        kg CO<sub>2</sub>
      </div>
    );
  }

  const options: Array<{ id: TrendViewMode; label: string; icon?: "eco" | "favorite" | "both" }> = [
    { id: "eco", label: "Eco", icon: "eco" },
    { id: "social", label: "Sociaal", icon: "favorite" },
    { id: "both", label: "Eco-sociaal", icon: "both" },
  ];

  return (
    <div
      aria-label="Trendweergave"
      className="inline-flex max-w-full rounded-full bg-surface-container-high p-1"
      role="radiogroup"
    >
      {options.map((option) => {
        const isActive = viewMode === option.id;

        return (
          <button
            key={option.id}
            aria-checked={isActive}
            aria-label={option.label}
            className={cn(
              "inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:px-4 sm:text-sm",
              isActive && option.id === "eco" && "bg-tertiary text-tertiary-foreground shadow-sm",
              isActive && option.id === "social" && "bg-primary text-primary-foreground shadow-sm",
              isActive &&
                option.id === "both" &&
                "bg-card text-foreground shadow-sm ring-1 ring-border/80",
              !isActive && "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onChange(option.id)}
            // biome-ignore lint/a11y/useSemanticElements: styled tablist controls; native radio styling doesn't match design
            role="radio"
            type="button"
          >
            {option.icon === "both" ? (
              <span aria-hidden className="inline-flex items-center -space-x-0.5">
                <Icon name="eco" filled className="text-[13px] text-tertiary" />
                <Icon name="favorite" filled className="text-[13px] text-primary" />
              </span>
            ) : (
              <Icon
                aria-hidden
                name={option.icon ?? "eco"}
                filled
                className={cn(
                  "text-sm",
                  option.id === "eco" ? "text-tertiary" : "text-primary",
                  isActive && option.id !== "both" && "text-inherit",
                )}
              />
            )}
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Kale trend-chart zonder eigen Card-wrapper, voor hergebruik binnen het
 * branded `<DashboardPanel>` op het interne dashboard. Public-surfaces blijven
 * de `<TrendAreaChart>`-Card-variant gebruiken.
 *
 * Met `cumulative={true}` worden wekelijkse waarden naar een cumulatieve lijn
 * opgeteld voor zowel kg CO₂ als sociale punten.
 */
export function TrendAreaChartBody({
  cumulative = false,
  data,
  emptyState,
  /** Vaste hoogte in px. Genegeerd wanneer `fillContainer` true is. */
  height = 260,
  /** Laat de grafiek de resterende hoogte van een flex-container vullen (kiosk / TV). */
  fillContainer = false,
}: {
  cumulative?: boolean;
  data: WeeklyTimeseriesRow[];
  emptyState?: string;
  height?: number;
  fillContainer?: boolean;
}) {
  const hasSocial = useMemo(() => hasTrendSocialData(data), [data]);
  const [viewMode, setViewMode] = useState<TrendViewMode>("both");

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyState ??
          "Nog geen trend zichtbaar. Zodra er registraties zijn, verschijnt hier de weeklijn."}
      </p>
    );
  }

  const chartData = buildChartData(data, cumulative);
  const co2Key = cumulative ? "cumulativeCo2Kg" : "co2SavedKg";
  const socialKey = cumulative ? "cumulativeSocial" : "socialScoreSaved";
  const showEcoSeries = viewMode === "eco" || viewMode === "both";
  const showSocialSeries = hasSocial && (viewMode === "social" || viewMode === "both");
  const showBoth = showEcoSeries && showSocialSeries;

  const config: Record<string, { color: string; label: string }> = {};
  if (showEcoSeries) {
    config[co2Key] = {
      label: cumulative ? "CO₂ cumulatief (kg)" : "CO₂ per week (kg)",
      color: "var(--tertiary)",
    };
  }
  if (showSocialSeries) {
    config[socialKey] = {
      label: cumulative ? "Sociale punten cumulatief" : "Sociale punten per week",
      color: "var(--primary)",
    };
  }

  return (
    <div className={cn("space-y-4", fillContainer && "flex min-h-0 flex-1 flex-col")}>
      <TrendViewSelector hasSocial={hasSocial} viewMode={viewMode} onChange={setViewMode} />

      <ChartContainer
        className={cn("w-full", fillContainer ? "min-h-[260px] flex-1" : "h-[260px]")}
        config={config}
        data-testid="trend-chart"
        style={fillContainer ? { height: "100%" } : { height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              bottom: showBoth ? 18 : 12,
              left: 4,
              right: showBoth ? 28 : 8,
              top: 20,
            }}
          >
            <defs>
              <linearGradient id="trend-area-fill-eco" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--tertiary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--tertiary)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="trend-area-fill-social" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="weekStart"
              axisLine={false}
              minTickGap={28}
              tick={{ dy: 4 }}
              tickFormatter={formatWeek}
              tickLine={false}
              tickMargin={8}
            />
            {showEcoSeries ? (
              <YAxis
                axisLine={false}
                domain={[0, yAxisMaxWithHeadroom]}
                tickFormatter={(value: number) => `${formatKg(value)} kg`}
                tickLine={false}
                tickMargin={6}
                width={72}
                yAxisId="co2"
              />
            ) : null}
            {showSocialSeries ? (
              <YAxis
                axisLine={false}
                domain={[0, yAxisMaxWithHeadroom]}
                orientation={showBoth ? "right" : "left"}
                tickFormatter={(value: number) =>
                  showBoth ? `${formatScore(value)} ptn` : `${formatScore(value)} punten`
                }
                tickLine={false}
                tickMargin={6}
                width={showBoth ? 64 : 72}
                yAxisId="social"
              />
            ) : null}
            <Tooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const key = String(name);
                    const num = Number(value ?? 0);
                    if (key === co2Key) return `${formatKg(num)} kg CO₂`;
                    if (key === socialKey) return `${formatScore(num)} punten`;
                    return String(value ?? "");
                  }}
                />
              }
              labelFormatter={(value) => `Week van ${formatWeek(String(value))}`}
              wrapperStyle={{ zIndex: 20 }}
            />
            {showEcoSeries ? (
              <Area
                type="monotone"
                dataKey={co2Key}
                yAxisId="co2"
                stroke="var(--tertiary)"
                fill="url(#trend-area-fill-eco)"
                strokeWidth={2.5}
              />
            ) : null}
            {showSocialSeries ? (
              <Area
                type="monotone"
                dataKey={socialKey}
                yAxisId="social"
                stroke="var(--primary)"
                fill="url(#trend-area-fill-social)"
                strokeWidth={2}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

export function TrendAreaChart({
  data,
  description,
  title,
}: {
  data: WeeklyTimeseriesRow[];
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <TrendAreaChartBody data={data} />
      </CardContent>
    </Card>
  );
}
