import { expect, test } from "@playwright/test";

test.describe("Marketing Blog", () => {
  test("lists all posts in chronological order", async ({ page }) => {
    await page.goto("/en/blog");
    await expect(
      page.getByRole("heading", { name: /hello world/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /v0\.1\.0 — Marketing shell/i }),
    ).toBeVisible();
  });

  test("opens a blog post", async ({ page }) => {
    await page.goto("/en/blog");
    await page.getByRole("link", { name: /hello world/i }).click();
    await expect(page).toHaveURL(/\/en\/blog\/hello-world\/?$/);
    await expect(
      page.getByRole("heading", { name: /hello world/i }),
    ).toBeVisible();
  });

  test("blog list works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/blog");
    await expect(
      page.getByRole("heading", { name: /hello world/i }),
    ).toBeVisible();
    await context.close();
  });
});
