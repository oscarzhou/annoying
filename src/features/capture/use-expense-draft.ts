"use client";

import { useEffect, useMemo, useState } from "react";
import type { Expense, ExpenseTag, Expectation, Frequency } from "@/features/prototype/types";
import { addCalendarDays, groupLocalDate } from "./clock";
import { inferCapture, rankHistory } from "./capture-rules";
import { convertPrototypeToGroupMinor, currencies, getCurrency, parseAmountToMinor } from "./currency-data";

const STORAGE_KEY = "annoying-capture-draft-v1";

type DraftState = {
  mode: "smart" | "manual";
  amount: string;
  description: string;
  originalInput: string;
  currency: string;
  date: string;
  period: Expense["period"];
  category: Expense["category"];
  frequency: Frequency;
  expectation: Expectation;
  tags: ExpenseTag[];
  touched: { amount: boolean; currency: boolean; date: boolean; category: boolean; frequency: boolean; expectation: boolean };
};

function initialDraft(): DraftState {
  return { mode: "smart", amount: "", description: "", originalInput: "", currency: "NZD", date: groupLocalDate(), period: "Now", category: "Unclassified", frequency: "Pending review", expectation: "Pending review", tags: [], touched: { amount: false, currency: false, date: false, category: false, frequency: false, expectation: false } };
}

function currencyFromInput(input: string) {
  const normalized = input.toLowerCase();
  return currencies.find((currency) => new RegExp(`\\b${currency.code.toLowerCase()}\\b`).test(normalized) || currency.aliases.some((alias) => normalized.includes(alias)))?.code;
}

export function minorToInput(minor: number, currency: string) {
  const digits = getCurrency(currency).minorUnit;
  if (digits === 0) return String(minor);
  const scale = 10 ** digits;
  return `${Math.floor(minor / scale)}.${String(minor % scale).padStart(digits, "0")}`;
}

export function useExpenseDraft(history: Expense[]) {
  const [draft, setDraft] = useState<DraftState>(initialDraft);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try { setDraft(JSON.parse(stored) as DraftState); } catch { sessionStorage.removeItem(STORAGE_KEY); }
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); }, [draft, hydrated]);

  const inference = useMemo(() => inferCapture(draft.description), [draft.description]);
  const historyMatches = useMemo(() => rankHistory(draft.description, history), [draft.description, history]);
  const detectedAmount = draft.description.match(/(?:^|\s)(\d+(?:\.\d{1,3})?)(?=\s|$)/)?.[1] ?? "";
  const detectedCurrency = currencyFromInput(draft.description);
  const today = groupLocalDate();
  const detectedDate = /\byesterday\b|\blast night\b/i.test(draft.description) ? addCalendarDays(today, -1) : today;
  const currency = draft.touched.currency ? draft.currency : detectedCurrency ?? draft.currency;
  const date = draft.touched.date ? draft.date : detectedDate;
  const amount = draft.touched.amount ? draft.amount : draft.amount || detectedAmount;
  const period = date === today ? draft.period : draft.period === "Now" ? null : draft.period;
  const category = draft.touched.category ? draft.category : inference.category;
  const frequency = draft.touched.frequency ? draft.frequency : inference.frequency;
  const expectation = draft.touched.expectation ? draft.expectation : inference.expectation;
  const currencyDefinition = getCurrency(currency);
  const amountMinor = parseAmountToMinor(amount, currencyDefinition.minorUnit);
  const groupAmountMinor = convertPrototypeToGroupMinor(amountMinor, currency);
  const isDirty = Boolean(draft.amount || draft.description || draft.tags.length || draft.touched.currency || draft.touched.date || draft.touched.category || draft.touched.frequency || draft.touched.expectation);

  const update = <K extends keyof DraftState>(key: K, value: DraftState[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const touch = (key: keyof DraftState["touched"]) => setDraft((current) => ({ ...current, touched: { ...current.touched, [key]: true } }));
  const reset = () => { setDraft(initialDraft()); sessionStorage.removeItem(STORAGE_KEY); };

  const selectHistory = (item: Expense) => setDraft((current) => ({
    ...current,
    description: item.description,
    amount: current.touched.amount ? current.amount : minorToInput(item.amountMinor, item.currency),
    currency: current.touched.currency ? current.currency : item.currency,
    category: current.touched.category ? current.category : item.category,
    frequency: current.touched.frequency ? current.frequency : item.frequency,
    expectation: current.touched.expectation ? current.expectation : item.expectation,
    tags: current.tags.length ? current.tags : item.tags,
  }));

  return {
    draft, update, touch, reset, selectHistory, inference, historyMatches, today, currency, date, amount, period, category, frequency, expectation, currencyDefinition, amountMinor, groupAmountMinor, isDirty,
  };
}
