import { expect, test } from "@playwright/test";
import { PRODUCT_NAME } from "@repo/config/product";
import { HomePage } from "./pom/HomePage";

test.describe("Routing", () => {
  test("home page loads at /", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.waitForLoad();
    await expect(home.title).toHaveText(PRODUCT_NAME);
  });

  test("unknown path shows 404 copy", async ({ page }) => {
    await page.goto("/not-a-real-route");
    await expect(
      page.getByRole("heading", { name: /not found/i }),
    ).toBeVisible();
  });

  test("login opens auth modal", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: /sign in/i }),
    ).toBeVisible();
  });

  test("tasks link opens auth modal without navigating", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^tasks$/i }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
