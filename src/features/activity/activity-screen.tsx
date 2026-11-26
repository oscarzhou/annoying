"use client";

import { useMemo, useState } from "react";
import { ListFilter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { categories, availableTags } from "@/features/prototype/screen-options";
import { FilterSelect, PageTitle, TransactionList } from "@/features/prototype/shared-ui";
import { formatDate, formatMoney, groupByDate, sumExpenses } from "@/features/prototype/finance";
import type { Expense, ExpenseTag } from "@/features/prototype/types";

export function ActivityScreen({ expenses, onEdit }: { expenses: Expense[]; onEdit: (expense: Expense) => void }) {
  const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const date = params.get("date") ?? undefined;
  const routeCategory = params.get("category") ?? undefined;
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState(date ? "all" : "month");
  const [category, setCategory] = useState(routeCategory ?? "All");
  const [member, setMember] = useState("All");
  const [frequency, setFrequency] = useState("All");
  const [expectation, setExpectation] = useState("All");
  const [tag, setTag] = useState("All");
  const [more, setMore] = useState(false);
  const filtered = useMemo(() => expenses.filter((item) => (!date || item.date === date) && (period === "all" || item.date >= "2026-11-01") && item.description.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()) && (category === "All" || item.category === category) && (member === "All" || item.creator === member) && (frequency === "All" || item.frequency === frequency) && (expectation === "All" || item.expectation === expectation) && (tag === "All" || item.tags.includes(tag as ExpenseTag))), [expenses, date, period, query, category, member, frequency, expectation, tag]);
  const grouped = groupByDate(filtered);
  const activeFilterCount = [category, member, frequency, expectation, tag].filter((value) => value !== "All").length + (period !== "month" ? 1 : 0) + (date ? 1 : 0);
  const clearFilters = () => { setPeriod("month"); setCategory("All"); setMember("All"); setFrequency("All"); setExpectation("All"); setTag("All"); setQuery(""); };

  return <div><PageTitle title="Activity" subtitle={`${filtered.length} transactions · ${formatMoney(sumExpenses(filtered))}`} />
    <div className="mb-4 border-y py-3">
      <Field><FieldLabel htmlFor="expense-search" className="sr-only">Search expenses</FieldLabel><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="expense-search" name="expense-search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions…" className="h-11 pl-10" /></div></Field>
      <div className="mt-2 grid grid-cols-2 gap-2"><FilterSelect label="Period" value={period} onChange={setPeriod} options={["month", "all"]} labels={{ month: "This month", all: "All dates" }} /><FilterSelect label="Category" value={category} onChange={setCategory} options={["All", ...categories]} /></div>
      <div className="mt-2 flex items-center justify-between gap-2"><Button variant="ghost" size="sm" onClick={() => setMore((value) => !value)}><ListFilter data-icon="inline-start" />{more ? "Fewer filters" : `More filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`}</Button>{activeFilterCount || query ? <Button variant="ghost" size="sm" onClick={clearFilters}><X data-icon="inline-start" />Clear</Button> : null}</div>
      {more ? <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"><FilterSelect label="Member" value={member} onChange={setMember} options={["All", "Alex", "Jordan"]} /><FilterSelect label="Frequency" value={frequency} onChange={setFrequency} options={["All", "Recurring", "One-off", "Pending review"]} /><FilterSelect label="Expectation" value={expectation} onChange={setExpectation} options={["All", "Expected", "Unexpected", "Pending review"]} /><FilterSelect label="Tag" value={tag} onChange={setTag} options={["All", ...availableTags]} /></div> : null}
    </div>
    {filtered.length ? Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([groupDate, items]) => <section key={groupDate} aria-labelledby={`date-${groupDate}`} className="mb-5"><div className="mb-1 flex items-center justify-between gap-3"><h2 id={`date-${groupDate}`} className="text-sm font-semibold">{formatDate(groupDate, { weekday: "long", day: "numeric", month: "short" })}</h2><p className="font-financial text-xs text-muted-foreground">{formatMoney(sumExpenses(items))}</p></div><TransactionList expenses={items} onEdit={onEdit} /></section>) : <Empty><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>No matching transactions</EmptyTitle><EmptyDescription>Change or clear a filter to see more expenses.</EmptyDescription></EmptyHeader></Empty>}
  </div>;
}
