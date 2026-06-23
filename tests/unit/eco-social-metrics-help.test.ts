import { describe, expect, it } from "vitest";

import {
  QUANTITIES_PANEL_HELP,
  getEcoQuantityHelp,
  getSocialQuantityHelp,
} from "@/lib/copy/eco-social-metrics-help";

describe("eco-social-metrics-help", () => {
  it("returns unit-specific eco hints", () => {
    expect(getEcoQuantityHelp("uur").paragraphs.some((line) => /uren/i.test(line))).toBe(true);
    expect(getEcoQuantityHelp("km").paragraphs.some((line) => /kilometers/i.test(line))).toBe(true);
  });

  it("returns unit-specific social hints based on eco unit", () => {
    expect(getSocialQuantityHelp("stuk").paragraphs.some((line) => /aanwezigen/i.test(line))).toBe(
      true,
    );
    expect(getSocialQuantityHelp("kg").paragraphs.some((line) => /materiaal/i.test(line))).toBe(
      true,
    );
  });

  it("structures the quantities panel with eco and social sections", () => {
    expect(QUANTITIES_PANEL_HELP.sections).toHaveLength(2);
    expect(QUANTITIES_PANEL_HELP.sections?.[0]?.title).toBe("Eco");
    expect(QUANTITIES_PANEL_HELP.sections?.[1]?.body).toMatch(/medewerkers/i);
    expect(QUANTITIES_PANEL_HELP.footer).toMatch(/eco-sociale score/i);
  });
});
