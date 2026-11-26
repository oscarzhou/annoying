"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Home, Lightbulb, Plus, ReceiptText, Settings } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ActivityScreen } from "@/features/activity/activity-screen";
import { CaptureScreen } from "@/features/capture/capture-screen";
import { InsightsScreen } from "@/features/insights/insights-screen";
import { SettingsScreen } from "@/features/settings/settings-screen";
import { CategoryIcon, categoryMeta } from "./category-meta";
import { SpendingBars } from "./charts";
import { MONTHLY_BUDGET_MINOR, REFERENCE_DATE, convertToGroupMinor, dailyTotals, formatDate, formatMoney, inRange, parseMoneyToMinor, sumExpenses } from "./finance";
import { initialExpenses, initialRecurring } from "./mock-data";
import { categories } from "./screen-options";
import { PageTitle, SectionHeading, TransactionList, FilterSelect } from "./shared-ui";
import type { Expense, RecurringSuggestion, Screen } from "./types";

const navItems: Array<{ id: Screen; label: string; icon: typeof Home }> = [
  { id: "dashboard", label: "Home", icon: Home }, { id: "activity", label: "Activity", icon: ReceiptText },
  { id: "insights", label: "Insights", icon: Lightbulb }, { id: "settings", label: "Settings", icon: Settings },
];
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
      {screen === "activity" ? <ActivityScreen expenses={expenses} onEdit={setEditing} /> : null}
      {screen === "insights" ? <InsightsScreen expenses={expenses} onActivity={navigateToActivity} /> : null}
      {screen === "settings" ? <SettingsScreen /> : null}
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

function EditExpenseDrawer({ expense, onOpenChange, onSave }: { expense: Expense | null; onOpenChange: (open: boolean) => void; onSave: (expense: Expense) => void }) {
  const [draft, setDraft] = useState<Expense | null>(null); const active = expense && draft?.id === expense.id ? draft : expense;
  return <Drawer open={Boolean(expense)} onOpenChange={onOpenChange}><DrawerContent><DrawerHeader className="text-left"><DrawerTitle>Expense details</DrawerTitle><DrawerDescription>Recorded by {active?.creator}. Changes update every mock view.</DrawerDescription></DrawerHeader>{active ? <div className="overflow-y-auto overscroll-contain px-4"><FieldGroup><Field><FieldLabel htmlFor="edit-description">Description</FieldLabel><Input id="edit-description" name="edit-description" autoComplete="off" value={active.description} onChange={(event) => setDraft({ ...active, description: event.target.value })} /></Field><Field><FieldLabel htmlFor="edit-amount">Amount</FieldLabel><Input id="edit-amount" name="edit-amount" autoComplete="off" inputMode="decimal" value={(active.amountMinor / 100).toFixed(2)} onChange={(event) => { const minor = parseMoneyToMinor(event.target.value); setDraft({ ...active, amountMinor: minor, groupAmountMinor: convertToGroupMinor(minor, active.currency) }); }} /></Field><Field><FieldLabel>Category</FieldLabel><FilterSelect label="Category" value={active.category} onChange={(value) => setDraft({ ...active, category: value as Expense["category"] })} options={categories} /></Field>{active.tags.length ? <p className="text-xs text-muted-foreground">Tags: {active.tags.join(" · ")}</p> : null}</FieldGroup></div> : null}<DrawerFooter><Button onClick={() => active && onSave(active)}>Save changes</Button><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer>;
}

function MobileNav({ screen, captureHref }: { screen: Screen; captureHref: string }) { return <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"><div className="mx-auto grid h-[4.75rem] max-w-lg grid-cols-5 items-center px-2">{navItems.slice(0, 2).map((item) => <NavButton key={item.id} item={item} active={screen === item.id} />)}<div className="flex justify-center"><Button size="icon" asChild className="size-14 -translate-y-3 rounded-xl"><Link href={captureHref} aria-label="Capture expense"><Plus /></Link></Button></div>{navItems.slice(2).map((item) => <NavButton key={item.id} item={item} active={screen === item.id} />)}</div></nav>; }
function NavButton({ item, active }: { item: typeof navItems[number]; active: boolean }) { const Icon = item.icon; return <Link href={screenPath[item.id]} aria-current={active ? "page" : undefined} className="flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:font-medium data-[active=true]:text-primary" data-active={active}><Icon className="size-5" aria-hidden="true" /><span>{item.label}</span></Link>; }
function DesktopRail({ screen, captureHref }: { screen: Screen; captureHref: string }) { return <aside className="fixed inset-y-0 left-0 z-40 hidden w-24 flex-col items-center border-r bg-card py-5 md:flex"><div className="font-display mb-8 flex size-11 items-center justify-center rounded-lg border bg-background text-lg font-semibold text-primary">a.</div><nav className="flex w-full flex-1 flex-col items-center gap-2" aria-label="Primary navigation">{navItems.map((item) => <NavButton key={item.id} item={item} active={screen === item.id} />)}</nav><Button size="icon" asChild className="size-12 rounded-xl"><Link href={captureHref} aria-label="Capture expense"><Plus /></Link></Button></aside>; }
