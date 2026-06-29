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
    test("has an accessible page title", async () => {
      await expect(homePage.title).toHaveText(PRODUCT_NAME);
    });

    test("displays the intro", async () => {
      await expect(homePage.intro).toBeVisible();
      expect(await homePage.getIntroText()).toMatch(/product web app/i);
    });

    test("links to the marketing site", async () => {
      await expect(homePage.marketingLink).toBeVisible();
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

  test.describe("Navigation", () => {
    test("footer copyright links to the marketing site", async ({ page }) => {
      await page.goto("/en");
      const link = page.getByRole("contentinfo").getByRole("link", {
        name: /© \d{4}/,
      });
      await expect(link).toHaveAttribute(
        "href",
        "http://localhost:3001/en?theme=light",
      );
    });

    test("strips cross-app pref params from the address bar after load", async ({
      page,
    }) => {
      await page.goto("/?lang=fr&theme=dark");
      await expect(page).toHaveURL("/");
      await expect(page.locator("html")).toHaveClass(/dark/);
    });
  });

  test.describe("Accessibility", () => {
    test("has proper heading hierarchy", async ({ page }) => {
      expect(await page.locator("h1").count()).toBe(1);
    });

    test("interactive elements are keyboard accessible", async ({ page }) => {
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toBeVisible();
    });
  });
});
