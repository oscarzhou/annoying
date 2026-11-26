"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BellRing, Bot, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Database, FolderCog, Home, Info, Lightbulb, ListFilter, Plus, ReceiptText, Search, Settings, SlidersHorizontal, Tags, Target, UserRound, Users } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaptureScreen } from "@/features/capture/capture-screen";
import { CategoryIcon, categoryMeta } from "./category-meta";
import { CategoryBars, SpendingBars } from "./charts";
import { MONTHLY_BUDGET_MINOR, REFERENCE_DATE, categoryTotals, convertToGroupMinor, dailyTotals, dimensionTotals, formatDate, formatMoney, groupByDate, inRange, parseMoneyToMinor, periodRange, sumExpenses, weeklyTotals } from "./finance";
import { initialExpenses, initialRecurring } from "./mock-data";
import type { Expense, ExpenseTag, InsightPeriod, RecurringSuggestion, Screen } from "./types";

const navItems: Array<{ id: Screen; label: string; icon: typeof Home }> = [
  { id: "dashboard", label: "Home", icon: Home }, { id: "activity", label: "Activity", icon: ReceiptText },
  { id: "insights", label: "Insights", icon: Lightbulb }, { id: "settings", label: "Settings", icon: Settings },
];
const categories: Expense["category"][] = ["Housing", "Groceries", "Dining", "Transport", "Utilities", "Health", "Shopping", "Entertainment", "Subscriptions", "Travel", "Education", "Insurance", "Gifts", "Household", "Other", "Unclassified"];
const availableTags: ExpenseTag[] = ["Household", "Essential", "Moving", "Subscription", "Holiday", "Work", "Emergency", "Entertainment"];
const screenPath: Record<Screen, string> = { dashboard: "/", activity: "/activity", insights: "/insights", settings: "/settings" };

export function PrototypeApp() {
  const pathname = usePathname(); const router = useRouter();
  const screen: Screen = pathname.startsWith("/activity") ? "activity" : pathname.startsWith("/insights") ? "insights" : pathname.startsWith("/settings") ? "settings" : "dashboard";
  const [expenses, setExpenses] = useState(initialExpenses);
  const [recurring, setRecurring] = useState(initialRecurring);
  const [editing, setEditing] = useState<Expense | null>(null);

  useEffect(() => { const stored = sessionStorage.getItem("annoying-expenses-v2"); if (stored) { const timer = window.setTimeout(() => setExpenses(JSON.parse(stored) as Expense[]), 0); return () => window.clearTimeout(timer); } }, []);
  const commitExpenses = (next: Expense[]) => { setExpenses(next); sessionStorage.setItem("annoying-expenses-v2", JSON.stringify(next)); };
  const saveExpense = (expense: Expense) => { commitExpenses([expense, ...expenses]); toast.success("Expense saved", { description: `${expense.description} · ${formatMoney(expense.amountMinor, expense.currency)}` }); };
  const navigateToActivity = (filter?: { date?: string; category?: Expense["category"] }) => { const params = new URLSearchParams(); if (filter?.date) params.set("date", filter.date); if (filter?.category) params.set("category", filter.category); router.push(`/activity${params.size ? `?${params}` : ""}`); };
  const captureHref = `/capture?from=${encodeURIComponent(pathname)}`;
  const leaveCapture = () => { const from = new URLSearchParams(window.location.search).get("from"); router.replace(from?.startsWith("/") && !from.startsWith("/capture") ? from : "/"); };

  if (pathname.startsWith("/capture")) return <><CaptureScreen history={expenses} onSave={(expense) => { saveExpense(expense); leaveCapture(); }} onCancel={leaveCapture} /><Toaster position="top-center" richColors /></>;

  return <div className="min-h-dvh overflow-x-hidden bg-background pb-24 md:pb-0 md:pl-24">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-2 focus:ring-ring">Skip to content</a>
    <DesktopRail screen={screen} captureHref={captureHref} />
    <AppHeader />
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-5 md:px-8 md:py-8">
      {screen === "dashboard" ? <Dashboard expenses={expenses} recurring={recurring} onConfirm={(id) => {
        const suggestion = recurring.find((item) => item.id === id);
        if (!suggestion || suggestion.state === "Confirmed") return;
        if (expenses.some((item) => item.id === `recurring-${id}`)) {
          setRecurring((items) => items.map((item) => item.id === id ? { ...item, state: "Confirmed" } : item));
          return;
        }
        const confirmedExpense: Expense = { id: `recurring-${id}`, description: suggestion.description, originalInput: `Confirmed recurring suggestion: ${suggestion.description}`, amountMinor: suggestion.amountMinor, groupAmountMinor: suggestion.amountMinor, currency: "NZD", date: REFERENCE_DATE, period: null, category: suggestion.category, frequency: "Recurring", expectation: "Expected", tags: ["Subscription"], creator: "Alex" };
        commitExpenses([confirmedExpense, ...expenses]);
        setRecurring((items) => items.map((item) => item.id === id ? { ...item, state: "Confirmed" } : item));
      }} onEdit={setEditing} onActivity={navigateToActivity} /> : null}
      {screen === "activity" ? <Activity expenses={expenses} onEdit={setEditing} /> : null}
      {screen === "insights" ? <Insights expenses={expenses} onActivity={navigateToActivity} /> : null}
      {screen === "settings" ? <SettingsIndex /> : null}
    </main>
    <MobileNav screen={screen} captureHref={captureHref} />
    <EditExpenseDrawer expense={editing} onOpenChange={(open) => !open && setEditing(null)} onSave={(expense) => { commitExpenses(expenses.map((item) => item.id === expense.id ? expense : item)); setEditing(null); toast.success("Expense updated"); }} />
    <Toaster position="top-center" richColors />
  </div>;
}

