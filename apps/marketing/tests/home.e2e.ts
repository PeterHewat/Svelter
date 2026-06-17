import { expect, test } from "@playwright/test";
import { mt } from "../src/lib/i18n";
import { SITE_NAME } from "../src/lib/site";

const enTitle = `${SITE_NAME} - ${mt("home.titleSuffix", "en")}`;

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
        name: new RegExp(`build faster with ${SITE_NAME}`, "i"),
      }),
    ).toBeVisible();
    await expect(page.getByText(/production-ready monorepo/i)).toBeVisible();
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
});
