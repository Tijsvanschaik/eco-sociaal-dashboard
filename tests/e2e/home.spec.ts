import { expect, test } from "@playwright/test";

test("home page redirects guests to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("button", { name: /doorgaan/i })).toBeVisible();
});
