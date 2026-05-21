"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export type CategorySlice = {
  co2SavedKg: number;
  color?: string;
  /** Zelfde maat als team-top: equivalente dagen t.o.v. baseline. Ontbreekt bv. op oude callers → val terug op %. */
  eodDays?: number;
  id: string;
  name: string;
  registrationCount: number;
  /** Eénheidloze geaggregeerde sociale score (parallel aan co2SavedKg op categorieniveau). */
  socialScoreTotal: number;
};

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
const integerFormatter = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 0 });

type SliceMetricKey = keyof Pick<CategorySlice, "co2SavedKg" | "socialScoreTotal">;

function CategoryMetricDonut({
  centerSubtitle,
  items,
  limit = 6,
  metricFormatter,
  metricKey,
  size = 220,
  title,
}: {
  centerSubtitle: string;
  items: CategorySlice[];
  limit?: number;
  metricFormatter: (value: number) => string;
  metricKey: SliceMetricKey;
  size?: number;
  title: string;
}) {
  const rows = items.filter((item) => item.registrationCount > 0);
  const total = rows.reduce((sum, item) => sum + item[metricKey], 0);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto sm:mx-0" style={{ width: size, height: size }}>
          <ChartContainer
            className="h-full w-full"
            config={Object.fromEntries(
              rows.map((item) => [item.id, { label: item.name, color: item.color ?? "#84cc16" }]),
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => metricFormatter(Number(value ?? 0))}
                    />
                  }
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
            </ResponsiveContainer>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Totaal
            </span>
            <span className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
              {metricFormatter(total)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{centerSubtitle}</span>
          </div>
        </div>

        <ol className="flex flex-col gap-2.5">
          {rows.slice(0, limit).map((item) => {
            const metricValue = item[metricKey];
            const share = total > 0 ? (metricValue / total) * 100 : 0;
            const eodDays = item.eodDays;
            const showDays = metricKey === "co2SavedKg" && eodDays !== undefined;
            const daysLabel = eodDays === 1 ? "dag" : "dagen";

            return (
              <li
                key={`${metricKey}:${item.id}`}
                className="flex items-center gap-3 rounded-[1rem] bg-surface-container-low px-3 py-2"
              >
                <span
                  aria-hidden
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color ?? "#84cc16" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {metricFormatter(metricValue)}
                  </p>
                </div>
                {showDays ? (
                  <span className="flex-none text-sm font-bold">
                    <span className="text-primary">{integerFormatter.format(eodDays)}</span>{" "}
                    <span className="text-foreground">{daysLabel}</span>
                  </span>
                ) : (
                  <span className="flex-none text-sm font-bold text-foreground">
                    {percentFormatter.format(share)}%
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/**
 * Twee donutdiagrammen (CO₂ + sociale score) met gedeelde legenda-geest.
 * Kale variant zonder Card-wrapper.
 */
export function CategoryDonutChartBody({
  items,
  limit = 6,
  size = 220,
}: {
  items: CategorySlice[];
  limit?: number;
  size?: number;
}) {
  if (items.filter((item) => item.registrationCount > 0).length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nog geen categorieverdeling beschikbaar. Registreer eerst een paar acties.
      </p>
    );
  }

  const co2Block = (
    <CategoryMetricDonut
      centerSubtitle="besparing volgens gekozen periodes"
      items={items}
      limit={limit}
      metricFormatter={(value) => `${formatKg(value)} kg`}
      metricKey="co2SavedKg"
      size={size}
      title="CO₂ per categorie"
    />
  );

  const hasSocialTotals = items.some((item) => item.socialScoreTotal > 0.0005);
  const socialBlock = hasSocialTotals ? (
    <CategoryMetricDonut
      centerSubtitle="eenheid vrij te bepalen"
      items={items}
      limit={limit}
      metricFormatter={(value) => formatScore(value)}
      metricKey="socialScoreTotal"
      size={size}
      title="Sociale score per categorie"
    />
  ) : null;

  return (
    <div className={socialBlock ? "grid gap-8 lg:gap-10" : "space-y-0"}>
      {co2Block}
      {socialBlock}
    </div>
  );
}

export function CategoryDonutChart({
  description,
  items,
  title,
}: {
  description: string;
  items: CategorySlice[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CategoryDonutChartBody items={items} />
      </CardContent>
    </Card>
  );
}
