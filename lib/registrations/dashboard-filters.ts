import { parseRegistrationTeamFilter } from "@/lib/registrations/list-filters";

export type DashboardFeedPeriod = "30d" | "90d" | "all";

export type DashboardFeedFilters = {
  period: DashboardFeedPeriod;
  teamId: string | null;
};

export function parseDashboardFeedPeriod(
  value: string | string[] | undefined,
): DashboardFeedPeriod {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "30d" || raw === "90d" || raw === "all") return raw;
  return "all";
}

export function parseDashboardFeedFilters(searchParams: {
  period?: string | string[];
  team?: string | string[];
}): DashboardFeedFilters {
  return {
    period: parseDashboardFeedPeriod(searchParams.period),
    teamId: parseRegistrationTeamFilter(searchParams.team),
  };
}

/** ISO date (YYYY-MM-DD) for the earliest `happened_on` in a rolling window. */
export function getDashboardFeedPeriodStart(
  period: DashboardFeedPeriod,
  referenceDate = new Date(),
): string | null {
  if (period === "all") return null;
  const days = period === "30d" ? 30 : 90;
  const start = new Date(referenceDate);
  start.setUTCDate(start.getUTCDate() - days);
  return start.toISOString().slice(0, 10);
}

export function buildDashboardFeedQueryString(filters: DashboardFeedFilters): string {
  const params = new URLSearchParams();
  if (filters.period !== "all") params.set("period", filters.period);
  if (filters.teamId) params.set("team", filters.teamId);
  const query = params.toString();
  return query ? `?${query}` : "";
}
