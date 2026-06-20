import { expect, test } from "@playwright/test";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@repo/config/product";
import { productAppHref } from "../src/lib/product-links";

const enTitle = `${PRODUCT_NAME} - ${PRODUCT_TAGLINE}`;

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
    await expect(
      page.getByText(/production-ready monorepo template/i),
    ).toBeVisible();
    await expect(page.getByText(/try it for free/i)).toBeVisible();
  });

  test("nav Dashboard links to product app with locale", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/fr");
    const navCta = page
      .getByRole("link", { name: /^tableau de bord$/i })
      .last();
    const href = await navCta.getAttribute("href");
    expect(href).toBeTruthy();
    const url = new URL(href!);
    expect(url.searchParams.get("lang")).toBe("fr");
    expect(url.searchParams.get("theme")).toMatch(/^(light|dark)$/);
  });

  test("strips cross-app pref params from the address bar after load", async ({
    page,
  }) => {
    await page.goto("/en?theme=dark&lang=en");
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("shows mobile nav links without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/en");
    await expect(
      page.getByRole("link", { name: /^dashboard$/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /^dashboard$/i }).first(),
    ).toHaveAttribute("href", productAppHref({ lang: "en" }));
    await page.locator("[data-nav-menu] summary").click();
    await expect(
      page.locator("[data-nav-menu]").getByRole("link", { name: /^docs$/i }),
    ).toBeVisible();
    await context.close();
  });

  test("should have correct meta description", async ({ page }) => {
    await page.goto("/en");
    const description = page.locator('head > meta[name="description"]').first();
    await expect(description).toHaveAttribute("content", /monorepo template/i);
  });

  test("preserves scroll position when switching locale with JavaScript", async ({
    page,
  }) => {
    await page.goto("/en");
    await page.evaluate(() => window.scrollTo(0, 1200));
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(500);

    await page.locator("[data-locale-menu] summary").click();
    await page.getByRole("link", { name: "Français" }).click();
    await expect(page).toHaveURL(/\/fr\/?$/);

    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeGreaterThan(500);
    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(80);
  });

  test("preserves hash when switching locale with JavaScript", async ({
    page,
  }) => {
    await page.goto("/en#pricing");
    await expect(
      page.getByRole("heading", { name: "Pricing", exact: true }),
    ).toBeInViewport();

    await page.locator("[data-locale-menu] summary").click();
    await page.getByRole("link", { name: "Français" }).click();
    await expect(page).toHaveURL(/\/fr#pricing$/);
    await expect(
      page.getByRole("heading", { name: /tarifs/i }),
    ).toBeInViewport();
  });

  test("should set html lang from locale", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("should navigate to the blog page", async ({ page }) => {
    await page.goto("/en/blog");
    await expect(page.getByRole("heading", { name: /^blog$/i })).toBeVisible();
  });

  test("homepage pricing section renders 3 tiers", async ({ page }) => {
    await page.goto("/en");
    const pricingHeading = page.getByRole("heading", {
      name: "Pricing",
      exact: true,
    });
    await expect(pricingHeading).toBeVisible();
    const pricing = page.locator("section#pricing .monthly-cards");
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

  test("nav links features, pricing, and FAQ to homepage anchors", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/en");
    const nav = page.getByRole("navigation", { name: /main navigation/i });
    await expect(
      nav.getByRole("link", { name: /^features$/i }),
    ).toHaveAttribute("href", "/en#features");
    await expect(nav.getByRole("link", { name: /^pricing$/i })).toHaveAttribute(
      "href",
      "/en#pricing",
    );
    await expect(nav.getByRole("link", { name: /^faq$/i })).toHaveAttribute(
      "href",
      "/en#faq",
    );
  });

  test("homepage FAQ includes JSON-LD", async ({ page }) => {
    await page.goto("/en");
    const schema = page.locator('script[type="application/ld+json"]');
    await expect(schema).toHaveCount(1);
    const content = await schema.textContent();
    expect(content).toContain("FAQPage");
    expect(content).toContain("Is the free plan really free?");
    expect(content).toContain("Can I stay on the free plan?");
  });
});
