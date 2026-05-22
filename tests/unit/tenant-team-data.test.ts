import { buildDashboardSnapshot } from "@/lib/dashboard";
import { filterRegistrationsByTeamId } from "@/lib/tenant-team-data";
import { describe, expect, it } from "vitest";

const categories = [
  { id: "cat-mob", name: "Mobiliteit", color: "#3b82f6" },
  { id: "cat-voe", name: "Voeding", color: "#10b981" },
];

const interventions = [
  { id: "int-bike", name: "Fietsen", categoryId: "cat-mob" },
  { id: "int-veggie", name: "Vegetarisch eten", categoryId: "cat-voe" },
];

describe("filterRegistrationsByTeamId", () => {
  it("filtert registraties op team_id", () => {
    const rows = [
      { teamId: "team-hel", value: 1 },
      { teamId: "team-ast", value: 2 },
      { teamId: "team-hel", value: 3 },
    ];

    expect(filterRegistrationsByTeamId(rows, "team-hel")).toEqual([
      { teamId: "team-hel", value: 1 },
      { teamId: "team-hel", value: 3 },
    ]);
  });

  it("geeft lege lijst voor onbekend team", () => {
    const rows = [{ teamId: "team-hel", value: 1 }];
    expect(filterRegistrationsByTeamId(rows, "team-unknown")).toEqual([]);
  });
});

describe("team detail snapshot (pure aggregation)", () => {
  it("bouwt segments en KPI's alleen voor het geselecteerde team", () => {
    const teamRegistrations = filterRegistrationsByTeamId(
      [
        {
          teamId: "team-hel",
          interventionId: "int-bike",
          userId: "u1",
          co2KgCached: 10,
          socialScoreCached: 2,
        },
        {
          teamId: "team-hel",
          interventionId: "int-veggie",
          userId: "u2",
          co2KgCached: 5,
          socialScoreCached: 0,
        },
        {
          teamId: "team-ast",
          interventionId: "int-bike",
          userId: "u3",
          co2KgCached: 99,
          socialScoreCached: 99,
        },
      ],
      "team-hel",
    );

    const snapshot = buildDashboardSnapshot({
      baselineKg: 10_000,
      categories,
      interventions,
      teams: [{ id: "team-hel", name: "LEV Helmond" }],
      registrations: teamRegistrations,
    });

    expect(snapshot.totalCo2Kg).toBe(15);
    expect(snapshot.totalSocialScore).toBe(2);
    expect(snapshot.registrationCount).toBe(2);
    expect(snapshot.teamBreakdown).toHaveLength(1);
    expect(snapshot.teamBreakdown[0]?.segments).toHaveLength(2);
    expect(snapshot.categoryBreakdown).toHaveLength(2);
  });

  it("handelt leeg team af zonder segments", () => {
    const snapshot = buildDashboardSnapshot({
      baselineKg: null,
      categories,
      interventions,
      teams: [{ id: "team-hel", name: "LEV Helmond" }],
      registrations: [],
    });

    expect(snapshot.totalCo2Kg).toBe(0);
    expect(snapshot.teamBreakdown[0]?.segments).toEqual([]);
  });
});
