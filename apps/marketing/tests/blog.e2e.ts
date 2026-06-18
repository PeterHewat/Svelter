import { expect, test } from "@playwright/test";

test.describe("Marketing Blog", () => {
  test("changelog filter lists sample post without JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/blog");
    await page.locator('label[for="blog-filter-changelog"]').click();
    await expect(
      page.getByRole("heading", { name: /v0\.1\.0 — PLG marketing shell/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /hello world/i })).toHaveCount(
      0,
    );
    await context.close();
  });

  test("article filter lists hello world post", async ({ page }) => {
    await page.goto("/en/blog");
    await page.locator('label[for="blog-filter-article"]').click();
    await expect(
      page.getByRole("heading", { name: /hello world/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /v0\.1\.0 — PLG marketing shell/i }),
    ).toHaveCount(0);
  });

  test("filter tabs work without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/blog");
    await expect(
      page.getByRole("heading", { name: /hello world/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /v0\.1\.0 — PLG marketing shell/i }),
    ).toBeVisible();
    await page.locator('label[for="blog-filter-changelog"]').click();
    await expect(
      page.getByRole("heading", { name: /v0\.1\.0 — PLG marketing shell/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /hello world/i })).toHaveCount(
      0,
    );
    await context.close();
  });
});
