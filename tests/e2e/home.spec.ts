import { expect, test } from "@playwright/test";

test("home page renders the hero copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Eco-sociaal Dashboard/);
});
