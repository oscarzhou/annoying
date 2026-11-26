"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { categoryMeta } from "./category-meta";
import { formatMoney } from "./finance";
import type { Expense } from "./types";

const spendConfig = { amountMinor: { label: "Spending", color: "var(--chart-1)" } } satisfies ChartConfig;

export function SpendingBars({ data, height = 144, onDay }: { data: Array<{ date: string; label: string; amountMinor: number }>; height?: number; onDay?: (date: string) => void }) {
  return <ChartContainer config={spendConfig} initialDimension={{ width: 240, height }} className="min-w-0 max-w-full overflow-hidden" style={{ height }} aria-label="Spending by day"><BarChart data={data} margin={{ top: 8 }} accessibilityLayer onClick={(state) => { const label = state?.activeLabel as string | undefined; const date = data.find((item) => item.label === label)?.date; if (date && onDay) onDay(date); }}><CartesianGrid vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 10 }} /><YAxis hide /><ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent formatter={(value) => <span className="font-medium tabular-nums">{formatMoney(Number(value), "NZD", 0)}</span>} />} /><Bar dataKey="amountMinor" fill="var(--color-amountMinor)" radius={[5, 5, 0, 0]} isAnimationActive={false} className={onDay ? "cursor-pointer" : undefined} /></BarChart></ChartContainer>;
}

export function CategoryBars({ data, onCategory }: { data: Array<{ category: Expense["category"]; amountMinor: number; percentage: number }>; onCategory?: (category: Expense["category"]) => void }) {
  const height = Math.max(144, data.length * 34);
  return <ChartContainer config={spendConfig} initialDimension={{ width: 240, height }} className="min-w-0 max-w-full overflow-hidden" style={{ height }} aria-label="Spending by category"><BarChart data={data} layout="vertical" margin={{ left: 4, right: 8 }} accessibilityLayer onClick={(state) => { const label = state?.activeLabel as Expense["category"] | undefined; const category = data.find((item) => item.category === label)?.category; if (category && onCategory) onCategory(category); }}><CartesianGrid horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="category" type="category" tickLine={false} axisLine={false} width={76} tick={{ fontSize: 10 }} /><ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent formatter={(value) => <span className="font-medium tabular-nums">{formatMoney(Number(value), "NZD", 0)}</span>} />} /><Bar dataKey="amountMinor" radius={4} isAnimationActive={false} className={onCategory ? "cursor-pointer" : undefined}>{data.map((item) => <Cell key={item.category} fill={categoryMeta[item.category].color} />)}</Bar></BarChart></ChartContainer>;
}
