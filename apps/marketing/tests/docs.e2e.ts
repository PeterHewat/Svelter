import { expect, test } from "@playwright/test";

test.describe("Marketing Docs", () => {
  test("docs index lists guide pages", async ({ page }) => {
    await page.goto("/en/docs");
    await expect(
      page.getByRole("heading", { name: /^documentation$/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: /^getting started$/i }),
    ).toBeVisible();
  });

  test("nav docs link routes to docs index", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/en");
    await page
      .getByRole("navigation", { name: /main navigation/i })
      .getByRole("link", { name: /^docs$/i })
      .click();
    await expect(page).toHaveURL(/\/en\/docs\/?$/);
  });

  test("opens a documentation page", async ({ page }) => {
    await page.goto("/en/docs/getting-started");
    await expect(
      page.getByRole("heading", { name: /getting started/i }),
    ).toBeVisible();
    await expect(page.getByText(/welcome to the template/i)).toBeVisible();
  });

  test("docs sidebar works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/docs/configuration");
    await expect(
      page.getByRole("navigation", { name: /documentation navigation/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /getting started/i }),
    ).toHaveAttribute("href", /\/en\/docs\/getting-started/);
    await context.close();
  });
});