function AppHeader() {
  return <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 md:px-8"><p className="font-display text-xl font-semibold tracking-[-0.04em]" translate="no">annoying<span className="text-primary">.</span></p><Separator orientation="vertical" className="mx-1 h-5" /><Select defaultValue="demo"><SelectTrigger aria-label="Current household" className="min-w-0 flex-1 border-0 bg-transparent px-2 sm:max-w-56"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>Household</SelectLabel><SelectItem value="demo">Demo Household</SelectItem><SelectItem value="holiday">Holiday Fund</SelectItem></SelectGroup></SelectContent></Select><p className="hidden font-financial text-xs uppercase tracking-wider text-muted-foreground sm:block">NOV · 2026</p><Button variant="ghost" size="icon" aria-label="Notifications, 2 unread"><Bell /><span className="absolute mt-[-18px] ml-[18px] size-1.5 rounded-full bg-primary" /></Button></div></header>;
}

function Dashboard({ expenses, recurring, onConfirm, onEdit, onActivity }: { expenses: Expense[]; recurring: RecurringSuggestion[]; onConfirm: (id: string) => void; onEdit: (expense: Expense) => void; onActivity: (filter?: { date?: string; category?: Expense["category"] }) => void }) {
  const month = expenses.filter((item) => inRange(item, "2026-11-01", REFERENCE_DATE));
  const previousMonth = expenses.filter((item) => inRange(item, "2026-10-01", "2026-10-24"));
  const total = sumExpenses(month); const previousTotal = sumExpenses(previousMonth); const remaining = MONTHLY_BUDGET_MINOR - total; const budgetPercent = Math.round(total * 100 / MONTHLY_BUDGET_MINOR); const periodChange = previousTotal ? Math.round((total - previousTotal) * 100 / previousTotal) : null; const week = dailyTotals(month, "2026-11-18", REFERENCE_DATE).map((item) => ({ ...item, label: formatDate(item.date, { day: "numeric" }) }));
  return <div><PageTitle title="Home" action={<span className="font-financial text-xs text-muted-foreground">NOV 2026</span>} />
    <section className="mb-5 border-y py-5" aria-labelledby="monthly-total"><div className="flex items-end justify-between gap-4"><div><p className="mb-1 text-xs text-muted-foreground">Total spend</p><h2 id="monthly-total" className="font-financial text-[2.5rem] font-medium leading-none tracking-[-0.06em]">{formatMoney(total)}</h2><p className="mt-2 text-xs text-muted-foreground">{periodChange === null ? "Previous period unavailable" : `${Math.abs(periodChange)}% ${periodChange >= 0 ? "more" : "less"} than 1–24 Oct`}</p></div><div className="text-right"><p className="font-financial text-sm text-primary">{budgetPercent}% used</p><p className="mt-1 text-xs text-muted-foreground">NZD · November</p></div></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Monthly limit</span><span className="font-financial">{remaining >= 0 ? `${formatMoney(remaining, "NZD", 0)} left` : `${formatMoney(Math.abs(remaining), "NZD", 0)} over`}</span></div><Progress value={Math.min(100, budgetPercent)} aria-label={`${budgetPercent} percent of monthly budget used`} className="h-1.5 bg-muted" /></div></section>
    <section className="mb-5" aria-labelledby="recent-trend"><SectionHeading id="recent-trend" title="Spending" value={formatMoney(sumExpenses(month.filter((item) => item.date >= "2026-11-18")), "NZD", 0)} /><SpendingBars data={week} height={112} onDay={(date) => onActivity({ date })} /><p className="mt-2 text-xs text-muted-foreground">18–24 Nov · select a day to inspect</p></section>
    <Separator className="mb-5" />
    <section className="mb-5" aria-labelledby="upcoming"><SectionHeading id="upcoming" title="Coming up" value={`${recurring.filter((item) => item.state !== "Confirmed").length} remaining`} /><div className="flex flex-col gap-2">{recurring.map((item) => <RecurringRow key={item.id} item={item} onConfirm={onConfirm} />)}</div></section>
    <Separator className="mb-5" />
    <section aria-labelledby="recent-activity"><SectionHeading id="recent-activity" title="Recent activity" action={<Button variant="ghost" size="sm" onClick={() => onActivity()}>View all</Button>} /><TransactionList expenses={expenses.slice(0, 5)} onEdit={onEdit} /></section>
  </div>;
}

