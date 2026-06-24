import { MATERIAL_SYMBOL_ICONS } from "@/lib/material-symbol-icons";
import { describe, expect, it } from "vitest";

describe("MATERIAL_SYMBOL_ICONS", () => {
  it("is sorted alphabetically for Google Fonts subset API", () => {
    const sorted = [...MATERIAL_SYMBOL_ICONS].sort((a, b) => a.localeCompare(b));
    expect([...MATERIAL_SYMBOL_ICONS]).toEqual(sorted);
  });

  it("contains no duplicates", () => {
    expect(new Set(MATERIAL_SYMBOL_ICONS).size).toBe(MATERIAL_SYMBOL_ICONS.length);
  });
});
