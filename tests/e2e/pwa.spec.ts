import { expect, test } from "@playwright/test";

test.describe("PWA surface", () => {
  test("manifest is served with required install fields", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.ok()).toBeTruthy();

    const manifest = (await response.json()) as {
      name: string;
      short_name: string;
      display: string;
      start_url: string;
      icons: Array<{ src: string; sizes: string }>;
    };

    expect(manifest.name).toContain("Eco-sociaal");
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  test("login page links the web app manifest", async ({ page }) => {
    await page.goto("/login");
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestHref).toBe("/manifest.webmanifest");
  });

  test("service worker is available in production build", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("javascript");
  });

  test("offline fallback page renders", async ({ page }) => {
    await page.goto("/~offline");
    await expect(page.getByRole("heading", { name: "Je bent offline" })).toBeVisible();
  });
});