function RecurringRow({ item, onConfirm }: { item: RecurringSuggestion; onConfirm: (id: string) => void }) {
  const confirmed = item.state === "Confirmed";
  return <div className="flex min-h-14 items-center gap-3 rounded-lg bg-muted px-3 py-2"><span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${categoryMeta[item.category].soft}`}><CategoryIcon category={item.category} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.description}</p><p className="text-xs text-muted-foreground"><span className={item.state === "Due" ? "font-medium text-foreground" : undefined}>{item.state}</span> · {formatDate(item.dueDate)} · {formatMoney(item.amountMinor)}</p></div><Button size="sm" variant={confirmed ? "ghost" : "outline"} disabled={confirmed} onClick={() => { onConfirm(item.id); toast.success(`${item.description} confirmed`); }}>{confirmed ? "Confirmed" : "Confirm"}</Button></div>;
}

function Activity({ expenses, onEdit }: { expenses: Expense[]; onEdit: (expense: Expense) => void }) {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const stored = { date: params.get("date") ?? undefined, category: params.get("category") ?? undefined };
  const [query, setQuery] = useState(""); const [period, setPeriod] = useState(stored.date ? "all" : "month"); const [category, setCategory] = useState(stored.category ?? "All"); const [member, setMember] = useState("All"); const [frequency, setFrequency] = useState("All"); const [expectation, setExpectation] = useState("All"); const [tag, setTag] = useState("All"); const [more, setMore] = useState(false);
  const filtered = useMemo(() => expenses.filter((item) => (!stored.date || item.date === stored.date) && (period === "all" || item.date >= "2026-11-01") && item.description.toLowerCase().includes(query.toLowerCase()) && (category === "All" || item.category === category) && (member === "All" || item.creator === member) && (frequency === "All" || item.frequency === frequency) && (expectation === "All" || item.expectation === expectation) && (tag === "All" || item.tags.includes(tag as ExpenseTag))), [expenses, stored.date, period, query, category, member, frequency, expectation, tag]);
  const grouped = groupByDate(filtered);
  return <div><PageTitle title="Activity" subtitle={`${filtered.length} transactions · ${formatMoney(sumExpenses(filtered))}`} />
    <Field className="mb-3"><FieldLabel htmlFor="expense-search" className="sr-only">Search expenses</FieldLabel><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input id="expense-search" name="expense-search" autoComplete="off" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transactions…" className="h-11 pl-10" /></div></Field>
    <div className="mb-3 grid grid-cols-2 gap-2"><FilterSelect label="Period" value={period} onChange={setPeriod} options={["month", "all"]} labels={{ month: "This month", all: "All dates" }} /><FilterSelect label="Category" value={category} onChange={setCategory} options={["All", ...categories]} /></div>
    <Button variant="ghost" size="sm" className="mb-3" onClick={() => setMore((value) => !value)}><ListFilter data-icon="inline-start" />{more ? "Fewer filters" : "More filters"}</Button>
    {more ? <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><FilterSelect label="Member" value={member} onChange={setMember} options={["All", "Alex", "Jordan"]} /><FilterSelect label="Frequency" value={frequency} onChange={setFrequency} options={["All", "Recurring", "One-off", "Pending review"]} /><FilterSelect label="Expectation" value={expectation} onChange={setExpectation} options={["All", "Expected", "Unexpected", "Pending review"]} /><FilterSelect label="Tag" value={tag} onChange={setTag} options={["All", ...availableTags]} /></div> : null}
    {filtered.length ? <div>{Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([date, items]) => <section key={date} aria-labelledby={`date-${date}`} className="mb-4"><div className="mb-1 flex items-center justify-between"><h2 id={`date-${date}`} className="text-sm font-semibold">{formatDate(date, { weekday: "long", day: "numeric", month: "short" })}</h2><p className="text-xs font-medium tabular-nums text-muted-foreground">{formatMoney(sumExpenses(items))}</p></div><TransactionList expenses={items} onEdit={onEdit} /></section>)}</div> : <Empty><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>No matching transactions</EmptyTitle><EmptyDescription>Change or clear a filter to see more expenses.</EmptyDescription></EmptyHeader></Empty>}
  </div>;
}

function TransactionList({ expenses, onEdit }: { expenses: Expense[]; onEdit: (expense: Expense) => void }) {
  return <div className="flex flex-col">{expenses.map((item, index) => <div key={item.id}>{index ? <Separator /> : null}<button type="button" onClick={() => onEdit(item)} className="flex min-h-15 w-full items-center gap-3 rounded-md py-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${categoryMeta[item.category].soft}`}><CategoryIcon category={item.category} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.description}</span><span className="block truncate text-xs text-muted-foreground">{item.creator} recorded · {formatDate(item.date)}{item.currency !== "NZD" ? ` · ${formatMoney(item.amountMinor, item.currency)}` : ""}</span></span><span className="shrink-0 text-sm font-semibold tabular-nums">{formatMoney(item.groupAmountMinor)}</span></button></div>)}</div>;
}

