import { describe, expect, it } from "vitest";
import { initialExpenses } from "../prototype/mock-data";
import { inferCapture, rankHistory } from "./capture-rules";
import { convertPrototypeToGroupMinor, getCurrency, parseAmountToMinor } from "./currency-data";
import { groupLocalDate } from "./clock";
import { formatMoney } from "../prototype/finance";

describe("capture domain helpers", () => {
  it("handles currency-specific precision without floating-point parsing", () => {
    expect(parseAmountToMinor("85.40", getCurrency("NZD").minorUnit)).toBe(8540);
    expect(parseAmountToMinor("1200", getCurrency("JPY").minorUnit)).toBe(1200);
    expect(parseAmountToMinor("1.234", getCurrency("KWD").minorUnit)).toBe(1234);
    expect(parseAmountToMinor("1.2", getCurrency("JPY").minorUnit)).toBeNaN();
    expect(convertPrototypeToGroupMinor(1000, "EUR")).toBeNull();
    expect(formatMoney(1200, "JPY")).toContain("1,200");
    expect(formatMoney(1234, "KWD")).toContain("1.234");
  });

  it("uses an injectable group-local clock", () => {
    expect(groupLocalDate(new Date("2026-11-25T11:30:00Z"))).toBe("2026-11-26");
  });

  it("ranks useful history matches", () => {
    expect(rankHistory("grocer", initialExpenses)[0]?.description).toBe("Weekly groceries");
    expect(rankHistory("wekly grocries", initialExpenses)[0]?.description).toBe("Weekly groceries");
    expect(rankHistory("rent", initialExpenses)[0]?.description).toBe("Monthly rent");
    expect(rankHistory("at hop top up for ferry", initialExpenses)).toEqual([]);
  });

  it("classifies common transport inputs and keeps uncertain dimensions unconfirmed", () => {
    for (const input of ["at hop top up for ferry", "bus fare", "train ticket", "uber to airport"]) expect(inferCapture(input).category).toBe("Transport");
    const hop = inferCapture("at hop top up for ferry");
    expect(hop.improvedDescription).toBe("AT HOP card top-up for ferry travel");
    expect(hop.suggestedTags).toEqual(expect.arrayContaining(["Transport", "Public transport", "Ferry", "AT HOP", "Top-up"]));
    expect(hop.frequency).toBe("Pending review");
    expect(hop.expectation).toBe("Pending review");
  });
});
