"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type {
  DashboardFeedFilters,
  DashboardFeedPeriod,
} from "@/lib/registrations/dashboard-filters";
import type { TeamOption } from "@/lib/tenant-dashboard-data";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS: Array<{ label: string; value: DashboardFeedPeriod }> = [
  { label: "30 dagen", value: "30d" },
  { label: "90 dagen", value: "90d" },
  { label: "Dit jaar", value: "all" },
];

type RegistrationsFiltersProps = {
  filters: DashboardFeedFilters;
  orgSlug: string;
  showTeamFilter: boolean;
  teams: TeamOption[];
};

export function RegistrationsFilters({
  filters,
  orgSlug,
  showTeamFilter,
  teams,
}: RegistrationsFiltersProps) {
  const router = useRouter();

  function navigate(next: DashboardFeedFilters) {
    const params = new URLSearchParams();
    if (next.period !== "all") params.set("period", next.period);
    if (next.teamId) params.set("team", next.teamId);
    const query = params.toString();
    router.replace(`/${orgSlug}/dashboard${query ? `?${query}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Periode</p>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={filters.period === option.value ? "brand" : "outline"}
              className={cn(
                "min-h-9 rounded-full px-4",
                filters.period !== option.value && "border-border/60 bg-card",
              )}
              onClick={() => navigate({ ...filters, period: option.value })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {showTeamFilter && teams.length > 0 ? (
        <div className="space-y-2 md:w-auto">
          <p className="text-sm font-medium text-muted-foreground" id="feed-team-filter-label">
            Team
          </p>
          <select
            id="feed-team-filter"
            aria-labelledby="feed-team-filter-label"
            className="h-10 w-full min-w-0 rounded-full border border-border/60 bg-card px-4 text-sm font-medium text-foreground shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 md:min-w-[12rem] md:w-auto"
            value={filters.teamId ?? "all"}
            onChange={(event) =>
              navigate({
                ...filters,
                teamId: event.target.value === "all" ? null : event.target.value,
              })
            }
          >
            <option value="all">Alle teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