function Insights({ expenses, onActivity }: { expenses: Expense[]; onActivity: (filter?: { category?: Expense["category"] }) => void }) {
  const [period, setPeriod] = useState<InsightPeriod>("month"); const [offset, setOffset] = useState(0); const [analysis, setAnalysis] = useState<"idle" | "loading" | "complete" | "error">("idle");
  const range = periodRange(period, offset); const selected = expenses.filter((item) => inRange(item, range.start, range.end)); const total = sumExpenses(selected); const days = dailyTotals(selected, range.start, range.end); const trend = period === "month" ? weeklyTotals(selected, range.start, range.end) : days; const categoriesData = categoryTotals(selected); const previousRange = periodRange(period, offset - 1); const previous = expenses.filter((item) => inRange(item, previousRange.start, previousRange.end)); const comparable = period === "week" || range.complete; const change = comparable && sumExpenses(previous) ? Math.round((total - sumExpenses(previous)) / sumExpenses(previous) * 100) : null;
  return <div><PageTitle title="Insights" /><div className="mb-4 flex items-center justify-between gap-2"><Button variant="outline" size="icon" aria-label="Previous period" onClick={() => setOffset((value) => value - 1)}><ChevronLeft /></Button><div className="text-center"><Tabs value={period} onValueChange={(value) => { setPeriod(value as InsightPeriod); setOffset(0); }}><TabsList><TabsTrigger value="week">Week</TabsTrigger><TabsTrigger value="month">Month</TabsTrigger></TabsList></Tabs><p className="mt-1 text-xs text-muted-foreground">{range.label}</p></div><Button variant="outline" size="icon" aria-label="Next period" disabled={offset >= 0} onClick={() => setOffset((value) => value + 1)}><ChevronRight /></Button></div>
    <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y py-4 sm:grid-cols-5"><Metric label="Total" value={formatMoney(total, "NZD", 0)} /><Metric label="Daily average" value={formatMoney(total / Math.max(1, days.length), "NZD", 0)} /><Metric label="Transactions" value={`${selected.length}`} /><Metric label="Budget left" value={formatMoney(MONTHLY_BUDGET_MINOR - total, "NZD", 0)} /><Metric label="Previous period" value={change === null ? "Not comparable" : `${change > 0 ? "+" : ""}${change}%`} /></div>
    <InsightSection title="Spending trend" description={period === "month" ? "Weekly totals for the selected month" : "Daily totals for the selected week"}><SpendingBars data={trend} height={168} /></InsightSection>
    <InsightSection title="By category" description="Tap a bar to see matching transactions"><CategoryBars data={categoriesData} onCategory={(category) => onActivity({ category })} /><div className="mt-2 flex flex-col gap-2">{categoriesData.map((item) => <div key={item.category} className="flex items-center gap-2 text-xs"><CategoryIcon category={item.category} /><span className="flex-1">{item.category}</span><span>{item.percentage}%</span><span className="w-20 text-right font-medium tabular-nums">{formatMoney(item.amountMinor)}</span></div>)}</div></InsightSection>
    <div className="grid gap-5 lg:grid-cols-2"><SegmentedBreakdown title="Frequency" data={dimensionTotals(selected, "frequency")} total={total} /><SegmentedBreakdown title="Expectation" data={dimensionTotals(selected, "expectation")} total={total} /></div>
    <Separator className="my-5" /><section aria-labelledby="members"><SectionHeading id="members" title="Recorded by" /><div className="grid grid-cols-2 gap-3"><Metric label="Alex" value={formatMoney(sumExpenses(selected.filter((item) => item.creator === "Alex")), "NZD", 0)} /><Metric label="Jordan" value={formatMoney(sumExpenses(selected.filter((item) => item.creator === "Jordan")), "NZD", 0)} /></div><p className="mt-2 text-xs text-muted-foreground">This shows who recorded each expense, not who paid it.</p></section>
    <Separator className="my-5" /><AnalysisPanel state={analysis} onChange={setAnalysis} period={period} />
  </div>;
}

