import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Accessible building blocks for small apps." }),
  ).toBeVisible();
});

test("dialog traps focus, starts on the safe choice, and returns focus on Escape", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Retire laser cutter" });
  await trigger.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "Retire this equipment?" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Keep it" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Retire", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close dialog" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Keep it" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("the page behind an open dialog is inert, and only while it is open", async ({ page }) => {
  const app = page.locator("body > #root");
  await page.getByRole("button", { name: "Retire laser cutter" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(app).toHaveAttribute("inert", "");

  // Inert content cannot take focus, even when a script asks for it.
  await page.getByRole("button", { name: "Retire laser cutter" }).evaluate((button) => button.focus());
  await expect(page.getByRole("button", { name: "Keep it" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(app).not.toHaveAttribute("inert");
});

test("confirming the dialog raises a toast that can be dismissed", async ({ page }) => {
  await page.getByRole("button", { name: "Retire laser cutter" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Retire", exact: true }).click();

  const notifications = page.getByRole("region", { name: "Notifications" });
  await expect(notifications).toContainText("Laser cutter retired");
  await notifications.getByRole("button", { name: "Dismiss notification: Laser cutter retired" }).click();
  await expect(notifications).not.toContainText("Laser cutter retired");
});

test("tabs follow the arrow keys and skip the disabled tab", async ({ page }) => {
  await page.getByRole("tab", { name: "Overview" }).click();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");

  await expect(page.getByRole("tab", { name: "History" })).toBeFocused();
  await expect(page.getByRole("tabpanel", { name: "History" })).toContainText("Tube replaced");
});

test("sorting the table updates aria-sort and keeps empty values last", async ({ page }) => {
  const table = page.getByRole("table", { name: "This week's bookings" });
  await table.getByRole("button", { name: "Hours" }).click();
  await table.getByRole("button", { name: "Hours" }).click();

  await expect(table.getByRole("columnheader", { name: "Hours" })).toHaveAttribute("aria-sort", "descending");
  const firstCells = table.locator("tbody tr td:first-child");
  await expect(firstCells).toHaveText(["FDM printer A", "Laser cutter", "Wood lathe", "Pottery kiln"]);
});

test("form errors are announced as the field's description", async ({ page }) => {
  await page.getByRole("button", { name: "Validate" }).click();
  const email = page.getByRole("textbox", { name: "Email" });

  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription("Enter an email like name@example.com Used for booking reminders.");
});

test("the theme choice applies immediately and survives a reload", async ({ page }) => {
  await page.getByLabel("Theme", { exact: true }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByLabel("Theme", { exact: true })).toHaveValue("dark");
});

test("the layout has no horizontal scroll on a phone-sized screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
