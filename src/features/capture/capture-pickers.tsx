"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronRight, CircleDollarSign, Clock3, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CategoryIcon, categoryMeta } from "@/features/prototype/category-meta";
import type { Expense, Expectation, Frequency } from "@/features/prototype/types";
import { cn } from "@/lib/utils";
import { currencies, getCurrency, GROUP_CURRENCY, searchCurrencies } from "./currency-data";

export const categories: Expense["category"][] = ["Housing", "Groceries", "Dining", "Transport", "Utilities", "Health", "Shopping", "Entertainment", "Subscriptions", "Travel", "Education", "Insurance", "Gifts", "Household", "Other", "Unclassified"];

export function PickerField({ label, value, icon: Icon, onClick, detail }: { label: string; value: string; icon: typeof CalendarDays; onClick: () => void; detail?: string }) {
  return <Field className="min-w-0 gap-2"><FieldLabel>{label}</FieldLabel><button type="button" aria-label={`${label}: ${value}`} onClick={onClick} className="flex min-h-12 min-w-0 items-center gap-3 rounded-lg border bg-background px-3 text-left outline-none transition-[color,background-color,border-color,transform] active:scale-[0.99] hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"><Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{value}</span>{detail ? <span className="block truncate text-xs text-muted-foreground">{detail}</span> : null}</span><ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></button></Field>;
}

function PickerDialog({ open, onOpenChange, title, description, query, onQueryChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; query: string; onQueryChange: (value: string) => void; children: React.ReactNode }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={false} className="top-0 left-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 sm:top-1/2 sm:left-1/2 sm:h-[min(42rem,90dvh)] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border"><DialogHeader className="border-b p-4 text-left"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><DialogTitle className="font-display text-xl">{title}</DialogTitle><DialogDescription>{description}</DialogDescription></div><Button variant="ghost" size="icon" aria-label={`Close ${title.toLowerCase()}`} onClick={() => onOpenChange(false)}><X /></Button></div><div className="relative mt-3"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input value={query} onChange={(event) => onQueryChange(event.target.value)} name={`${title.toLowerCase()}-search`} autoComplete="off" placeholder={`Search ${title.toLowerCase()}…`} className="h-12 pl-10 text-base" /></div></DialogHeader><div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">{children}</div></DialogContent></Dialog>;
}

export function CurrencyPicker({ value, onChange, recent }: { value: string; onChange: (value: string) => void; recent: string[] }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState("");
  const results = searchCurrencies(query); const priority = query ? results : [...new Set([GROUP_CURRENCY, ...recent, ...currencies.map((currency) => currency.code)])].map(getCurrency);
  const selected = getCurrency(value);
  return <><PickerField label="Currency" value={selected.code} detail={selected.name} icon={CircleDollarSign} onClick={() => setOpen(true)} /><PickerDialog open={open} onOpenChange={setOpen} title="Currency" description="Choose independently from exchange-rate availability." query={query} onQueryChange={setQuery}><div className="flex flex-col gap-1">{priority.map((currency) => <button key={currency.code} type="button" onClick={() => { onChange(currency.code); setOpen(false); setQuery(""); }} className="flex min-h-14 items-center gap-3 rounded-lg px-3 text-left outline-none transition-[background-color,transform] active:scale-[0.99] hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><span className="font-financial w-11 text-sm font-semibold">{currency.code}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm">{currency.name}</span><span className="block text-xs text-muted-foreground">{currency.code === GROUP_CURRENCY ? "Group default" : currency.prototypeRate ? "Prototype rate available" : "Conversion unavailable"}</span></span>{value === currency.code ? <Check className="size-4 text-primary" aria-label="Selected" /> : null}</button>)}</div></PickerDialog></>;
}

export function CategoryPicker({ value, onChange }: { value: Expense["category"]; onChange: (value: Expense["category"]) => void }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState("");
  const results = useMemo(() => categories.filter((category) => category.toLowerCase().includes(query.trim().toLowerCase())), [query]);
  return <><PickerField label="Category" value={value} detail={value === "Unclassified" ? "Choose when known" : "Expense category"} icon={categoryMeta[value].icon} onClick={() => setOpen(true)} /><PickerDialog open={open} onOpenChange={setOpen} title="Category" description="Scroll, search, then choose one category." query={query} onQueryChange={setQuery}><div className="grid grid-cols-1 gap-1 sm:grid-cols-2">{results.map((category) => <button key={category} type="button" onClick={() => { onChange(category); setOpen(false); setQuery(""); }} className={cn("flex min-h-14 items-center gap-3 rounded-lg px-3 text-left outline-none transition-[background-color,transform] active:scale-[0.99] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring", value === category && "bg-muted")}><span className={cn("flex size-9 items-center justify-center rounded-full", categoryMeta[category].soft)}><CategoryIcon category={category} /></span><span className="flex-1 text-sm font-medium">{category}</span>{value === category ? <Check className="size-4 text-primary" aria-label="Selected" /> : null}</button>)}</div></PickerDialog></>;
}

function ChoiceGroup<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (value: T) => void }) {
  return <Field className="gap-2"><FieldLabel>{label}</FieldLabel><ToggleGroup type="single" value={value} onValueChange={(next) => next && onChange(next as T)} variant="outline" spacing={2} aria-label={label} className="grid w-full grid-cols-3">{options.map((option) => <ToggleGroupItem key={option} value={option} className="min-w-0 px-2 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{option === "Pending review" ? "Unconfirmed" : option}</ToggleGroupItem>)}</ToggleGroup></Field>;
}

export function ClassificationControls({ frequency, expectation, onFrequency, onExpectation }: { frequency: Frequency; expectation: Expectation; onFrequency: (value: Frequency) => void; onExpectation: (value: Expectation) => void }) {
  return <div className="flex flex-col gap-4"><ChoiceGroup label="Frequency" value={frequency} options={["Recurring", "One-off", "Pending review"]} onChange={onFrequency} /><ChoiceGroup label="Expectation" value={expectation} options={["Expected", "Unexpected", "Pending review"]} onChange={onExpectation} /></div>;
}

export function TimePicker({ value, includeNow, onChange }: { value: Expense["period"]; includeNow: boolean; onChange: (value: Expense["period"]) => void }) {
  const [open, setOpen] = useState(false); const display = value ?? "Unspecified"; const options = includeNow ? ["Now", "Morning", "Afternoon", "Evening", "Unspecified"] : ["Morning", "Afternoon", "Evening", "Unspecified"];
  return <><PickerField label="Time of day" value={display} detail={includeNow ? "Local household time" : "No exact time assumed"} icon={Clock3} onClick={() => setOpen(true)} /><Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Time of day</DialogTitle><DialogDescription>Choose a broad period. Historical entries never invent an exact time.</DialogDescription></DialogHeader><div className="flex flex-col gap-1">{options.map((option) => <button key={option} type="button" onClick={() => { onChange(option === "Unspecified" ? null : option as Expense["period"]); setOpen(false); }} className={cn("flex min-h-12 items-center rounded-lg px-3 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring", display === option && "bg-muted text-primary")}><span className="flex-1">{option}</span>{display === option ? <Check className="size-4" /> : null}</button>)}</div></DialogContent></Dialog></>;
}
