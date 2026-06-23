"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartResponsiveContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type CategorySlice = {
  co2SavedKg: number;
  color?: string;
  eodDays?: number;
  id: string;
  name: string;
  registrationCount: number;
  socialScoreTotal: number;
};

type SliceMetricKey = keyof Pick<CategorySlice, "co2SavedKg" | "socialScoreTotal">;

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

const percentFormatter = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });

const METRIC_EPSILON = 0.0005;

export function hasMetricTotal(items: CategorySlice[], metricKey: SliceMetricKey): boolean {
  return items.some((item) => item[metricKey] > METRIC_EPSILON);
}

export function sortedRowsForMetric(
  items: CategorySlice[],
  metricKey: SliceMetricKey,
): CategorySlice[] {
  return items
    .filter((item) => item.registrationCount > 0 && item[metricKey] > METRIC_EPSILON)
    .sort((a, b) => b[metricKey] - a[metricKey]);
}

function CategoryMetricDonut({
  centerSubtitle,
  centerValueFormatter,
  items,
  limit = 6,
  metricFormatter,
  metricKey,
  size = 252,
}: {
  centerSubtitle: string;
  centerValueFormatter: (value: number) => string;
  items: CategorySlice[];
  limit?: number;
  metricFormatter: (value: number) => string;
  metricKey: SliceMetricKey;
  size?: number;
}) {
  const rows = sortedRowsForMetric(items, metricKey);
  const total = rows.reduce((sum, item) => sum + item[metricKey], 0);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nog geen data voor deze metric. Voeg registraties toe in andere categorieën.
      </p>
    );
  }

  return (
    <div className="@container grid grid-cols-1 gap-5 @[34rem]:grid-cols-[auto_1fr] @[34rem]:items-center">
      <div className="flex justify-center">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center px-8 text-center">
            <span className="text-2xl font-extrabold leading-none tracking-tight text-foreground sm:text-3xl">
              {centerValueFormatter(total)}
            </span>
            <span className="mt-1.5 text-[11px] font-semibold leading-tight text-muted-foreground sm:text-xs">
              {centerSubtitle}
            </span>
          </div>
          <ChartContainer
            className="relative z-10 h-full w-full"
            config={Object.fromEntries(
              rows.map((item) => [item.id, { label: item.name, color: item.color ?? "#84cc16" }]),
            )}
          >
            <ChartResponsiveContainer initialHeight={size} initialWidth={size}>
              <PieChart>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      className="z-20"
                      formatter={(value) => metricFormatter(Number(value ?? 0))}
                    />
                  }
                  wrapperStyle={{ zIndex: 20 }}
                />
                <Pie
                  data={rows}
                  dataKey={metricKey}
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {rows.map((item) => (
                    <Cell key={item.id} fill={item.color ?? "#84cc16"} />
                  ))}
                </Pie>
              </PieChart>
            </ChartResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <ol className="flex w-full min-w-0 flex-col gap-2">
        {rows.slice(0, limit).map((item) => {
          const metricValue = item[metricKey];
          const share = total > 0 ? (metricValue / total) * 100 : 0;

          return (
            <li
              key={`${metricKey}:${item.id}`}
              className="flex items-center gap-2.5 rounded-[1rem] bg-surface-container-low px-3 py-1.5"
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color ?? "#84cc16" }}
              />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {item.name}
              </span>
              <span className="flex-none text-xs font-semibold text-muted-foreground">
                {metricFormatter(metricValue)}
              </span>
              <span className="w-10 flex-none text-right text-sm font-bold text-foreground">
                {percentFormatter.format(share)}%
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Donut per categorie — eco en sociaal gestapeld, zonder tabs.
 */
export function CategoryDonutChartBody({
  items,
  limit = 6,
  periodLabel: _periodLabel,
  size = 252,
}: {
  items: CategorySlice[];
  limit?: number;
  periodLabel?: string;
  size?: number;
}) {
  const hasEco = useMemo(() => hasMetricTotal(items, "co2SavedKg"), [items]);
  const hasSocial = useMemo(() => hasMetricTotal(items, "socialScoreTotal"), [items]);

  if (items.filter((item) => item.registrationCount > 0).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nog geen categorieverdeling beschikbaar. Voeg eerst een paar registraties toe.
      </p>
    );
  }

  if (!hasEco && !hasSocial) {
    return (
      <p className="text-sm text-muted-foreground">
        Nog geen impact per categorie. Voeg registraties toe met eco- of sociale waarde.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {hasEco ? (
        <CategoryMetricDonut
          centerSubtitle="kg CO₂ bespaard"
          centerValueFormatter={formatKg}
          items={items}
          limit={limit}
          metricFormatter={(value) => `${formatKg(value)} kg`}
          metricKey="co2SavedKg"
          size={size}
        />
      ) : null}

      {hasSocial ? (
        <CategoryMetricDonut
          centerSubtitle="sociale punten"
          centerValueFormatter={formatScore}
          items={items}
          limit={limit}
          metricFormatter={(value) => `${formatScore(value)} punten`}
          metricKey="socialScoreTotal"
          size={size}
        />
      ) : null}
    </div>
  );
}

export function CategoryDonutChart({
  description,
  items,
  periodLabel,
  title,
}: {
  description: string;
  items: CategorySlice[];
  periodLabel?: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CategoryDonutChartBody items={items} periodLabel={periodLabel} />
      </CardContent>
    </Card>
  );
}
