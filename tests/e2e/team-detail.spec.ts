import { expect, test } from "@playwright/test";

const orgSlug = process.env.PLAYWRIGHT_ORG_SLUG;
const loginEmail = process.env.PLAYWRIGHT_LOGIN_EMAIL;
const loginPassword = process.env.PLAYWRIGHT_LOGIN_PASSWORD;

test.describe("team detail drill-down", () => {
  test.skip(
    !orgSlug || !loginEmail || !loginPassword,
    "Set PLAYWRIGHT_ORG_SLUG, PLAYWRIGHT_LOGIN_EMAIL and PLAYWRIGHT_LOGIN_PASSWORD for authenticated team drill-down.",
  );

  test("dashboard team link opens team detail page with KPIs", async ({ page }) => {
    if (!orgSlug || !loginEmail || !loginPassword) return;

    await page.goto("/admin");
    await page.getByLabel(/e-mail/i).fill(loginEmail);
    await page.getByLabel(/wachtwoord/i).fill(loginPassword);
    await page.getByRole("button", { name: /inloggen/i }).click();

    await page.waitForURL(new RegExp(`/${orgSlug}/dashboard`));

    const firstTeamLink = page.locator('[href*="/teams/"]').first();
    await expect(firstTeamLink).toBeVisible();
    const teamName = (await firstTeamLink.textContent())?.trim() ?? "";
    await firstTeamLink.click();

    await expect(page).toHaveURL(new RegExp(`/${orgSlug}/teams/`));
    await expect(
      page.getByRole("heading", { name: new RegExp(teamName, "i"), level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Eco score")).toBeVisible();
    await expect(page.getByText("Registraties per activiteit")).toBeVisible();
  });

  test("unauthenticated users are redirected to login", async ({ page }) => {
    await page.goto(`/${orgSlug ?? "lev-groep"}/teams/00000000-0000-0000-0000-000000000000`);
    await expect(page).toHaveURL(/\/login/);
  });
});
