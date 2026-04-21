import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Snapshot-achtige safety-net: voorkomt dat kritieke brand-tokens per ongeluk
 * verdwijnen uit globals.css. Hoeft niet elk token te dekken, alleen die
 * zichzelf niet verdedigen via de chart- of button-componenten.
 */

describe("brand tokens in app/globals.css", () => {
  const cssPromise = readFile(resolve(__dirname, "../../app/globals.css"), "utf8");

  it.each([
    "--background:",
    "--foreground:",
    "--primary:",
    "--primary-foreground:",
    "--primary-dim:",
    "--primary-container:",
    "--tertiary:",
    "--tertiary-container:",
    "--muted:",
    "--muted-foreground:",
    "--border:",
    "--input:",
    "--ring:",
    "--chart-1:",
    "--chart-2:",
    "--chart-3:",
    "--radius:",
    "--radius-lg:",
    "--radius-xl:",
  ])("defines %s in :root", async (token) => {
    const css = await cssPromise;
    const rootBlock = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
    expect(rootBlock).toContain(token);
  });

  it("exposes Tailwind font + color aliases in @theme", async () => {
    const css = await cssPromise;
    expect(css).toContain("--font-sans:");
    expect(css).toContain("--color-primary-dim: var(--primary-dim)");
    expect(css).toContain("--color-tertiary: var(--tertiary)");
    expect(css).toContain("--color-chart-1: var(--chart-1)");
  });

  it("keeps a .dark override block with an inverted primary", async () => {
    const css = await cssPromise;
    const darkBlock = css.slice(css.indexOf(".dark"));
    expect(darkBlock).toMatch(/--background:\s*#1[0-9a-f]{5}/i);
    expect(darkBlock).toContain("--primary:");
  });
});
