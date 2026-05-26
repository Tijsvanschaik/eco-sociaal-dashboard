import {
  buildDashboardFeedQueryString,
  getDashboardFeedPeriodStart,
  parseDashboardFeedFilters,
  parseDashboardFeedPeriod,
} from "@/lib/registrations/dashboard-filters";
import { describe, expect, it, vi } from "vitest";

describe("parseDashboardFeedPeriod", () => {
  it("defaults to all", () => {
    expect(parseDashboardFeedPeriod(undefined)).toBe("all");
  });

  it("accepts valid period values", () => {
    expect(parseDashboardFeedPeriod("30d")).toBe("30d");
    expect(parseDashboardFeedPeriod("90d")).toBe("90d");
    expect(parseDashboardFeedPeriod("all")).toBe("all");
  });

  it("falls back for invalid values", () => {
    expect(parseDashboardFeedPeriod("week")).toBe("all");
  });
});

describe("parseDashboardFeedFilters", () => {
  it("combines team and period params", () => {
    const teamId = "11111111-1111-1111-1111-111111111111";
    expect(
      parseDashboardFeedFilters({
        period: "30d",
        team: teamId,
      }),
    ).toEqual({
      period: "30d",
      teamId,
    });
  });
});

describe("getDashboardFeedPeriodStart", () => {
  it("returns null for all", () => {
    expect(getDashboardFeedPeriodStart("all")).toBeNull();
  });

  it("returns a rolling start date for 30d", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00Z"));
    expect(getDashboardFeedPeriodStart("30d")).toBe("2026-04-26");
    vi.useRealTimers();
  });
});

describe("buildDashboardFeedQueryString", () => {
  it("builds query params for active filters", () => {
    expect(
      buildDashboardFeedQueryString({
        period: "90d",
        teamId: "11111111-1111-1111-1111-111111111111",
      }),
    ).toBe("?period=90d&team=11111111-1111-1111-1111-111111111111");
  });
});
