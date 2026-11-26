import type { Expense, ExpenseTag } from "@/features/prototype/types";

export type CaptureInference = {
  category: Expense["category"];
  frequency: Expense["frequency"];
  expectation: Expense["expectation"];
  suggestedTags: ExpenseTag[];
  improvedDescription: string | null;
};

const rules: Array<{ category: Expense["category"]; keywords: string[]; tags: string[] }> = [
  { category: "Transport", keywords: ["at hop", "hop card", "bus", "train", "ferry", "uber", "taxi", "petrol", "parking", "top up", "top-up"], tags: ["Transport"] },
  { category: "Housing", keywords: ["rent", "mortgage", "landlord"], tags: ["Household"] },
  { category: "Groceries", keywords: ["grocer", "supermarket", "costco", "market", "countdown", "woolworths"], tags: ["Household", "Essential"] },
  { category: "Utilities", keywords: ["electricity", "power bill", "water bill", "internet", "broadband"], tags: ["Household", "Essential"] },
  { category: "Subscriptions", keywords: ["netflix", "spotify", "subscription", "streaming"], tags: ["Subscription", "Entertainment"] },
  { category: "Dining", keywords: ["coffee", "dinner", "lunch", "takeaway", "restaurant"], tags: ["Entertainment"] },
];

const tagRules: Array<{ keywords: string[]; tags: string[] }> = [
  { keywords: ["at hop", "hop card"], tags: ["AT HOP", "Public transport", "Top-up"] },
  { keywords: ["ferry"], tags: ["Ferry", "Public transport"] },
  { keywords: ["bus", "train"], tags: ["Public transport"] },
  { keywords: ["airport", "holiday", "travel"], tags: ["Travel"] },
  { keywords: ["emergency", "urgent"], tags: ["Emergency"] },
];

export const baseTagCatalogue = ["Household", "Essential", "Transport", "Public transport", "Ferry", "AT HOP", "Top-up", "Moving", "Subscription", "Holiday", "Travel", "Work", "Emergency", "Entertainment"];

export function normalizeSearch(value: string) {
  return value.toLowerCase().trim().replace(/[-_]+/g, " ").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");
}

function distanceAtMostOne(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let edits = 0; let left = 0; let right = 0;
  while (left < a.length && right < b.length) {
    if (a[left] === b[right]) { left += 1; right += 1; continue; }
    edits += 1; if (edits > 1) return false;
    if (a.length > b.length) left += 1; else if (b.length > a.length) right += 1; else { left += 1; right += 1; }
  }
  return true;
}

function textScore(query: string, candidate: string) {
  const normalizedQuery = normalizeSearch(query); const normalizedCandidate = normalizeSearch(candidate);
  if (!normalizedQuery) return 0;
  if (normalizedCandidate === normalizedQuery) return 100;
  if (normalizedCandidate.startsWith(normalizedQuery)) return 80;
  const queryTokens = normalizedQuery.split(" "); const candidateTokens = normalizedCandidate.split(" ");
  let score = 0;
  for (const token of queryTokens) {
    if (candidateTokens.some((candidateToken) => candidateToken === token)) score += 18;
    else if (candidateTokens.some((candidateToken) => candidateToken.startsWith(token))) score += 14;
    else if (token.length >= 4 && candidateTokens.some((candidateToken) => distanceAtMostOne(token, candidateToken))) score += 9;
    else if (normalizedCandidate.includes(token)) score += 6;
    else return 0;
  }
  return score;
}

export function rankHistory(query: string, history: Expense[]) {
  const frequency = new Map<string, number>();
  for (const item of history) frequency.set(item.description, (frequency.get(item.description) ?? 0) + 1);
  return history.map((item, index) => { const matchScore = Math.max(textScore(query, item.description), ...item.tags.map((tag) => textScore(query, tag))); return { item, matchScore, score: matchScore + (frequency.get(item.description) ?? 1) * 3 + Math.max(0, 5 - index / 5) }; })
    .filter(({ matchScore, score }) => matchScore > 0 && score >= 9)
    .filter(({ item }, index, values) => values.findIndex((candidate) => candidate.item.description === item.description) === index)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ item }) => item);
}

export function inferCapture(input: string): CaptureInference {
  const normalized = normalizeSearch(input);
  const categoryRule = rules.find((rule) => rule.keywords.some((keyword) => normalized.includes(normalizeSearch(keyword))));
  const suggestedTags = new Set(categoryRule?.tags ?? []);
  for (const rule of tagRules) if (rule.keywords.some((keyword) => normalized.includes(normalizeSearch(keyword)))) rule.tags.forEach((tag) => suggestedTags.add(tag));
  const isAtHop = normalized.includes("at hop") && (normalized.includes("top up") || normalized.includes("ferry"));
  return {
    category: categoryRule?.category ?? "Unclassified",
    frequency: /\bweekly\b|\bmonthly\b|\bsubscription\b/.test(normalized) ? "Recurring" : "Pending review",
    expectation: /\bunexpected\b|\bemergency\b/.test(normalized) ? "Unexpected" : "Pending review",
    suggestedTags: [...suggestedTags],
    improvedDescription: isAtHop ? "AT HOP card top-up for ferry travel" : null,
  };
}
