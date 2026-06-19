import { expect, test } from "@playwright/test";

test.describe("Marketing Pricing Section", () => {
  test("renders 3 pricing tiers on homepage", async ({ page }) => {
    await page.goto("/en#pricing");
    await expect(
      page.getByRole("heading", { name: "Pricing", exact: true }),
    ).toBeVisible();
    const cards = page.locator("section#pricing .monthly-cards");
    await expect(
      cards.getByRole("heading", { name: "Free", exact: true }),
    ).toBeVisible();
    await expect(
      cards.getByRole("heading", { name: "Pro", exact: true }),
    ).toBeVisible();
    await expect(
      cards.getByRole("heading", { name: "Business", exact: true }),
    ).toBeVisible();
  });

  test("shows comparison table and enterprise row", async ({ page }) => {
    await page.goto("/en#pricing");
    await expect(
      page.getByRole("heading", { name: /compare plans/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Team members" }),
    ).toBeVisible();
    await expect(
      page.getByRole("rowheader", { name: "Enterprise" }),
    ).toBeVisible();
  });

  test("annual billing toggle switches displayed prices without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en#pricing");
    await expect(page.getByText("$29")).toBeVisible();
    await page.locator(".billing-label-annual").click();
    await expect(page.getByText("$24")).toBeVisible();
    await context.close();
  });

  test("annual billing toggle highlights active option", async ({ page }) => {
    await page.goto("/en#pricing");
    const monthlyInput = page.locator(".billing-monthly");
    const annualInput = page.locator(".billing-annual");

    await expect(monthlyInput).toBeChecked();
    await expect(annualInput).not.toBeChecked();

    await page.locator(".billing-label-annual").click();
    await expect(annualInput).toBeChecked();
    await expect(monthlyInput).not.toBeChecked();
  });

  test("free tier is not visually highlighted", async ({ page }) => {
    await page.goto("/en#pricing");
    const freeCard = page
      .locator("section#pricing .monthly-cards article")
      .filter({
        has: page.getByRole("heading", { name: "Free", exact: true }),
      });
    await expect(freeCard).not.toHaveClass(/ring-2/);
    await expect(freeCard.getByText(/free forever/i)).toHaveCount(0);
  });

  test("only one pricing card row is visible at a time", async ({ page }) => {
    await page.goto("/en#pricing");
    await expect(page.locator("section#pricing .monthly-cards")).toBeVisible();
    await expect(page.locator("section#pricing .annual-cards")).toBeHidden();

    await page.locator(".billing-label-annual").click();
    await expect(page.locator("section#pricing .annual-cards")).toBeVisible();
    await expect(page.locator("section#pricing .monthly-cards")).toBeHidden();
  });

  test("/en/pricing redirects to homepage pricing anchor", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(page).toHaveURL(/\/en#pricing$/);
  });

  test("nav pricing link targets homepage anchor from docs", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/en/docs");
    await page
      .getByRole("navigation", { name: /main navigation/i })
      .getByRole("link", { name: /^pricing$/i })
      .click();
    await expect(page).toHaveURL(/\/en#pricing$/);
    await expect(
      page.getByRole("heading", { name: "Pricing", exact: true }),
    ).toBeVisible();
  });
});
