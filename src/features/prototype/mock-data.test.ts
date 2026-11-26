import { describe, expect, it } from "vitest";
import { initialExpenses } from "./mock-data";
import { categoryTotals, convertToGroupMinor, inRange, parseMoneyToMinor, sumExpenses } from "./finance";

describe("prototype mock data", () => {
  it("keeps all three classification dimensions explicit", () => {
    expect(initialExpenses.length).toBeGreaterThan(0);
    for (const expense of initialExpenses) {
      expect(expense.category).toBeTruthy();
      expect(expense.frequency).toBeTruthy();
      expect(expense.expectation).toBeTruthy();
    }
  });

  it("uses finite positive mock amounts", () => {
    expect(initialExpenses.every((expense) => Number.isSafeInteger(expense.amountMinor) && expense.amountMinor > 0)).toBe(true);
  });

  it("reconciles category totals to the November ledger total", () => {
    const november = initialExpenses.filter((expense) => inRange(expense, "2026-11-01", "2026-11-24"));
    expect(categoryTotals(november).reduce((sum, category) => sum + category.amountMinor, 0)).toBe(sumExpenses(november));
  });

  it("preserves original and converted values for foreign currency", () => {
    const foreign = initialExpenses.find((expense) => expense.currency !== "NZD");
    expect(foreign).toMatchObject({ currency: "AUD", amountMinor: 3100, groupAmountMinor: 3438 });
  });

  it("parses minor units exactly and rejects excess precision", () => {
    expect(parseMoneyToMinor("85.40")).toBe(8540);
    expect(parseMoneyToMinor("0.01")).toBe(1);
    expect(parseMoneyToMinor("12.345")).toBeNaN();
    expect(parseMoneyToMinor("not money")).toBeNaN();
  });

  it("uses explicit integer ratios for mock group conversion", () => {
    expect(convertToGroupMinor(3500, "USD")).toBe(5670);
    expect(convertToGroupMinor(3100, "AUD")).toBe(3438);
  });
});
