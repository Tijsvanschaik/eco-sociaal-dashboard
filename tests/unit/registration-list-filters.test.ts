import { describe, expect, it } from "vitest";

import {
  deriveRegistrationListYears,
  resolveRegistrationListYear,
} from "@/lib/registrations/list-filters";

describe("deriveRegistrationListYears", () => {
  it("returns unique years newest first", () => {
    expect(
      deriveRegistrationListYears(["2024-03-01", "2025-11-02", "2025-01-15", "2023-12-31"]),
    ).toEqual([2025, 2024, 2023]);
  });

  it("ignores invalid dates", () => {
    expect(deriveRegistrationListYears(["invalid", "2025-06-01"])).toEqual([2025]);
  });
});

describe("resolveRegistrationListYear", () => {
  it("keeps the requested year when it has data", () => {
    expect(resolveRegistrationListYear(2024, [2025, 2024])).toBe(2024);
  });

  it("falls back to the newest year with data", () => {
    expect(resolveRegistrationListYear(2026, [2025, 2024])).toBe(2025);
  });

  it("keeps the requested year when there is no data yet", () => {
    expect(resolveRegistrationListYear(2026, [])).toBe(2026);
  });
});
