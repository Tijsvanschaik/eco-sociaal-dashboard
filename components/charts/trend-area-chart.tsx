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

function formatKg(value: number): string {
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

/**
 * Kale trend-chart zonder eigen Card-wrapper, voor hergebruik binnen het
 * branded `<DashboardPanel>` op het interne dashboard. Public-surfaces blijven
 * de `<TrendAreaChart>`-Card-variant gebruiken.
 *
 * Met `cumulative={true}` wordt de wekelijkse `co2SavedKg` doorgeteld naar een
 * oplopende lijn — bedoeld voor "Voortgang 2026"-achtige progress-views.
 */
export function TrendAreaChartBody({
  cumulative = false,
  data,
  emptyState,
  height = 260,
}: {
  cumulative?: boolean;
  data: WeeklyTimeseriesRow[];
  emptyState?: string;
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyState ??
          "Nog geen trend zichtbaar. Zodra er registraties zijn, verschijnt hier de weeklijn."}
      </p>
    );
  }

  const chartData = cumulative
    ? data.reduce<Array<WeeklyTimeseriesRow & { cumulativeCo2Kg: number }>>((rows, row) => {
        const previous = rows.at(-1)?.cumulativeCo2Kg ?? 0;
        rows.push({ ...row, cumulativeCo2Kg: previous + row.co2SavedKg });
        return rows;
      }, [])
    : data;

  const dataKey = cumulative ? "cumulativeCo2Kg" : "co2SavedKg";
  const tooltipLabel = cumulative ? "CO2 tot deze week" : "CO2 bespaard";

  return (
    <ChartContainer
      className="w-full"
      style={{ height }}
      config={{ [dataKey]: { label: tooltipLabel, color: "var(--primary)" } }}
      data-testid="trend-chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="trend-area-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
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
            tickFormatter={(value: number) => `${formatKg(value)} kg`}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip
            content={
              <ChartTooltipContent formatter={(value) => `${formatKg(Number(value ?? 0))} kg`} />
            }
            labelFormatter={(value) => `Week van ${formatWeek(String(value))}`}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="var(--primary)"
            fill="url(#trend-area-fill)"
            strokeWidth={2.5}
          />
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
