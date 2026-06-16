import type { Locator, Page } from "@playwright/test";

/**
 * Page Object Model for the authenticated `/tasks` feature.
 */
export class TasksPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly titleInput: Locator;
  readonly addButton: Locator;
  readonly taskList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Tasks", level: 1 });
    this.titleInput = page.getByLabel(/what needs to be done/i);
    this.addButton = page.getByRole("button", { name: /add task/i });
    this.taskList = page.getByRole("list", { name: /your tasks/i });
  }

  async goto(): Promise<void> {
    await this.page.goto("/tasks");
  }

  async waitForReady(): Promise<void> {
    await this.heading.waitFor({ state: "visible" });
    await this.titleInput.waitFor({ state: "visible" });
  }

  async createTask(title: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.addButton.click();
  }

  taskRow(title: string): Locator {
    return this.taskList.locator("li").filter({ hasText: title });
  }

  async toggleTask(title: string): Promise<void> {
    await this.taskRow(title).getByRole("checkbox").click();
  }

  async deleteTask(title: string): Promise<void> {
    await this.taskRow(title)
      .getByRole("button", { name: /delete/i })
      .click();
  }
}
