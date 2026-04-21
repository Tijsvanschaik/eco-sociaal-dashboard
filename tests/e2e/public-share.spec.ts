import { expect, test } from "@playwright/test";

const shareSlug = process.env.PLAYWRIGHT_SHARE_SLUG;

test.describe("public share surfaces", () => {
  test.skip(!shareSlug, "Set PLAYWRIGHT_SHARE_SLUG to run public dashboard smoke tests.");

  test("public dashboard renders aggregate cards", async ({ page }) => {
    await page.goto(`/p/${shareSlug}`);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/CO2 bespaard/i)).toBeVisible();
    await expect(page.getByText(/Top teams/i)).toBeVisible();
  });

  test("tv dashboard renders in kiosk mode", async ({ page }) => {
    await page.goto(`/tv/${shareSlug}`);

    await expect(page.getByText(/TV-modus/i)).toBeVisible();
    await expect(page.getByText(/Actieve collega's/i)).toBeVisible();
  });

  test("embed dashboard renders read-only metrics", async ({ page }) => {
    await page.goto(`/embed/${shareSlug}`);

    await expect(page.getByText(/Intranet embed/i)).toBeVisible();
    await expect(page.getByText(/Per categorie/i)).toBeVisible();
  });
});
