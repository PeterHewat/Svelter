import { expect, test } from "@playwright/test";

test.describe("Marketing Pricing Section", () => {
  test("renders 3 pricing tiers on homepage", async ({ page }) => {
    await page.goto("/en#pricing");
    await expect(
      page.getByRole("heading", { name: "Pricing", exact: true }),
    ).toBeVisible();
    const cards = page.locator("section#pricing .pricing-cards");
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
      .locator("section#pricing .pricing-cards article")
      .filter({
        has: page.getByRole("heading", { name: "Free", exact: true }),
      });
    await expect(freeCard).not.toHaveClass(/ring-2/);
    await expect(freeCard.getByText(/free forever/i)).toHaveCount(0);
  });

  test("billing toggle animates paid tier prices in place", async ({
    page,
  }) => {
    await page.goto("/en#pricing");
    const cards = page.locator("section#pricing .pricing-cards");
    const proPrice = cards
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Pro", exact: true }),
      })
      .locator("[data-pricing-amount]");
    const businessPrice = cards
      .locator("article")
      .filter({
        has: page.getByRole("heading", { name: "Business", exact: true }),
      })
      .locator("[data-pricing-amount]");
    await expect(cards).toBeVisible();
    await expect(cards.locator("article")).toHaveCount(3);
    await expect(proPrice).toHaveText("$29");
    await expect(businessPrice).toHaveText("$79");

    await page.locator(".billing-label-annual").click();
    await expect(page.locator(".billing-annual")).toBeChecked();
    await expect(proPrice).toHaveText("$24", { timeout: 3000 });
    await expect(businessPrice).toHaveText("$66", { timeout: 3000 });
    await expect(cards.locator("article")).toHaveCount(3);
  });

  test("persists billing toggle for the session across refresh", async ({
    page,
  }) => {
    await page.goto("/en#pricing");
    const proPrice = page
      .locator("section#pricing .pricing-cards article")
      .filter({
        has: page.getByRole("heading", { name: "Pro", exact: true }),
      })
      .locator("[data-pricing-amount]");
    const businessPrice = page
      .locator("section#pricing .pricing-cards article")
      .filter({
        has: page.getByRole("heading", { name: "Business", exact: true }),
      })
      .locator("[data-pricing-amount]");
    await page.locator(".billing-label-annual").click();
    await expect(page.locator(".billing-annual")).toBeChecked();

    await page.reload();
    await expect(page.locator(".billing-annual")).toBeChecked();
    await expect(proPrice).toHaveText("$24");
    await expect(businessPrice).toHaveText("$66");
  });

  test("preserves scroll position on refresh", async ({ page }) => {
    await page.goto("/en");
    await page.evaluate(() => window.scrollTo(0, 1200));
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(500);

    await page.reload();
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeGreaterThan(500);
    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(80);
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
