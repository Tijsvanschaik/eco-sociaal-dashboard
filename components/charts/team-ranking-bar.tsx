"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

type TeamRow = {
  co2SavedKg: number;
  id: string;
  name: string;
};

function formatKg(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
    minimumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function TeamRankingBar({
  description,
  items,
  title,
}: {
  description: string;
  items: TeamRow[];
  title: string;
}) {
  const rows = items.slice(0, 6).filter((item) => item.co2SavedKg > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Zodra teams registreren, zie je hier welke teams vooroplopen.
          </p>
        ) : (
          <ChartContainer
            className="h-[280px]"
            config={{ co2SavedKg: { label: "CO2", color: "#0f766e" } }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ left: 12, right: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value: number) => `${formatKg(value)} kg`} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `${formatKg(Number(value ?? 0))} kg`}
                    />
                  }
                />
                <Bar dataKey="co2SavedKg" fill="#0f766e" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
