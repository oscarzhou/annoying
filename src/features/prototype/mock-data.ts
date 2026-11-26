import type { Expense, RecurringSuggestion } from "./types";

const expense = (value: Omit<Expense, "currency" | "groupAmountMinor" | "period" | "tags"> & Partial<Pick<Expense, "currency" | "groupAmountMinor" | "period" | "tags">>): Expense => ({ currency: "NZD", period: null, tags: [], groupAmountMinor: value.amountMinor, ...value });

export const initialExpenses: Expense[] = [
  expense({ id: "e-01", description: "Weekly groceries", originalInput: "groceries market 85", amountMinor: 8540, date: "2026-11-24", category: "Groceries", frequency: "Recurring", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-02", description: "Coffee with a friend", originalInput: "coffee 6.5", amountMinor: 650, date: "2026-11-23", period: "Morning", category: "Dining", frequency: "One-off", expectation: "Expected", creator: "Jordan" }),
  expense({ id: "e-03", description: "Monthly rent", originalInput: "rent 690", amountMinor: 69000, date: "2026-11-22", category: "Housing", frequency: "Recurring", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-04", description: "Unexpected car repair", originalInput: "car repair unexpected 350", amountMinor: 35000, date: "2026-11-20", category: "Transport", frequency: "One-off", expectation: "Unexpected", creator: "Jordan" }),
  expense({ id: "e-05", description: "Power bill", originalInput: "power bill 142", amountMinor: 14218, date: "2026-11-18", category: "Utilities", frequency: "Recurring", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-06", description: "Sushi takeaway", originalInput: "sushi 48", amountMinor: 4800, date: "2026-11-17", period: "Evening", category: "Dining", frequency: "One-off", expectation: "Expected", creator: "Jordan" }),
  expense({ id: "e-07", description: "Petrol", originalInput: "petrol 92", amountMinor: 9200, date: "2026-11-15", category: "Transport", frequency: "One-off", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-08", description: "Pharmacy", originalInput: "pharmacy cold medicine 27", amountMinor: 2735, date: "2026-11-13", category: "Health", frequency: "One-off", expectation: "Unexpected", creator: "Jordan" }),
  expense({ id: "e-09", description: "Fresh produce market", originalInput: "market fruit veg 64", amountMinor: 6420, date: "2026-11-11", category: "Groceries", frequency: "One-off", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-10", description: "Mobile plans", originalInput: "phones 76", amountMinor: 7600, date: "2026-11-09", category: "Utilities", frequency: "Recurring", expectation: "Expected", creator: "Jordan" }),
  expense({ id: "e-11", description: "Monthly rent", originalInput: "rent 690", amountMinor: 69000, date: "2026-11-08", category: "Housing", frequency: "Recurring", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-12", description: "Dinner with friends", originalInput: "dinner with friends 120", amountMinor: 12000, date: "2026-11-07", period: "Evening", category: "Dining", frequency: "One-off", expectation: "Expected", creator: "Jordan" }),
  expense({ id: "e-13", description: "Weekly groceries", originalInput: "groceries 104", amountMinor: 10425, date: "2026-11-04", category: "Groceries", frequency: "Recurring", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-14", description: "Parking", originalInput: "parking city 18", amountMinor: 1800, date: "2026-11-02", category: "Transport", frequency: "One-off", expectation: "Pending review", creator: "Jordan" }),
  expense({ id: "e-15", description: "Streaming services", originalInput: "streaming music 39", amountMinor: 3898, date: "2026-11-01", category: "Other", frequency: "Recurring", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-16", description: "Weekly groceries", originalInput: "groceries 96", amountMinor: 9610, date: "2026-10-28", category: "Groceries", frequency: "Recurring", expectation: "Expected", creator: "Jordan" }),
  expense({ id: "e-17", description: "Monthly rent", originalInput: "rent 690", amountMinor: 69000, date: "2026-10-22", category: "Housing", frequency: "Recurring", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-18", description: "Water bill", originalInput: "water 68", amountMinor: 6840, date: "2026-10-18", category: "Utilities", frequency: "Recurring", expectation: "Expected", creator: "Jordan" }),
  expense({ id: "e-19", description: "Airport lunch", originalInput: "airport lunch 31 aud", amountMinor: 3100, currency: "AUD", groupAmountMinor: 3438, date: "2026-10-12", category: "Dining", frequency: "One-off", expectation: "Expected", creator: "Alex" }),
  expense({ id: "e-20", description: "Bike service", originalInput: "bike service 115", amountMinor: 11500, date: "2026-10-05", category: "Transport", frequency: "One-off", expectation: "Unexpected", creator: "Jordan" }),
];

export const initialRecurring: RecurringSuggestion[] = [
  { id: "r-1", description: "Weekly rent", amountMinor: 69000, dueDate: "2026-11-27", state: "Due", category: "Housing" },
  { id: "r-2", description: "Fibre internet", amountMinor: 8900, dueDate: "2026-11-28", state: "Upcoming", category: "Utilities" },
  { id: "r-3", description: "Gym membership", amountMinor: 5400, dueDate: "2026-12-01", state: "Upcoming", category: "Health" },
];