function SegmentedBreakdown({ title, data, total }: { title: string; data: Array<{ label: string; amountMinor: number; percentage: number }>; total: number }) {
  const colors = ["bg-primary", "bg-accent", "bg-muted-foreground"];
  return <section aria-labelledby={`segment-${title}`}><SectionHeading id={`segment-${title}`} title={title} value={`of ${formatMoney(total, "NZD", 0)}`} /><div className="mb-3 flex h-3 overflow-hidden rounded-full bg-muted">{data.map((item, index) => <span key={item.label} className={colors[index]} style={{ width: `${item.percentage}%` }} title={`${item.label} ${Math.round(item.percentage)}%`} />)}</div><div className="flex flex-col gap-2">{data.map((item, index) => <div key={item.label} className="flex items-center gap-2 text-xs"><span className={`size-2 rounded-full ${colors[index]}`} /><span className="flex-1">{item.label}</span><span>{Math.round(item.percentage)}%</span><span className="w-20 text-right font-medium tabular-nums">{formatMoney(item.amountMinor)}</span></div>)}</div></section>;
}

function AnalysisPanel({ state, onChange, period }: { state: "idle" | "loading" | "complete" | "error"; onChange: (state: "idle" | "loading" | "complete" | "error") => void; period: InsightPeriod }) {
  if (state === "idle") return <section aria-labelledby="analysis"><SectionHeading id="analysis" title="Spending analysis" /><p className="mb-3 text-sm text-muted-foreground">Get a simulated summary and practical ideas for this {period}.</p><Button onClick={() => { onChange("loading"); window.setTimeout(() => onChange("complete"), 500); }}><Bot data-icon="inline-start" />Analyse this {period}</Button><Button variant="ghost" size="sm" onClick={() => onChange("error")}>Preview unavailable state</Button></section>;
  if (state === "loading") return <Alert><Clock3 /><AlertTitle>Preparing your analysis…</AlertTitle><AlertDescription>Reviewing this period’s mock spending patterns.</AlertDescription></Alert>;
  if (state === "error") return <Alert variant="destructive"><AlertTitle>Analysis is unavailable</AlertTitle><AlertDescription>Expense recording and charts still work. Try again when you’re ready.</AlertDescription><Button className="mt-3" variant="outline" onClick={() => onChange("idle")}>Try again</Button></Alert>;
  return <Alert><Bot /><AlertTitle>Simulated analysis</AlertTitle><AlertDescription className="flex flex-col gap-2"><p><strong>Summary:</strong> Housing and transport make up most recorded spending in this period.</p><p><strong>Pattern:</strong> One unexpected car repair increased transport costs.</p><p><strong>Idea:</strong> Consider a small monthly car-maintenance buffer before changing everyday spending.</p><p className="text-xs">Example only. No data was sent to an AI provider.</p><Button className="mt-1 w-fit" variant="outline" size="sm" onClick={() => onChange("idle")}>Dismiss</Button></AlertDescription></Alert>;
}

