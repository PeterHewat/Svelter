import { expect, test } from "@playwright/test";
import { PRODUCT_NAME } from "@repo/config/product";
import { mt } from "../src/lib/i18n";
import { productAppHref } from "../src/lib/product-links";

const enTitle = `${PRODUCT_NAME} - ${mt("home.titleSuffix", "en")}`;
const signupHref = productAppHref({ kind: "signup", utmCampaign: "hero" });

test.describe("Marketing Home Page", () => {
  test("redirects / to browser or default locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(en|es|fr|de|pt|it|nl|pl|ru)\/?$/);
  });

  test("redirects / to stored locale after visiting another language", async ({
    page,
  }) => {
    await page.goto("/fr");
    await expect(page).toHaveURL(/\/fr\/?$/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/fr\/?$/);
  });

  test("redirects legacy blog post URL to localized path", async ({ page }) => {
    await page.goto("/fr");
    await page.goto("/blog/hello-world");
    await expect(page).toHaveURL(/\/fr\/blog\/hello-world\/?$/);
  });

  test("shows language hub at / when JavaScript is disabled", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: /choose your language/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Français" })).toHaveAttribute(
      "href",
      "/fr",
    );
    await context.close();
  });

  test("navigates via locale links when JavaScript is disabled", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/");
    await page.getByRole("link", { name: "Français" }).click();
    await expect(page).toHaveURL(/\/fr\/?$/);
    await context.close();
  });

  test("should load the home page with correct title", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveTitle(enTitle);
  });

  test("should display the hero section", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", {
        name: new RegExp(`build faster with ${PRODUCT_NAME}`, "i"),
      }),
    ).toBeVisible();
    await expect(page.getByText(/production-ready monorepo/i)).toBeVisible();
    await expect(page.getByText(/no credit card required/i)).toBeVisible();
  });

  test("hero Start free links to product signup URL", async ({ page }) => {
    await page.goto("/en");
    const heroCta = page
      .locator("section")
      .filter({ hasText: /build faster with/i })
      .getByRole("link", { name: /start free/i });
    await expect(heroCta).toHaveAttribute("href", signupHref);
  });

  test("nav Start free links to product signup URL", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/en");
    const navCta = page
      .getByRole("navigation", { name: /main navigation/i })
      .getByRole("link", { name: /start free/i });
    await expect(navCta).toHaveAttribute(
      "href",
      productAppHref({ kind: "signup", utmCampaign: "nav" }),
    );
  });

  test("shows mobile nav links without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/en");
    await expect(
      page.getByRole("link", { name: /start free/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /start free/i }).first(),
    ).toHaveAttribute(
      "href",
      productAppHref({ kind: "signup", utmCampaign: "nav" }),
    );
    await page.locator("[data-nav-menu] summary").click();
    await expect(
      page.locator("[data-nav-menu]").getByRole("link", { name: /features/i }),
    ).toBeVisible();
    await context.close();
  });

  test("should have correct meta description", async ({ page }) => {
    await page.goto("/en");
    const description = page.locator('head > meta[name="description"]').first();
    await expect(description).toHaveAttribute("content", /monorepo template/i);
  });

  test("should set html lang from locale", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("should navigate to the blog page", async ({ page }) => {
    await page.goto("/en/blog");
    await expect(page.getByRole("heading", { name: /^blog$/i })).toBeVisible();
  });

  test("homepage pricing teaser renders 3 tiers", async ({ page }) => {
    await page.goto("/en");
    const pricingHeading = page.getByRole("heading", {
      name: /simple, transparent pricing/i,
    });
    await expect(pricingHeading).toBeVisible();
    const pricing = page.locator("section").filter({ has: pricingHeading });
    await expect(
      pricing.getByRole("heading", { name: "Free", exact: true }),
    ).toBeVisible();
    await expect(
      pricing.getByRole("heading", { name: "Pro", exact: true }),
    ).toBeVisible();
    await expect(
      pricing.getByRole("heading", { name: "Business", exact: true }),
    ).toBeVisible();
  });

  test("homepage FAQ includes JSON-LD", async ({ page }) => {
    await page.goto("/en");
    const schema = page.locator('script[type="application/ld+json"]');
    await expect(schema).toHaveCount(1);
    const content = await schema.textContent();
    expect(content).toContain("FAQPage");
    expect(content).toContain("Is the free plan really free?");
  });
});
