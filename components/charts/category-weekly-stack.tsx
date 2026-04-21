"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import type { WeeklyCategoryTimeseriesRow } from "@/lib/timeseries";

type CategoryLegendItem = {
  color?: string;
  id: string;
  name: string;
  registrationCount: number;
};

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

export function CategoryWeeklyStack({
  categories,
  data,
  description,
  title,
}: {
  categories: CategoryLegendItem[];
  data: WeeklyCategoryTimeseriesRow[];
  description: string;
  title: string;
}) {
  const activeCategories = categories
    .filter((category) => category.registrationCount > 0)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 || activeCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Zodra meerdere categorieen gebruikt worden, zie je hier de spreiding per week.
          </p>
        ) : (
          <>
            <ChartContainer
              className="h-[280px]"
              config={Object.fromEntries(
                activeCategories.map((category) => [
                  category.id,
                  { label: category.name, color: category.color ?? "#2563eb" },
                ]),
              )}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="weekStart"
                    tickFormatter={formatWeek}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tickFormatter={(value: number) => `${formatKg(value)} kg`} width={72} />
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${formatKg(Number(value ?? 0))} kg`}
                      />
                    }
                    labelFormatter={(value) => `Week van ${formatWeek(String(value))}`}
                  />
                  {activeCategories.map((category) => (
                    <Bar
                      key={category.id}
                      dataKey={category.id}
                      stackId="co2"
                      fill={category.color ?? "#2563eb"}
                      radius={4}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex flex-wrap gap-3 text-sm">
              {activeCategories.map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: category.color ?? "#2563eb" }}
                  />
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
