import { expect, test } from "@playwright/test";
import { PRODUCT_NAME } from "@repo/config/product";
import { HomePage } from "./pom/HomePage";

test.describe("Home Page", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await homePage.waitForLoad();
  });

  test.describe("Content Rendering", () => {
    test("displays the main title", async () => {
      await expect(homePage.title).toBeVisible();
      expect(await homePage.getTitleText()).toBe(PRODUCT_NAME);
    });

    test("displays the subtitle", async () => {
      await expect(homePage.subtitle).toBeVisible();
      expect(await homePage.getSubtitleText()).toContain("SvelteKit");
    });

    test("displays the features section", async () => {
      await expect(homePage.featuresTitle).toBeVisible();
      expect(await homePage.getFeaturesTitleText()).toBe("Features");

      const features = await homePage.getFeatureItems();
      expect(features.length).toBeGreaterThanOrEqual(6);
      expect(features.some((f) => f.includes("SvelteKit"))).toBe(true);
      expect(features.some((f) => f.includes("Convex"))).toBe(true);
    });
  });

  test.describe("Theme Toggle", () => {
    test("displays the theme toggle button", async () => {
      await expect(homePage.themeToggle).toBeVisible();
    });

    test("changes theme when toggled", async () => {
      const before = await homePage.isDarkMode();
      await homePage.toggleTheme();
      const after = await homePage.isDarkMode();
      expect(after).not.toBe(before);
    });

    test("persists theme preference across page reload", async ({ page }) => {
      await homePage.toggleTheme();
      const themeAfterToggle = await homePage.isDarkMode();

      await page.reload();
      await homePage.waitForLoad();

      expect(await homePage.isDarkMode()).toBe(themeAfterToggle);
    });
  });

  test.describe("Accessibility", () => {
    test("has proper heading hierarchy", async ({ page }) => {
      expect(await page.locator("h1").count()).toBe(1);
      expect(await page.locator("h2").count()).toBeGreaterThanOrEqual(1);
    });

    test("interactive elements are keyboard accessible", async ({ page }) => {
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toBeVisible();
    });
  });
});
