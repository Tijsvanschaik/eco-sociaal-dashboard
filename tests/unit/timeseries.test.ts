import { buildWeeklyTimeseries } from "@/lib/timeseries";
import { describe, expect, it } from "vitest";

describe("buildWeeklyTimeseries", () => {
  it("groups registrations by ISO week and orders oldest to newest", () => {
    const result = buildWeeklyTimeseries(
      [
        { happenedOn: "2026-04-08", co2KgCached: 2, socialScoreCached: 1, quantity: 1 },
        { happenedOn: "2026-04-07", co2KgCached: 1.5, quantity: 1 },
        { happenedOn: "2026-04-15", co2KgCached: 4, socialScoreCached: 0.25, quantity: 2 },
      ],
      { period: "all" },
    );

    expect(result).toEqual([
      {
        weekStart: "2026-04-06",
        co2SavedKg: 3.5,
        socialScoreSaved: 1,
        registrationCount: 2,
      },
      {
        weekStart: "2026-04-13",
        co2SavedKg: 4,
        socialScoreSaved: 0.25,
        registrationCount: 1,
      },
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(buildWeeklyTimeseries([], { period: "all" })).toEqual([]);
  });

  it("filters rows outside the selected calendar year", () => {
    const result = buildWeeklyTimeseries(
      [
        { happenedOn: "2025-12-31", co2KgCached: 10, quantity: 1 },
        { happenedOn: "2026-04-10", co2KgCached: 5, quantity: 1 },
        { happenedOn: "2027-01-01", co2KgCached: 8, quantity: 1 },
      ],
      { year: 2026 },
    );

    expect(result).toEqual([
      {
        weekStart: "2026-04-06",
        co2SavedKg: 5,
        socialScoreSaved: 0,
        registrationCount: 1,
      },
    ]);
  });

  it("filters rows outside the selected 30 day period", () => {
    const result = buildWeeklyTimeseries(
      [
        { happenedOn: "2026-02-01", co2KgCached: 10, quantity: 1 },
        { happenedOn: "2026-04-10", co2KgCached: 5, quantity: 1 },
      ],
      { now: "2026-04-21", period: "30d" },
    );

    expect(result).toEqual([
      {
        weekStart: "2026-04-06",
        co2SavedKg: 5,
        socialScoreSaved: 0,
        registrationCount: 1,
      },
    ]);
  });

  it("treats monday as the start of the week", () => {
    const result = buildWeeklyTimeseries(
      [
        { happenedOn: "2026-04-12", co2KgCached: 2, quantity: 1 },
        { happenedOn: "2026-04-13", co2KgCached: 3, quantity: 1 },
      ],
      { period: "all" },
    );

    expect(result).toEqual([
      {
        weekStart: "2026-04-06",
        co2SavedKg: 2,
        socialScoreSaved: 0,
        registrationCount: 1,
      },
      {
        weekStart: "2026-04-13",
        co2SavedKg: 3,
        socialScoreSaved: 0,
        registrationCount: 1,
      },
    ]);
  });
});
