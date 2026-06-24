import { filterTeamsForRegistration } from "@/lib/tenant-registration-form-data";
import { describe, expect, it } from "vitest";

describe("filterTeamsForRegistration", () => {
  const teams = [
    { id: "team-a", name: "Team A" },
    { id: "team-b", name: "Team B" },
  ];

  it("returns all teams for admins", () => {
    expect(filterTeamsForRegistration(teams, new Set(["team-a"]), "admin")).toEqual(teams);
  });

  it("returns only member teams for workers", () => {
    expect(filterTeamsForRegistration(teams, new Set(["team-b"]), "worker")).toEqual([
      { id: "team-b", name: "Team B" },
    ]);
  });

  it("returns empty list when worker has no team memberships", () => {
    expect(filterTeamsForRegistration(teams, new Set(), "worker")).toEqual([]);
  });
});
