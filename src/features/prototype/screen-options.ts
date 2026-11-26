import type { Expense, ExpenseTag } from "./types";

export const categories: Expense["category"][] = [
  "Housing", "Groceries", "Dining", "Transport", "Utilities", "Health", "Shopping", "Entertainment",
  "Subscriptions", "Travel", "Education", "Insurance", "Gifts", "Household", "Other", "Unclassified",
];

export const availableTags: ExpenseTag[] = [
  "Household", "Essential", "Moving", "Subscription", "Holiday", "Work", "Emergency", "Entertainment",
];
