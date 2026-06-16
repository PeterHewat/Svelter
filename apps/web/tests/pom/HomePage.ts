import type { Locator, Page } from "@playwright/test";

/**
 * Page Object Model for the home page.
 */
export class HomePage {
  readonly page: Page;
  readonly themeToggle: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly featuresTitle: Locator;
  readonly featuresList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.themeToggle = page.getByRole("button", {
      name: /switch to .* theme/i,
    });
    this.title = page.getByRole("heading", { level: 1 });
    this.subtitle = page.locator("main p").first();
    this.featuresTitle = page.locator("main h2").first();
    this.featuresList = page.locator("main ul");
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async getTitleText(): Promise<string> {
    return (await this.title.textContent()) ?? "";
  }

  async getSubtitleText(): Promise<string> {
    return (await this.subtitle.textContent()) ?? "";
  }

  async getFeaturesTitleText(): Promise<string> {
    return (await this.featuresTitle.textContent()) ?? "";
  }

  async getFeatureItems(): Promise<string[]> {
    const items = await this.featuresList.locator("li").all();
    return Promise.all(
      items.map((item) => item.textContent().then((t) => t ?? "")),
    );
  }

  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  async isDarkMode(): Promise<boolean> {
    const classList = await this.page.locator("html").getAttribute("class");
    return classList?.includes("dark") ?? false;
  }

  async waitForLoad(): Promise<void> {
    await this.title.waitFor({ state: "visible" });
  }
}