function SettingsIndex() {
  const [detail, setDetail] = useState<string | null>(null);
  const groups = [
    { title: "Account", rows: [["Profile", UserRound], ["Account preferences", SlidersHorizontal]] },
    { title: "Household", rows: [["Group preferences", FolderCog], ["Members & invitations", Users], ["Monthly budget", Target], ["Categories", Tags], ["Recurring rules", CalendarDays]] },
    { title: "Intelligence", rows: [["AI provider & model", Bot], ["Notifications", BellRing]] },
    { title: "Application", rows: [["Currency & timezone", CircleDollarSign], ["Privacy & data", Database], ["About annoying.", Info]] },
  ] as const;
  return <div><PageTitle title="Settings" />{groups.map((group) => <section key={group.title} className="mb-5" aria-labelledby={`settings-${group.title}`}><h2 id={`settings-${group.title}`} className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</h2><div className="rounded-xl border bg-card px-3">{group.rows.map(([label, Icon], index) => <div key={label}>{index ? <Separator /> : null}<button type="button" className="flex min-h-13 w-full items-center gap-3 text-left outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setDetail(label)}><Icon className="size-4 text-muted-foreground" aria-hidden="true" /><span className="flex-1 text-sm font-medium">{label}</span><ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" /></button></div>)}</div></section>)}<SettingsDrawer detail={detail} onOpenChange={(open) => !open && setDetail(null)} /></div>;
}

