import { expect, test } from "@playwright/test";
import { mt } from "../src/lib/i18n";
import { productAppHref } from "../src/lib/product-links";

test.describe("Marketing Pricing Page", () => {
  test("renders 3 pricing tiers", async ({ page }) => {
    await page.goto("/en/pricing");
    await expect(
      page.getByRole("heading", { name: "Pricing", exact: true }),
    ).toBeVisible();
    const cards = page.locator("section.pricing-cards-section");
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
    await page.goto("/en/pricing");
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

  test("tier Start free links to product signup URL", async ({ page }) => {
    await page.goto("/en/pricing");
    const freeCard = page.locator("article").filter({
      has: page.getByRole("heading", { name: "Free", exact: true }),
    });
    await expect(
      freeCard.getByRole("link", { name: /start free/i }),
    ).toHaveAttribute(
      "href",
      productAppHref({ kind: "signup", utmCampaign: "pricing-free" }),
    );
  });

  test("annual billing toggle switches displayed prices without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/pricing");
    await expect(page.getByText("$29")).toBeVisible();
    await page.locator('label[for="pricing-page-annual"]').click();
    await expect(page.getByText("$24")).toBeVisible();
    await context.close();
  });

  test("has pricing meta description", async ({ page }) => {
    await page.goto("/en/pricing");
    const description = page.locator('head > meta[name="description"]').first();
    await expect(description).toHaveAttribute(
      "content",
      mt("meta.pricingDescription", "en"),
    );
  });
});
