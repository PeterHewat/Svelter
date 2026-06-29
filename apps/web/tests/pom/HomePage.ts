import type { Locator, Page } from "@playwright/test";

/**
 * Page Object Model for the home page.
 */
export class HomePage {
  readonly page: Page;
  readonly themeToggle: Locator;
  readonly title: Locator;
  readonly intro: Locator;
  readonly marketingLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.themeToggle = page.getByRole("button", {
      name: /switch to .* theme/i,
    });
    this.title = page.getByRole("heading", { level: 1, hidden: true });
    this.intro = page.locator("main p").first();
    this.marketingLink = page.getByRole("link", {
      name: /go back to the marketing website/i,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? "";
  }

  async getIntroText(): Promise<string> {
    return (await this.intro.textContent()) ?? "";
  }

  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  async isDarkMode(): Promise<boolean> {
    const classList = await this.page.locator("html").getAttribute("class");
    return classList?.includes("dark") ?? false;
  }

  async waitForLoad(): Promise<void> {
    await this.intro.waitFor({ state: "visible" });
  }
}