function SettingsDrawer({ detail, onOpenChange }: { detail: string | null; onOpenChange: (open: boolean) => void }) {
  return <Drawer open={Boolean(detail)} onOpenChange={onOpenChange}><DrawerContent className="max-h-[86dvh]"><DrawerHeader className="text-left"><DrawerTitle>{detail}</DrawerTitle><DrawerDescription>{detail === "AI provider & model" ? "Simulated group-level setup. No credential is stored." : "Prototype settings for Demo Household."}</DrawerDescription></DrawerHeader><div className="overflow-y-auto px-4 pb-4"><SettingsDetail detail={detail} /></div><DrawerFooter><Button onClick={() => { toast.success(`${detail} updated`); onOpenChange(false); }}>Save changes</Button><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer>;
}

function SettingsDetail({ detail }: { detail: string | null }) {
  if (detail === "Group preferences") return <FieldGroup><Field><FieldLabel htmlFor="group-name">Group name</FieldLabel><Input id="group-name" defaultValue="Demo Household" /></Field></FieldGroup>;
  if (detail === "Members & invitations") return <div className="flex flex-col gap-3"><SettingsMember name="Alex" role="Owner" /><SettingsMember name="Jordan" role="Member" /><Button variant="outline" onClick={() => toast.info("Invitation link created", { description: "Single use · expires in 7 days" })}>Create invitation</Button></div>;
  if (detail === "Monthly budget") return <Field><FieldLabel htmlFor="budget">Monthly budget</FieldLabel><Input id="budget" inputMode="decimal" defaultValue="3800" /><FieldDescription>NZD per calendar month</FieldDescription></Field>;
  if (detail === "AI provider & model") return <FieldGroup><Field><FieldLabel>Provider</FieldLabel><FilterSelect label="Provider" value="OpenAI" onChange={() => undefined} options={["OpenAI", "Anthropic", "xAI"]} /></Field><Field><FieldLabel htmlFor="ai-model">Model</FieldLabel><Input id="ai-model" defaultValue="gpt-5-mini" /></Field><Alert><AlertTitle>Prototype only</AlertTitle><AlertDescription>Real credentials are not accepted in this milestone.</AlertDescription></Alert></FieldGroup>;
  if (detail === "Currency & timezone") return <FieldGroup><Field><FieldLabel>Group currency</FieldLabel><FilterSelect label="Currency" value="NZD" onChange={() => undefined} options={["NZD", "AUD", "USD"]} /></Field><Field><FieldLabel>Group timezone</FieldLabel><FilterSelect label="Timezone" value="Pacific/Auckland" onChange={() => undefined} options={["Pacific/Auckland", "Australia/Sydney"]} /></Field></FieldGroup>;
  return <Alert><AlertTitle>Coming in a later prototype</AlertTitle><AlertDescription>This destination is represented in the settings structure but is not editable yet.</AlertDescription></Alert>;
}

function SettingsMember({ name, role }: { name: string; role: string }) { return <div className="flex items-center gap-3 rounded-lg bg-muted p-3"><span className="flex size-9 items-center justify-center rounded-full bg-background text-sm font-semibold">{name[0]}</span><div className="flex-1"><p className="text-sm font-medium">{name}</p><p className="text-xs text-muted-foreground">{role}</p></div></div>; }

