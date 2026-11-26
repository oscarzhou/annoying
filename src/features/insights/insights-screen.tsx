"use client";

import { useState } from "react";
import { Bot, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryIcon } from "@/features/prototype/category-meta";
import { CategoryBars, SpendingBars } from "@/features/prototype/charts";
import { MONTHLY_BUDGET_MINOR, categoryTotals, dailyTotals, dimensionTotals, formatMoney, inRange, periodRange, sumExpenses, weeklyTotals } from "@/features/prototype/finance";
import { Metric, PageTitle, SectionHeading } from "@/features/prototype/shared-ui";
import type { Expense, InsightPeriod } from "@/features/prototype/types";

type AnalysisState = "idle" | "loading" | "complete" | "error";

function tagTotals(expenses: Expense[]) {
  const total = sumExpenses(expenses);
  const totals = new Map<string, number>();
  expenses.forEach((expense) => expense.tags.forEach((tag) => totals.set(tag, (totals.get(tag) ?? 0) + expense.groupAmountMinor)));
  return Array.from(totals, ([label, amountMinor]) => ({ label, amountMinor, percentage: total ? amountMinor / total * 100 : 0 })).sort((a, b) => b.amountMinor - a.amountMinor);
}

export function InsightsScreen({ expenses, onActivity }: { expenses: Expense[]; onActivity: (filter?: { category?: Expense["category"] }) => void }) {
  const [period, setPeriod] = useState<InsightPeriod>("month");
  const [offset, setOffset] = useState(0);
  const [analysis, setAnalysis] = useState<AnalysisState>("idle");
  const range = periodRange(period, offset);
  const selected = expenses.filter((item) => inRange(item, range.start, range.end));
  const total = sumExpenses(selected);
  const days = dailyTotals(selected, range.start, range.end);
  const trend = period === "month" ? weeklyTotals(selected, range.start, range.end) : days;
  const categories = categoryTotals(selected);
  const previousRange = periodRange(period, offset - 1);
  const previousTotal = sumExpenses(expenses.filter((item) => inRange(item, previousRange.start, previousRange.end)));
  const comparable = period === "week" || range.complete;
  const change = comparable && previousTotal ? Math.round((total - previousTotal) / previousTotal * 100) : null;
  const budgetRemaining = MONTHLY_BUDGET_MINOR - total;
  const budgetPercent = Math.round(total / MONTHLY_BUDGET_MINOR * 100);

  return <div><PageTitle title="Insights" />
    <div className="mb-5 flex items-center justify-between gap-2 border-y py-3"><Button variant="outline" size="icon" aria-label="Previous period" onClick={() => setOffset((value) => value - 1)}><ChevronLeft /></Button><div className="text-center"><Tabs value={period} onValueChange={(value) => { setPeriod(value as InsightPeriod); setOffset(0); }}><TabsList><TabsTrigger value="week">Week</TabsTrigger><TabsTrigger value="month">Month</TabsTrigger></TabsList></Tabs><p className="mt-1 font-financial text-xs text-muted-foreground">{range.label}</p></div><Button variant="outline" size="icon" aria-label="Next period" disabled={offset >= 0} onClick={() => setOffset((value) => value + 1)}><ChevronRight /></Button></div>
    <section className="mb-6" aria-labelledby="period-overview"><SectionHeading id="period-overview" title="Period overview" /><div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4"><Metric label="Total" value={formatMoney(total, "NZD", 0)} /><Metric label="Daily average" value={formatMoney(Math.round(total / Math.max(1, days.length)), "NZD", 0)} /><Metric label="Transactions" value={`${selected.length}`} /><Metric label="Previous period" value={change === null ? "Not comparable" : `${change > 0 ? "+" : ""}${change}%`} /></div></section>
    <InsightSection title="Spending trend" description={period === "month" ? "Weekly totals for the selected month" : "Daily totals for the selected week"}><SpendingBars data={trend} height={168} /></InsightSection>
    <InsightSection title="Budget" description="Prototype monthly limit for Demo Household"><div className="mb-2 flex items-end justify-between gap-3"><Metric label="Remaining" value={formatMoney(budgetRemaining, "NZD", 0)} /><p className="font-financial text-sm text-primary">{budgetPercent}% used</p></div><Progress value={Math.min(100, budgetPercent)} aria-label={`${budgetPercent} percent of monthly budget used`} className="h-1.5" /></InsightSection>
    <InsightSection title="Category distribution" description="Select a category bar to inspect its transactions"><CategoryBars data={categories} onCategory={(category) => onActivity({ category })} /><DataRows data={categories.map((item) => ({ ...item, label: item.category }))} icons /></InsightSection>
    <div className="grid gap-6 lg:grid-cols-2"><Breakdown title="Frequency" data={dimensionTotals(selected, "frequency")} total={total} /><Breakdown title="Expectation" data={dimensionTotals(selected, "expectation")} total={total} /></div>
    <Separator className="my-6" />
    <section aria-labelledby="tag-analysis"><SectionHeading id="tag-analysis" title="Tags" value={`${tagTotals(selected).length} used`} /><p className="mb-3 text-xs text-muted-foreground">Tags overlap, so their percentages are not parts of one whole.</p><DataRows data={tagTotals(selected)} /></section>
    <Separator className="my-6" />
    <section aria-labelledby="recorded-by"><SectionHeading id="recorded-by" title="Recorded by" /><div className="grid grid-cols-2 gap-4"><Metric label="Alex" value={formatMoney(sumExpenses(selected.filter((item) => item.creator === "Alex")), "NZD", 0)} /><Metric label="Jordan" value={formatMoney(sumExpenses(selected.filter((item) => item.creator === "Jordan")), "NZD", 0)} /></div><p className="mt-2 text-xs text-muted-foreground">Shows who recorded each expense, not who paid it.</p></section>
    <Separator className="my-6" />
    <AnalysisPanel state={analysis} onChange={setAnalysis} period={period} />
  </div>;
}

function InsightSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="mb-6 border-b pb-6"><SectionHeading title={title} /><p className="mb-3 text-xs text-muted-foreground">{description}</p>{children}</section>;
}

function DataRows({ data, icons = false }: { data: Array<{ label: string; amountMinor: number; percentage: number }>; icons?: boolean }) {
  return <div className="mt-3 flex flex-col gap-2">{data.map((item) => <div key={item.label} className="flex min-w-0 items-center gap-2 text-xs">{icons ? <CategoryIcon category={item.label as Expense["category"]} /> : null}<span className="min-w-0 flex-1 truncate">{item.label}</span><span className="font-financial text-muted-foreground">{Math.round(item.percentage)}%</span><span className="w-24 text-right font-financial font-medium">{formatMoney(item.amountMinor)}</span></div>)}</div>;
}

function Breakdown({ title, data, total }: { title: string; data: Array<{ label: string; amountMinor: number; percentage: number }>; total: number }) {
  return <section aria-labelledby={`breakdown-${title}`}><SectionHeading id={`breakdown-${title}`} title={title} value={`of ${formatMoney(total, "NZD", 0)}`} /><div className="mb-3 flex h-2 overflow-hidden rounded-full bg-muted">{data.map((item, index) => <span key={item.label} className={index === 0 ? "bg-primary" : index === 1 ? "bg-accent" : "bg-muted-foreground"} style={{ width: `${item.percentage}%` }} title={`${item.label} ${Math.round(item.percentage)}%`} />)}</div><DataRows data={data} /></section>;
}

function AnalysisPanel({ state, onChange, period }: { state: AnalysisState; onChange: (state: AnalysisState) => void; period: InsightPeriod }) {
  if (state === "idle") return <section aria-labelledby="analysis"><SectionHeading id="analysis" title="AI spending analysis" value="Simulated" /><p className="mb-3 text-sm text-muted-foreground">Preview a mock summary for this {period}. No data leaves the browser.</p><div className="flex flex-wrap gap-2"><Button onClick={() => { onChange("loading"); window.setTimeout(() => onChange("complete"), 500); }}><Bot data-icon="inline-start" />Analyse this {period}</Button><Button variant="ghost" size="sm" onClick={() => onChange("error")}>Preview unavailable state</Button></div></section>;
  if (state === "loading") return <Alert><Clock3 /><AlertTitle>Preparing simulated analysis…</AlertTitle><AlertDescription>Reviewing this period’s mock spending patterns.</AlertDescription></Alert>;
  if (state === "error") return <Alert variant="destructive"><AlertTitle>Analysis is unavailable</AlertTitle><AlertDescription>Expense recording and deterministic charts still work.</AlertDescription><Button className="mt-3" variant="outline" onClick={() => onChange("idle")}>Try again</Button></Alert>;
  return <Alert><Bot /><AlertTitle>Simulated analysis</AlertTitle><AlertDescription className="flex flex-col gap-2"><p><strong>Summary:</strong> Housing and transport make up most recorded spending in this period.</p><p><strong>Pattern:</strong> One unexpected car repair increased transport costs.</p><p><strong>Idea:</strong> Consider a small monthly car-maintenance buffer before changing everyday spending.</p><p className="text-xs">Example only. No data was sent to an AI provider.</p><Button className="mt-1 w-fit" variant="outline" size="sm" onClick={() => onChange("idle")}>Dismiss</Button></AlertDescription></Alert>;
}
