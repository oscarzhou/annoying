import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("navigates all screens without overflow or covered content", async ({ page }) => {
  for (const destination of ["Home", "Activity", "Insights", "Settings"]) {
    await page.getByRole("link", { name: destination, exact: true }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const layout = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(layout.width, `${destination} page width`).toBeLessThanOrEqual(layout.viewport);
  }
});

test("group switching and notifications are reachable", async ({ page }) => {
  await page.getByRole("combobox", { name: "Current household" }).click();
  await expect(page.getByRole("option", { name: "Holiday Fund" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /Notifications/ })).toBeVisible();
});

test("separate-field quick add reconciles across dashboard and activity", async ({ page }) => {
  await page.getByRole("button", { name: "Capture expense" }).first().click();
  await page.getByLabel("Amount", { exact: true }).fill("24.50");
  await page.locator("#quick-description").fill("Lunch at the wharf");
  await page.getByRole("button", { name: /Save expense/ }).click();
  const row = page.getByRole("button", { name: /Lunch at the wharf/ });
  await expect(row).toContainText("$24.50");
  await page.getByRole("link", { name: "Activity", exact: true }).first().click();
  await expect(page.getByText("16 transactions · $2,577.36")).toBeVisible();
  await expect(page.getByRole("button", { name: /Lunch at the wharf/ })).toBeVisible();
});

test("natural-language amount works while explicit amount takes priority", async ({ page }) => {
  await page.getByRole("button", { name: "Capture expense" }).first().click();
  await page.locator("#quick-description").fill("groceries 85");
  await expect(page.getByText(/detected · explicit fields always win/)).toBeVisible();
  await page.getByLabel("Amount", { exact: true }).fill("90");
  await expect(page.getByRole("button", { name: /Save expense · \$90\.00/ })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Frequency" })).toHaveText(/Pending review/);
  await page.getByRole("button", { name: /Save expense/ }).click();
  await expect(page.getByRole("button", { name: /^groceries Alex recorded/i })).toContainText("$90.00");
});

test("smart parsing exposes currency and historical date without inventing time", async ({ page }) => {
  await page.getByRole("button", { name: "Capture expense" }).first().click();
  await page.locator("#quick-description").fill("taxi 35 USD yesterday");
  await expect(page.getByRole("combobox", { name: "Currency" })).toHaveText(/USD/);
  await expect(page.getByLabel("Expense date")).toHaveValue("2026-11-23");
  await expect(page.getByRole("combobox", { name: "Time of day" })).toHaveText(/Unspecified/);
  await expect(page.getByRole("combobox", { name: "Category" })).toHaveText(/Transport/);
});

test("history autocomplete preserves explicit amount and shared draft across modes", async ({ page }) => {
  await page.getByRole("button", { name: "Capture expense" }).first().click();
  await page.getByLabel("Amount", { exact: true }).fill("10.00");
  await page.locator("#quick-description").fill("Weekly gro");
  const suggestion = page.getByRole("option", { name: /Weekly groceries/ }).first();
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(page.getByLabel("Amount", { exact: true })).toHaveValue("10.00");
  await page.getByRole("tab", { name: "Manual" }).click();
  await expect(page.locator("#quick-description")).toHaveValue("Weekly groceries");
  await expect(page.getByRole("combobox", { name: "Category" })).toHaveText(/Groceries/);
});

test("validation and reachable drawer footer work", async ({ page }) => {
  await page.getByRole("button", { name: "Capture expense" }).first().click();
  await expect(page.getByLabel("Amount", { exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Save expense", exact: true }).click();
  await expect(page.getByText("Add a description and an amount with no more than 2 decimal places.")).toBeVisible();
  const save = page.getByRole("button", { name: "Save expense", exact: true });
  await expect(save).toBeVisible();
  const box = await save.boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport && box.y + box.height <= viewport.height).toBe(true);
});

test("activity search and progressive filters update totals", async ({ page }) => {
  await page.getByRole("link", { name: "Activity", exact: true }).first().click();
  await page.getByLabel("Search expenses").fill("rent");
  await expect(page.getByText("2 transactions · $1,380.00")).toBeVisible();
  await page.getByRole("button", { name: "More filters" }).click();
  await page.getByRole("combobox", { name: "Member" }).click();
  await page.getByRole("option", { name: "Jordan" }).click();
  await expect(page.getByText("No matching transactions")).toBeVisible();
});

test("expense editing updates shared totals", async ({ page }) => {
  await page.getByRole("link", { name: "Activity", exact: true }).first().click();
  await expect(page).toHaveURL(/\/activity/);
  await page.getByRole("button", { name: /Weekly groceries/ }).first().click();
  await expect(page.getByRole("heading", { name: "Expense details" })).toBeVisible();
  await page.getByLabel("Amount", { exact: true }).fill("100.00");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("15 transactions · $2,567.46")).toBeVisible();
});

test("insights supports period navigation and simulated analysis states", async ({ page }) => {
  await page.getByRole("link", { name: "Insights", exact: true }).first().click();
  await expect(page.locator("#main-content").getByText("November 2026")).toBeVisible();
  await page.getByRole("button", { name: "Previous period" }).click();
  await expect(page.getByText("October 2026")).toBeVisible();
  await expect(page.getByLabel("Spending by day")).toBeVisible();
  await page.getByRole("button", { name: /Analyse this month/ }).click();
  await expect(page.getByText("Simulated analysis")).toBeVisible();
});

test("recurring confirmation is single-use", async ({ page }) => {
  const confirm = page.getByRole("button", { name: "Confirm", exact: true }).first();
  await confirm.click();
  const confirmed = page.getByRole("button", { name: "Confirmed", exact: true });
  await expect(confirmed).toBeDisabled();
});

test("settings rows open focused drawers", async ({ page }) => {
  await page.getByRole("link", { name: "Settings", exact: true }).first().click();
  await page.getByRole("button", { name: "Group preferences" }).click();
  await expect(page.getByRole("heading", { name: "Group preferences" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "AI provider & model" }).click();
  await expect(page.getByText("Real credentials are not accepted in this milestone.")).toBeVisible();
});

test("captures primary viewport screens", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390", "Primary screenshots use 390px.");
  await mkdir("artifacts/screenshots", { recursive: true });
  for (const destination of ["Home", "Activity", "Insights", "Settings"]) {
    await page.getByRole("link", { name: destination, exact: true }).first().click();
    await page.screenshot({ path: `artifacts/screenshots/${destination.toLowerCase()}-390-viewport.png` });
  }
  await page.getByRole("button", { name: "Capture expense" }).first().click();
  await expect(page.getByRole("heading", { name: "Capture expense" })).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "artifacts/screenshots/quick-add-collapsed-390-viewport.png" });
  await expect(page.getByRole("combobox", { name: "Frequency" })).toBeVisible();
  await page.getByRole("combobox", { name: "Frequency" }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "artifacts/screenshots/quick-add-expanded-390-viewport.png" });
});
