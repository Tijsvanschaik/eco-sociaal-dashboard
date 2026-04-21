import { expect, test } from "@playwright/test";

test("unauthenticated users are redirected away from superadmin", async ({ page }) => {
  await page.goto("/superadmin");
  await expect(page).toHaveURL(/\/login/);
});
