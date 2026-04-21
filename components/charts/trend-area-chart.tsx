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
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen trend zichtbaar. Zodra er registraties zijn, verschijnt hier de weeklijn.
          </p>
        ) : (
          <ChartContainer
            className="h-[260px]"
            config={{ co2SavedKg: { label: "CO2 bespaard", color: "#16a34a" } }}
            data-testid="trend-chart"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
                    <ChartTooltipContent
                      formatter={(value) => `${formatKg(Number(value ?? 0))} kg`}
                    />
                  }
                  labelFormatter={(value) => `Week van ${formatWeek(String(value))}`}
                />
                <Area
                  type="monotone"
                  dataKey="co2SavedKg"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
