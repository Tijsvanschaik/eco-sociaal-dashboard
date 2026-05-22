"use client";

import { useMemo, useState } from "react";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { Icon } from "@/components/ui/icon";
import type { TeamBreakdownSegment } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

type ActivityMetricTab = "eco" | "social";

function formatKg(kg: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: kg >= 100 ? 0 : 1,
  }).format(kg);
}

function formatScore(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

function sortSegments(
  segments: TeamBreakdownSegment[],
  tab: ActivityMetricTab,
): TeamBreakdownSegment[] {
  const metricKey = tab === "eco" ? "co2SavedKg" : "socialScoreTotal";
  return [...segments]
    .filter((segment) => segment[metricKey] > 0)
    .sort((a, b) => b[metricKey] - a[metricKey]);
}

export type TeamActivityBreakdownProps = {
  periodLabel: string;
  segments: TeamBreakdownSegment[];
};

export function TeamActivityBreakdown({ periodLabel, segments }: TeamActivityBreakdownProps) {
  const hasEco = segments.some((segment) => segment.co2SavedKg > 0);
  const hasSocial = segments.some((segment) => segment.socialScoreTotal > 0);
  const defaultTab: ActivityMetricTab = hasEco ? "eco" : "social";
  const [tab, setTab] = useState<ActivityMetricTab>(defaultTab);

  const sortedSegments = useMemo(() => sortSegments(segments, tab), [segments, tab]);
  const maxMetric = useMemo(
    () =>
      sortedSegments.reduce(
        (max, segment) =>
          Math.max(max, tab === "eco" ? segment.co2SavedKg : segment.socialScoreTotal),
        0,
      ),
    [sortedSegments, tab],
  );

  return (
    <DashboardPanel
      description={`Impact per interventie · ${periodLabel}`}
      icon="list_alt"
      iconTone="tertiary"
      title="Activiteiten per interventie"
      action={
        hasEco && hasSocial ? (
          <div className="inline-flex rounded-full bg-card p-1 shadow-sm">
            <TabButton active={tab === "eco"} label="Eco" onClick={() => setTab("eco")} />
            <TabButton active={tab === "social"} label="Sociaal" onClick={() => setTab("social")} />
          </div>
        ) : null
      }
    >
      {sortedSegments.length === 0 ? (
        <p className="rounded-[1.25rem] border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
          Nog geen activiteiten geregistreerd voor dit team.
        </p>
      ) : (
        <ol className="space-y-4">
          {sortedSegments.map((segment) => {
            const metricValue = tab === "eco" ? segment.co2SavedKg : segment.socialScoreTotal;
            const barWidthPercent =
              maxMetric > 0 ? Math.min(100, (metricValue / maxMetric) * 100) : 0;
            const metricLabel =
              tab === "eco"
                ? `${formatKg(segment.co2SavedKg)} kg CO₂`
                : `${formatScore(segment.socialScoreTotal)} punten`;

            return (
              <li key={segment.id} className="space-y-2">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {segment.interventionName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span
                        aria-hidden
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: segment.categoryColor }}
                      />
                      {segment.categoryName}
                      <span aria-hidden>·</span>
                      {segment.registrationCount}{" "}
                      {segment.registrationCount === 1 ? "registratie" : "registraties"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-foreground">{metricLabel}</span>
                </div>
                <div
                  aria-label={`${segment.interventionName}: ${metricLabel}`}
                  className="relative h-3 w-full overflow-hidden rounded-full bg-card shadow-[inset_0_1px_2px_rgba(54,50,45,0.04)]"
                  role="img"
                >
                  {metricValue > 0 ? (
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        tab === "eco" ? "bg-tertiary" : "bg-primary",
                      )}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {sortedSegments.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Icon aria-hidden name="eco" filled className="text-sm text-tertiary" />
            Eco · kg CO<sub>2</sub>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon aria-hidden name="favorite" filled className="text-sm text-primary" />
            Sociaal · punten
          </span>
        </div>
      ) : null}
    </DashboardPanel>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
