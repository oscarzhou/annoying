import type { Category, Expense, InsightPeriod } from "./types";
import { convertPrototypeToGroupMinor, getCurrency } from "../capture/currency-data";

export const REFERENCE_DATE = "2026-11-24";
export const GROUP_CURRENCY = "NZD";
export const MONTHLY_BUDGET_MINOR = 380000;
export const formatMoney = (minor: number, currency = GROUP_CURRENCY, maximumFractionDigits = getCurrency(currency).minorUnit) => new Intl.NumberFormat("en-NZ", { style: "currency", currency, maximumFractionDigits }).format(minor / 10 ** getCurrency(currency).minorUnit);
export const formatCompactMoney = (minor: number) => new Intl.NumberFormat("en-NZ", { style: "currency", currency: GROUP_CURRENCY, maximumFractionDigits: 0, notation: "compact" }).format(minor / 100);
export const formatDate = (date: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) => new Intl.DateTimeFormat("en-NZ", options).format(new Date(`${date}T12:00:00`));
export const parseMoneyToMinor = (value: string) => {
  const match = value.trim().match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return Number.NaN;
  const whole = Number.parseInt(match[1], 10);
  const fraction = Number.parseInt((match[2] ?? "").padEnd(2, "0") || "0", 10);
  const minor = whole * 100 + fraction;
  return Number.isSafeInteger(minor) ? minor : Number.NaN;
};
export const convertToGroupMinor = (minor: number, currency: Expense["currency"]) => convertPrototypeToGroupMinor(minor, currency) ?? Number.NaN;
export const inRange = (expense: Expense, start: string, end: string) => expense.date >= start && expense.date <= end;
export const sumExpenses = (expenses: Expense[]) => expenses.reduce((sum, expense) => sum + expense.groupAmountMinor, 0);

export function periodRange(period: InsightPeriod, offset: number) {
  if (period === "month") { const monthIndex = 10 + offset; const start = new Date(Date.UTC(2026, monthIndex, 1)); const end = offset === 0 ? new Date(`${REFERENCE_DATE}T12:00:00Z`) : new Date(Date.UTC(2026, monthIndex + 1, 0)); return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), label: new Intl.DateTimeFormat("en-NZ", { month: "long", year: "numeric", timeZone: "UTC" }).format(start), complete: offset < 0 }; }
  const end = new Date(`${REFERENCE_DATE}T12:00:00Z`); end.setUTCDate(end.getUTCDate() + offset * 7); const start = new Date(end); start.setUTCDate(end.getUTCDate() - 6); return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), label: `${formatDate(start.toISOString().slice(0, 10))}–${formatDate(end.toISOString().slice(0, 10), { day: "numeric", month: "short", year: "numeric" })}`, complete: offset < 0 };
}

export function groupByDate(expenses: Expense[]) { return expenses.reduce<Record<string, Expense[]>>((groups, item) => { (groups[item.date] ??= []).push(item); return groups; }, {}); }
export function categoryTotals(expenses: Expense[]) { const total = sumExpenses(expenses); return Array.from(expenses.reduce<Map<Expense["category"], number>>((map, item) => map.set(item.category, (map.get(item.category) ?? 0) + item.groupAmountMinor), new Map())).map(([category, amountMinor]) => ({ category, amountMinor, percentage: total ? Math.round(amountMinor / total * 100) : 0 })).sort((a, b) => b.amountMinor - a.amountMinor); }
export function dimensionTotals(expenses: Expense[], dimension: "frequency" | "expectation") { const total = sumExpenses(expenses); return Array.from(expenses.reduce<Map<string, number>>((map, item) => { const key = item[dimension]; map.set(key, (map.get(key) ?? 0) + item.groupAmountMinor); return map; }, new Map())).map(([label, amountMinor]) => ({ label, amountMinor, percentage: total ? amountMinor / total * 100 : 0 })); }
export function dailyTotals(expenses: Expense[], start: string, end: string) { const result: Array<{ date: string; label: string; amountMinor: number }> = []; const cursor = new Date(`${start}T12:00:00Z`); const finish = new Date(`${end}T12:00:00Z`); while (cursor <= finish) { const date = cursor.toISOString().slice(0, 10); result.push({ date, label: formatDate(date, { weekday: "short", day: "numeric" }), amountMinor: sumExpenses(expenses.filter((item) => item.date === date)) }); cursor.setUTCDate(cursor.getUTCDate() + 1); } return result; }
export function weeklyTotals(expenses: Expense[], start: string, end: string) { const result: Array<{ date: string; label: string; amountMinor: number }> = []; const cursor = new Date(`${start}T12:00:00Z`); const finish = new Date(`${end}T12:00:00Z`); let index = 1; while (cursor <= finish) { const weekStart = cursor.toISOString().slice(0, 10); const weekEndDate = new Date(cursor); weekEndDate.setUTCDate(Math.min(finish.getUTCDate(), cursor.getUTCDate() + 6)); const weekEnd = weekEndDate.toISOString().slice(0, 10); result.push({ date: weekStart, label: `W${index}`, amountMinor: sumExpenses(expenses.filter((item) => inRange(item, weekStart, weekEnd))) }); cursor.setUTCDate(cursor.getUTCDate() + 7); index += 1; } return result; }
export const isCategory = (value: string): value is Category => ["Housing", "Groceries", "Dining", "Transport", "Utilities", "Health", "Shopping", "Entertainment", "Subscriptions", "Travel", "Education", "Insurance", "Gifts", "Household", "Other"].includes(value);