function EditExpenseDrawer({ expense, onOpenChange, onSave }: { expense: Expense | null; onOpenChange: (open: boolean) => void; onSave: (expense: Expense) => void }) {
  const [draft, setDraft] = useState<Expense | null>(null); const active = expense && draft?.id === expense.id ? draft : expense;
  return <Drawer open={Boolean(expense)} onOpenChange={onOpenChange}><DrawerContent><DrawerHeader className="text-left"><DrawerTitle>Expense details</DrawerTitle><DrawerDescription>Recorded by {active?.creator}. Changes update every mock view.</DrawerDescription></DrawerHeader>{active ? <div className="overflow-y-auto overscroll-contain px-4"><FieldGroup><Field><FieldLabel htmlFor="edit-description">Description</FieldLabel><Input id="edit-description" name="edit-description" autoComplete="off" value={active.description} onChange={(event) => setDraft({ ...active, description: event.target.value })} /></Field><Field><FieldLabel htmlFor="edit-amount">Amount</FieldLabel><Input id="edit-amount" name="edit-amount" autoComplete="off" inputMode="decimal" value={(active.amountMinor / 100).toFixed(2)} onChange={(event) => { const minor = parseMoneyToMinor(event.target.value); setDraft({ ...active, amountMinor: minor, groupAmountMinor: convertToGroupMinor(minor, active.currency) }); }} /></Field><Field><FieldLabel>Category</FieldLabel><FilterSelect label="Category" value={active.category} onChange={(value) => setDraft({ ...active, category: value as Expense["category"] })} options={categories} /></Field>{active.tags.length ? <p className="text-xs text-muted-foreground">Tags: {active.tags.join(" · ")}</p> : null}</FieldGroup></div> : null}<DrawerFooter><Button onClick={() => active && onSave(active)}>Save changes</Button><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer>;
}

function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) { return <div className="mb-5 flex items-end justify-between gap-3"><div><h1 className="font-display text-2xl font-semibold tracking-[-0.035em] text-balance">{title}</h1>{subtitle ? <p className="mt-1 font-financial text-xs text-muted-foreground">{subtitle}</p> : null}</div>{action}</div>; }
function SectionHeading({ id, title, value, action }: { id?: string; title: string; value?: string; action?: React.ReactNode }) { return <div className="mb-2 flex min-h-9 items-center justify-between gap-3"><h2 id={id} className="font-semibold">{title}</h2>{action ?? (value ? <span className="text-sm font-medium tabular-nums text-muted-foreground">{value}</span> : null)}</div>; }
function InsightSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) { return <section className="mb-5 border-b pb-5"><SectionHeading title={title} /><p className="mb-2 text-xs text-muted-foreground">{description}</p>{children}</section>; }
function Metric({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-financial text-lg font-medium">{value}</p></div>; }

function FilterSelect({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; labels?: Record<string, string> }) { return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="h-11 w-full min-w-0"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>{label}</SelectLabel>{options.map((option) => <SelectItem key={option} value={option}>{labels?.[option] ?? option}</SelectItem>)}</SelectGroup></SelectContent></Select>; }

function MobileNav({ screen, captureHref }: { screen: Screen; captureHref: string }) { return <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"><div className="mx-auto grid h-[4.75rem] max-w-lg grid-cols-5 items-center px-2">{navItems.slice(0, 2).map((item) => <NavButton key={item.id} item={item} active={screen === item.id} />)}<div className="flex justify-center"><Button size="icon" asChild className="size-14 -translate-y-3 rounded-xl"><Link href={captureHref} aria-label="Capture expense"><Plus /></Link></Button></div>{navItems.slice(2).map((item) => <NavButton key={item.id} item={item} active={screen === item.id} />)}</div></nav>; }
function NavButton({ item, active }: { item: typeof navItems[number]; active: boolean }) { const Icon = item.icon; return <Link href={screenPath[item.id]} aria-current={active ? "page" : undefined} className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:font-medium data-[active=true]:text-primary" data-active={active}><Icon className="size-5" aria-hidden="true" /><span>{item.label}</span></Link>; }
function DesktopRail({ screen, captureHref }: { screen: Screen; captureHref: string }) { return <aside className="fixed inset-y-0 left-0 z-40 hidden w-24 flex-col items-center border-r bg-card py-5 md:flex"><div className="font-display mb-8 flex size-11 items-center justify-center rounded-lg border bg-background text-lg font-semibold text-primary">a.</div><nav className="flex w-full flex-1 flex-col items-center gap-2" aria-label="Primary navigation">{navItems.map((item) => <NavButton key={item.id} item={item} active={screen === item.id} />)}</nav><Button size="icon" asChild className="size-12 rounded-xl"><Link href={captureHref} aria-label="Capture expense"><Plus /></Link></Button></aside>; }
