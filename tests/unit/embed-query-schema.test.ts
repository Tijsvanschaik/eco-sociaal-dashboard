import { describe, expect, it } from "vitest";

import { parseEmbedQuery } from "@/lib/embed/query-schema";

describe("parseEmbedQuery", () => {
  it("falls back to defaults for an empty input", () => {
    const result = parseEmbedQuery({});

    expect(result.mode).toBe("stack");
    expect(result.screens).toEqual(["1", "2", "3"]);
    expect(result.intervalMs).toBe(8_000);
  });

  it("respects mode=rotate and a custom interval", () => {
    const result = parseEmbedQuery({ mode: "rotate", interval: "12" });

    expect(result.mode).toBe("rotate");
    expect(result.intervalMs).toBe(12_000);
  });

  it("filters and orders screens by the comma-separated input", () => {
    const result = parseEmbedQuery({ screens: "3,1" });

    expect(result.screens).toEqual(["3", "1"]);
  });

  it("rejects invalid screen ids and falls back to defaults", () => {
    const result = parseEmbedQuery({ screens: "1,9" });

    expect(result.screens).toEqual(["1", "2", "3"]);
  });

  it("clamps interval values that exceed the allowed range to the default", () => {
    const tooLow = parseEmbedQuery({ interval: "1" });
    const tooHigh = parseEmbedQuery({ interval: "999" });

    expect(tooLow.intervalMs).toBe(8_000);
    expect(tooHigh.intervalMs).toBe(8_000);
  });

  it("ignores unknown modes and falls back to stack", () => {
    const result = parseEmbedQuery({ mode: "fly" });

    expect(result.mode).toBe("stack");
  });
});
