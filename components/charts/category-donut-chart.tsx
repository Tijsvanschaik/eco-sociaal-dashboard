"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

type CategorySlice = {
  co2SavedKg: number;
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

export function CategoryDonutChart({
  description,
  items,
  title,
}: {
  description: string;
  items: CategorySlice[];
  title: string;
}) {
  const rows = items.filter((item) => item.registrationCount > 0);
  const total = rows.reduce((sum, item) => sum + item.co2SavedKg, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nog geen categorieverdeling beschikbaar. Registreer eerst een paar acties.
          </p>
        ) : (
          <>
            <ChartContainer
              className="h-[260px]"
              config={Object.fromEntries(
                rows.map((item) => [item.id, { label: item.name, color: item.color ?? "#84cc16" }]),
              )}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${formatKg(Number(value ?? 0))} kg`}
                      />
                    }
                  />
                  <Pie
                    data={rows}
                    dataKey="co2SavedKg"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {rows.map((item) => (
                      <Cell key={item.id} fill={item.color ?? "#84cc16"} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="space-y-2">
              <p className="text-sm font-medium">Totaal {formatKg(total)} kg</p>
              {rows.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: item.color ?? "#84cc16" }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-muted-foreground">{formatKg(item.co2SavedKg)} kg</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
