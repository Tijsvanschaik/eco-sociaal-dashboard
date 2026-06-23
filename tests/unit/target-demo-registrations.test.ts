import { describe, expect, it } from "vitest";

import {
  TARGET_DEMO_REGISTRATION_TEMPLATES,
  computeTargetDemoTotals,
} from "../../scripts/target-demo-registrations-data";

describe("target demo registrations", () => {
  it("sums to approximately 500 kg CO₂ and 30 social score", () => {
    const { totalCo2Kg, totalSocialScore, count } = computeTargetDemoTotals();

    expect(count).toBe(TARGET_DEMO_REGISTRATION_TEMPLATES.length);
    expect(totalCo2Kg).toBeGreaterThanOrEqual(495);
    expect(totalCo2Kg).toBeLessThanOrEqual(505);
    expect(totalSocialScore).toBeGreaterThanOrEqual(28);
    expect(totalSocialScore).toBeLessThanOrEqual(32);
  });
});
