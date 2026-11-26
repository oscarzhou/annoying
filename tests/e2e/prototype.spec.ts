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

test("capture route saves once and reconciles across Home and Activity", async ({ page }) => {
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await expect(page).toHaveURL(/\/capture\?from=%2F/);
  await page.getByLabel("Amount", { exact: true }).fill("24.50");
  await page.locator("#capture-description").fill("Lunch at the wharf");
  await page.getByRole("button", { name: /Save expense/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("button", { name: /Lunch at the wharf/ })).toContainText("$24.50");
  await page.getByRole("link", { name: "Activity", exact: true }).first().click();
  await expect(page.getByText("16 transactions · $2,577.36")).toBeVisible();
  await expect(page.getByRole("button", { name: /Lunch at the wharf/ })).toHaveCount(1);
});

test("natural input keeps explicit amount and classifications", async ({ page }) => {
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.locator("#capture-description").fill("groceries 85");
  await expect(page.getByRole("button", { name: "Category: Groceries" })).toBeVisible();
  await page.getByLabel("Amount", { exact: true }).fill("90");
  await expect(page.getByRole("button", { name: /Save expense · \$90\.00/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Unconfirmed" }).first()).toHaveAttribute("data-state", "on");
});

test("date reset uses current group-local date and historical time is unspecified", async ({ page }) => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Auckland", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.getByLabel("Expense date").fill("2020-01-02");
  await expect(page.getByRole("button", { name: "Time of day: Unspecified" })).toBeVisible();
  await page.getByRole("button", { name: "Reset date" }).click();
  await expect(page.getByLabel("Expense date")).toHaveValue(today);
  await page.getByRole("button", { name: "Reset to now" }).click();
  await expect(page.getByRole("button", { name: "Time of day: Now" })).toBeVisible();
});

test("history autocomplete ranks matches and preserves explicit fields across modes", async ({ page }) => {
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.getByLabel("Amount", { exact: true }).fill("10.00");
  await page.getByRole("button", { name: /Category:/ }).click();
  await page.getByRole("button", { name: /Travel/ }).click();
  await page.locator("#capture-description").fill("wekly grocries");
  const suggestion = page.getByRole("option", { name: /Weekly groceries/ }).first();
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(page.getByLabel("Amount", { exact: true })).toHaveValue("10.00");
  await expect(page.getByRole("button", { name: "Category: Travel" })).toBeVisible();
  await page.getByRole("tab", { name: "Manual" }).click();
  await expect(page.locator("#capture-description")).toHaveValue("Weekly groceries");
});

test("newly saved expenses are searchable by prefix, token, substring, and case within the session", async ({ page }) => {
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.getByLabel("Amount", { exact: true }).fill("12.40");
  await page.locator("#capture-description").fill("Harbour Shuttle Pass");
  await page.getByRole("button", { name: /Save expense/ }).click();

  for (const query of ["HARB", "shuttle", "ttle pa"]) {
    await page.getByRole("link", { name: "Capture expense" }).first().click();
    await page.locator("#capture-description").fill(query);
    await expect(page.getByRole("option", { name: /Harbour Shuttle Pass/ })).toBeVisible();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Cancel new expense" }).click();
  }

  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.locator("#capture-description").fill("unrelated phrase");
  await expect(page.getByRole("listbox", { name: "Matching expense history" })).toHaveCount(0);
});

test("currency picker supports search and blocks unresolved conversion", async ({ page }) => {
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.getByRole("button", { name: "Currency: NZD" }).click();
  await page.getByPlaceholder("Search currency…").fill("yuan");
  await page.getByRole("button", { name: /CNY Chinese yuan/ }).click();
  await expect(page.getByRole("button", { name: "Currency: CNY" })).toBeVisible();
  await page.getByLabel("Amount", { exact: true }).fill("25.00");
  await page.locator("#capture-description").fill("Dinner in Shanghai");
  await expect(page.getByText("Conversion unavailable", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save expense", exact: true }).click();
  await expect(page.getByText(/CNY has no prototype exchange rate/)).toBeVisible();
});

test("category picker scrolls and selects after touch-style movement", async ({ page }) => {
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.getByRole("button", { name: /Category:/ }).click();
  const list = page.getByRole("dialog").locator("div.overflow-y-auto");
  await list.evaluate((element) => element.scrollTo({ top: element.scrollHeight, behavior: "instant" }));
  await page.getByRole("button", { name: /Unclassified/ }).click();
  await expect(page.getByRole("button", { name: "Category: Unclassified" })).toBeVisible();
});

test("AT HOP input suggests Transport and relevant unconfirmed tags", async ({ page }) => {
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.locator("#capture-description").fill("at hop top up for ferry");
  await expect(page.getByRole("button", { name: "Category: Transport" })).toBeVisible();
  await expect(page.getByText("AT HOP card top-up for ferry travel")).toBeVisible();
  for (const tag of ["Transport", "Public transport", "Ferry", "AT HOP", "Top-up"]) await expect(page.getByRole("button", { name: tag, exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Unconfirmed" }).first()).toHaveAttribute("data-state", "on");
});

test("custom tags deduplicate case-insensitively", async ({ page }) => {
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.getByLabel("Custom tag").fill("Family trip");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByLabel("Custom tag").fill("family TRIP");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Family trip tag" })).toHaveCount(1);
});

test("capture cancellation returns to origin and draft survives route navigation", async ({ page }) => {
  await page.getByRole("link", { name: "Activity", exact: true }).first().click();
  await expect(page).toHaveURL(/\/activity/);
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.locator("#capture-description").fill("Draft ferry fare");
  await page.goBack();
  await expect(page).toHaveURL(/\/activity/);
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await expect(page.locator("#capture-description")).toHaveValue("Draft ferry fare");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Cancel new expense" }).click();
  await expect(page).toHaveURL(/\/activity/);
});

test("capture stays usable at a constrained visible height", async ({ page }) => {
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.setViewportSize({ width: 390, height: 480 });
  await page.getByLabel("Amount", { exact: true }).focus();
  await expect(page.getByLabel("Amount", { exact: true })).toBeInViewport();
  const save = page.getByRole("button", { name: "Save expense", exact: true });
  await save.scrollIntoViewIfNeeded();
  await expect(save).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
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
  await expect(page.getByRole("button", { name: /Weekly rent/ })).toContainText("$690.00");
});

test("settings rows open focused drawers", async ({ page }) => {
  await page.getByRole("link", { name: "Settings", exact: true }).first().click();
  await page.getByRole("button", { name: /Household preferences/ }).click();
  await expect(page.getByRole("heading", { name: "Household preferences" })).toBeVisible();
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
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await expect(page.getByRole("heading", { name: "New expense" })).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "artifacts/screenshots/capture-route-390-viewport.png" });
  await expect(page.locator('[aria-label="Frequency"]')).toBeVisible();
  await page.locator('[aria-label="Frequency"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "artifacts/screenshots/capture-classification-390-viewport.png" });
});

test("captures M2.5 final review deliverables", async ({ page }, testInfo) => {
  test.skip(!["mobile-390", "desktop"].includes(testInfo.project.name), "Final review uses primary mobile and desktop.");
  await mkdir("artifacts/m2.5-final-review", { recursive: true });
  if (testInfo.project.name === "desktop") {
    await page.getByRole("link", { name: "Insights", exact: true }).first().click();
    await page.screenshot({ path: "artifacts/m2.5-final-review/representative-desktop.png", fullPage: true });
    return;
  }
  for (const [destination, filename] of [["Home", "home-390.png"], ["Activity", "activity-390.png"], ["Insights", "insights-390.png"], ["Settings", "settings-390.png"]] as const) {
    await page.getByRole("link", { name: destination, exact: true }).first().click();
    await page.screenshot({ path: `artifacts/m2.5-final-review/${filename}`, fullPage: true });
  }
  await page.getByRole("link", { name: "Capture expense" }).first().click();
  await page.screenshot({ path: "artifacts/m2.5-final-review/capture-390.png", fullPage: true });
});
