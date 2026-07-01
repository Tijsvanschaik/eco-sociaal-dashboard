import { expect, test } from "@playwright/test";

const shareSlug = process.env.PLAYWRIGHT_SHARE_SLUG;

test.describe("public share surfaces", () => {
  test.skip(!shareSlug, "Set PLAYWRIGHT_SHARE_SLUG to run public dashboard smoke tests.");

  test("public dashboard renders the impact + recent registrations slides", async ({ page }) => {
    await page.goto(`/p/${shareSlug}`);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/totale impact/i)).toBeVisible();
    await expect(page.getByText(/top teams/i)).toBeVisible();
    await expect(page.getByTestId("trend-chart").locator("svg").first()).toBeVisible();
    await expect(page.getByText(/recente eco-sociale activiteiten/i)).toBeVisible();
  });

  test("tv dashboard renders in kiosk slideshow mode on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/tv/${shareSlug}`);

    await expect(page.getByTestId("public-surface")).toHaveAttribute("data-mode", "tv");
    // Slideshow shell only renders on lg+ viewports; on smaller viewports
    // the kiosk falls back to <KioskStack>.
    await expect(page.getByTestId("kiosk-slideshow")).toBeVisible();
  });

  test("embed defaults to a stack of all three slides", async ({ page }) => {
    await page.goto(`/embed/${shareSlug}`);

    await expect(page.getByTestId("org-welcome-panel")).toBeVisible();
    await expect(page.getByText(/totale impact/i)).toBeVisible();
    await expect(page.getByText(/impact per categorie/i)).toBeVisible();
    await expect(page.getByText(/recente eco-sociale activiteiten/i)).toBeVisible();
  });

  test("embed?mode=rotate renders the slideshow shell on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/embed/${shareSlug}?mode=rotate`);

    await expect(page.getByTestId("kiosk-slideshow")).toBeVisible();
  });

  test("embed?screens=1,3 only renders the requested slides", async ({ page }) => {
    await page.goto(`/embed/${shareSlug}?screens=1,3`);

    await expect(page.getByText(/totale impact/i)).toBeVisible();
    await expect(page.getByText(/recente eco-sociale activiteiten/i)).toBeVisible();
    await expect(page.getByText(/impact per categorie/i)).toHaveCount(0);
  });
});
