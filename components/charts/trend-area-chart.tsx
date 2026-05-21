"use client";

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
import type { WeeklyTimeseriesRow } from "@/lib/timeseries";
import { cn } from "@/lib/utils";

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

type WeeklyRowExtras = WeeklyTimeseriesRow & {
  cumulativeCo2Kg?: number;
  cumulativeSocial?: number;
};

/**
 * Kale trend-chart zonder eigen Card-wrapper, voor hergebruik binnen het
 * branded `<DashboardPanel>` op het interne dashboard. Public-surfaces blijven
 * de `<TrendAreaChart>`-Card-variant gebruiken.
 *
 * Met `cumulative={true}` worden wekelijkse waarden naar een cumulatieve lijn
 * opgeteld voor zowel kg CO₂ als sociale score.
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
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyState ??
          "Nog geen trend zichtbaar. Zodra er registraties zijn, verschijnt hier de weeklijn."}
      </p>
    );
  }

  const showSocialSeries = data.some((row) => row.socialScoreSaved > 0.0005);

  const chartData = (
    cumulative
      ? data.reduce<WeeklyRowExtras[]>((rows, row) => {
          const prev = rows.at(-1);
          rows.push({
            ...row,
            cumulativeCo2Kg: (prev?.cumulativeCo2Kg ?? 0) + row.co2SavedKg,
            cumulativeSocial: (prev?.cumulativeSocial ?? 0) + row.socialScoreSaved,
          });
          return rows;
        }, [])
      : data
  ) as WeeklyRowExtras[];

  const co2Key = cumulative ? "cumulativeCo2Kg" : "co2SavedKg";
  const socialKey = cumulative ? "cumulativeSocial" : "socialScoreSaved";

  const config: Record<string, { color: string; label: string }> = {
    [co2Key]: {
      label: cumulative ? "CO₂ cumulatief (kg)" : "CO₂ per week (kg)",
      color: "var(--primary)",
    },
  };
  if (showSocialSeries) {
    config[socialKey] = {
      label: cumulative ? "Sociale score cumulatief" : "Sociale score per week",
      color: "var(--chart-3, var(--tertiary))",
    };
  }

  return (
    <ChartContainer
      className={cn(
        "w-full",
        fillContainer ? "h-full min-h-[min(42vh,12rem)] flex-1" : "h-[260px]",
      )}
      config={config}
      data-testid="trend-chart"
      style={fillContainer ? { height: "100%" } : { height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: 8, right: showSocialSeries ? 12 : 8, top: 8 }}>
          <defs>
            <linearGradient id="trend-area-fill-co2" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="trend-area-fill-social" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-3, var(--tertiary))" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--chart-3, var(--tertiary))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="weekStart"
            tickFormatter={formatWeek}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            yAxisId="co2"
            tickFormatter={(value: number) => `${formatKg(value)} kg`}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          {showSocialSeries ? (
            <YAxis
              yAxisId="social"
              orientation="right"
              tickFormatter={(value: number) => formatScore(value)}
              tickLine={false}
              axisLine={false}
              width={56}
            />
          ) : null}
          <Tooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  const key = String(name);
                  const num = Number(value ?? 0);
                  if (key === co2Key) return `${formatKg(num)} kg CO₂`;
                  if (key === socialKey && showSocialSeries) return `${formatScore(num)} score`;
                  return String(value ?? "");
                }}
              />
            }
            labelFormatter={(value) => `Week van ${formatWeek(String(value))}`}
          />
          <Area
            type="monotone"
            dataKey={co2Key}
            yAxisId="co2"
            stroke="var(--primary)"
            fill="url(#trend-area-fill-co2)"
            strokeWidth={2.5}
          />
          {showSocialSeries ? (
            <Area
              type="monotone"
              dataKey={socialKey}
              yAxisId="social"
              stroke="var(--chart-3, var(--tertiary))"
              fill="url(#trend-area-fill-social)"
              strokeWidth={2}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
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
