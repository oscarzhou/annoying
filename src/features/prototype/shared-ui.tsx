import { Search } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CategoryIcon, categoryMeta } from "./category-meta";
import { formatDate, formatMoney } from "./finance";
import type { Expense } from "./types";

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="mb-5 flex items-end justify-between gap-3"><div className="min-w-0"><h1 className="text-balance font-display text-2xl font-semibold tracking-[-0.035em]">{title}</h1>{subtitle ? <p className="mt-1 font-financial text-xs text-muted-foreground">{subtitle}</p> : null}</div>{action}</div>;
}

export function SectionHeading({ id, title, value, action }: { id?: string; title: string; value?: string; action?: React.ReactNode }) {
  return <div className="mb-2 flex min-h-9 items-center justify-between gap-3"><h2 id={id} className="font-semibold">{title}</h2>{action ?? (value ? <span className="text-sm font-medium tabular-nums text-muted-foreground">{value}</span> : null)}</div>;
}

export function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate font-financial text-lg font-medium">{value}</p>{hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}</div>;
}

export function FilterSelect({ label, value, onChange, options, labels }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; labels?: Record<string, string> }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="h-11 w-full min-w-0"><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>{label}</SelectLabel>{options.map((option) => <SelectItem key={option} value={option}>{labels?.[option] ?? option}</SelectItem>)}</SelectGroup></SelectContent></Select>;
}

export function TransactionList({ expenses, onEdit }: { expenses: Expense[]; onEdit: (expense: Expense) => void }) {
  if (!expenses.length) return <Empty><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>No transactions</EmptyTitle><EmptyDescription>Recorded expenses will appear here.</EmptyDescription></EmptyHeader></Empty>;
  return <div className="flex flex-col">{expenses.map((item, index) => <div key={item.id}>{index ? <Separator /> : null}<button type="button" onClick={() => onEdit(item)} className="flex min-h-15 w-full items-center gap-3 rounded-md py-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${categoryMeta[item.category].soft}`}><CategoryIcon category={item.category} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.description}</span><span className="block truncate text-xs text-muted-foreground">{item.creator} recorded · {formatDate(item.date)}{item.currency !== "NZD" ? ` · ${formatMoney(item.amountMinor, item.currency)}` : ""}</span>{item.tags.length ? <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{item.category} · {item.tags.join(" · ")}</span> : null}</span><span className="shrink-0 font-financial text-sm font-semibold">{formatMoney(item.groupAmountMinor)}</span></button></div>)}</div>;
}
