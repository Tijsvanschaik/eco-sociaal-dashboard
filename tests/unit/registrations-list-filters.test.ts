import {
  canEditRegistration,
  parseRegistrationListYear,
  parseRegistrationScopeFilter,
  parseRegistrationTeamFilter,
} from "@/lib/registrations/list-filters";
import { describe, expect, it, vi } from "vitest";

describe("parseRegistrationListYear", () => {
  it("defaults to the dashboard calendar year", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00Z"));
    expect(parseRegistrationListYear(undefined)).toBe(2026);
    vi.useRealTimers();
  });

  it("parses a valid year query param", () => {
    expect(parseRegistrationListYear("2025")).toBe(2025);
  });

  it("falls back when the year is invalid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-26T12:00:00Z"));
    expect(parseRegistrationListYear("abc")).toBe(2026);
    vi.useRealTimers();
  });
});

describe("parseRegistrationTeamFilter", () => {
  it("returns null for all teams", () => {
    expect(parseRegistrationTeamFilter("all")).toBeNull();
    expect(parseRegistrationTeamFilter(undefined)).toBeNull();
  });

  it("accepts a valid team uuid", () => {
    const teamId = "11111111-1111-1111-1111-111111111111";
    expect(parseRegistrationTeamFilter(teamId)).toBe(teamId);
  });

  it("rejects invalid team ids", () => {
    expect(parseRegistrationTeamFilter("not-a-uuid")).toBeNull();
  });
});

describe("parseRegistrationScopeFilter", () => {
  it("defaults workers to mine registrations", () => {
    expect(parseRegistrationScopeFilter(undefined, "worker")).toBe("mine");
  });

  it("allows workers to switch to all registrations", () => {
    expect(parseRegistrationScopeFilter("all", "worker")).toBe("all");
  });

  it("defaults admins to all registrations", () => {
    expect(parseRegistrationScopeFilter(undefined, "admin")).toBe("all");
  });

  it("allows admins to switch to mine", () => {
    expect(parseRegistrationScopeFilter("mine", "admin")).toBe("mine");
  });
});

describe("canEditRegistration", () => {
  it("allows admins to edit any registration", () => {
    expect(canEditRegistration("admin", "admin-id", "worker-id")).toBe(true);
  });

  it("allows workers to edit only their own registration", () => {
    expect(canEditRegistration("worker", "worker-id", "worker-id")).toBe(true);
    expect(canEditRegistration("worker", "worker-id", "other-id")).toBe(false);
  });
});
