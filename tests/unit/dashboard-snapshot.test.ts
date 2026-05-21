import { buildDashboardSnapshot } from "@/lib/dashboard";
import { describe, expect, it } from "vitest";

const categories = [
  { id: "cat-mob", name: "Mobiliteit", color: "#3b82f6" },
  { id: "cat-voe", name: "Voeding", color: "#10b981" },
];

const interventions = [
  { id: "int-bike", name: "Fietsen", categoryId: "cat-mob" },
  { id: "int-veggie", name: "Vegetarisch eten", categoryId: "cat-voe" },
];

const teams = [
  { id: "team-hel", name: "LEV Helmond" },
  { id: "team-ast", name: "LEV Asten" },
];

describe("buildDashboardSnapshot — teamBreakdown", () => {
  it("aggregeert per team en splitst op interventie met categoriekleur", () => {
    const snapshot = buildDashboardSnapshot({
      baselineKg: 10_000,
      categories,
      interventions,
      teams,
      registrations: [
        {
          teamId: "team-hel",
          interventionId: "int-bike",
          userId: "u1",
          co2KgCached: 10,
          socialScoreCached: 1,
        },
        {
          teamId: "team-hel",
          interventionId: "int-bike",
          userId: "u2",
          co2KgCached: 5,
          socialScoreCached: 2,
        },
        {
          teamId: "team-hel",
          interventionId: "int-veggie",
          userId: "u2",
          co2KgCached: 3,
          socialScoreCached: 0,
        },
        {
          teamId: "team-ast",
          interventionId: "int-bike",
          userId: "u3",
          co2KgCached: 4,
          socialScoreCached: 10,
        },
      ],
    });

    expect(snapshot.totalSocialScore).toBe(13);
    expect(snapshot.teamBreakdown).toHaveLength(2);

    const helmond = snapshot.teamBreakdown[0];
    if (!helmond) throw new Error("Helmond row missing");
    expect(helmond.name).toBe("LEV Helmond");
    expect(helmond.co2SavedKg).toBe(18);
    expect(helmond.socialScoreTotal).toBe(3);
    expect(helmond.registrationCount).toBe(3);
    expect(helmond.segments).toHaveLength(2);
    // 18 kg / 10000 kg * 365 dagen = 0.657 -> afgerond 1 dag
    expect(helmond.eodDays).toBe(1);

    const bikeSegment = helmond.segments.find((s) => s.interventionId === "int-bike");
    expect(bikeSegment).toMatchObject({
      interventionName: "Fietsen",
      categoryName: "Mobiliteit",
      categoryColor: "#3b82f6",
      co2SavedKg: 15,
      socialScoreTotal: 3,
      registrationCount: 2,
    });

    const veggieSegment = helmond.segments.find((s) => s.interventionId === "int-veggie");
    expect(veggieSegment).toMatchObject({
      categoryColor: "#10b981",
      co2SavedKg: 3,
      socialScoreTotal: 0,
    });

    const asten = snapshot.teamBreakdown[1];
    if (!asten) throw new Error("Asten row missing");
    expect(asten.name).toBe("LEV Asten");
    expect(asten.co2SavedKg).toBe(4);
    expect(asten.socialScoreTotal).toBe(10);
    expect(asten.segments).toHaveLength(1);
  });

  it("geeft lege teamBreakdown-inhoud wanneer er geen registraties zijn", () => {
    const snapshot = buildDashboardSnapshot({
      baselineKg: null,
      categories,
      interventions,
      teams,
      registrations: [],
    });

    expect(snapshot.totalCo2Kg).toBe(0);
    expect(snapshot.totalSocialScore).toBe(0);
    expect(snapshot.teamBreakdown).toHaveLength(2);
    for (const team of snapshot.teamBreakdown) {
      expect(team.co2SavedKg).toBe(0);
      expect(team.socialScoreTotal).toBe(0);
      expect(team.eodDays).toBe(0);
      expect(team.segments).toHaveLength(0);
    }
  });

  it("sorteert teams van hoog naar laag op gecombineerde eco + sociale impact", () => {
    const snapshot = buildDashboardSnapshot({
      baselineKg: null,
      categories,
      interventions,
      teams,
      registrations: [
        {
          teamId: "team-ast",
          interventionId: "int-bike",
          userId: "u1",
          co2KgCached: 100,
          socialScoreCached: 0,
        },
        {
          teamId: "team-hel",
          interventionId: "int-bike",
          userId: "u2",
          co2KgCached: 50,
          socialScoreCached: 0,
        },
      ],
    });

    expect(snapshot.teamBreakdown.map((team) => team.name)).toEqual(["LEV Asten", "LEV Helmond"]);
  });

  it("rankt teams met hogere gecombineerde score boven lagere CO2 wanneer sociaal zwaarder weegt", () => {
    const snapshot = buildDashboardSnapshot({
      baselineKg: null,
      categories,
      interventions,
      teams,
      registrations: [
        {
          teamId: "team-ast",
          interventionId: "int-bike",
          userId: "u1",
          co2KgCached: 10,
          socialScoreCached: 100,
        },
        {
          teamId: "team-hel",
          interventionId: "int-bike",
          userId: "u2",
          co2KgCached: 50,
          socialScoreCached: 0,
        },
      ],
    });

    expect(snapshot.teamBreakdown.map((team) => team.name)).toEqual(["LEV Asten", "LEV Helmond"]);
  });

  it("bij gelijke gecombineerde score sorteert op hogere CO2 eerst", () => {
    const snapshot = buildDashboardSnapshot({
      baselineKg: null,
      categories,
      interventions,
      teams,
      registrations: [
        {
          teamId: "team-ast",
          interventionId: "int-bike",
          userId: "u1",
          co2KgCached: 40,
          socialScoreCached: 20,
        },
        {
          teamId: "team-hel",
          interventionId: "int-bike",
          userId: "u2",
          co2KgCached: 50,
          socialScoreCached: 10,
        },
      ],
    });

    expect(snapshot.teamBreakdown.map((team) => team.name)).toEqual(["LEV Helmond", "LEV Asten"]);
  });
});
