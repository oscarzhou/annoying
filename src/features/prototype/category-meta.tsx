import { BookOpen, Car, CircleHelp, Clapperboard, Gift, GraduationCap, HeartPulse, House, Luggage, Receipt, ShieldCheck, ShoppingBag, ShoppingBasket, Soup, Sparkles, UtilityPole } from "lucide-react";
import type { Expense } from "./types";

export const categoryMeta: Record<Expense["category"], { icon: typeof House; color: string; soft: string }> = {
  Housing: { icon: House, color: "var(--chart-2)", soft: "bg-chart-2/10 text-chart-2" },
  Groceries: { icon: ShoppingBasket, color: "var(--chart-8)", soft: "bg-chart-8/10 text-chart-8" },
  Transport: { icon: Car, color: "var(--chart-3)", soft: "bg-chart-3/10 text-chart-3" },
  Dining: { icon: Soup, color: "var(--chart-4)", soft: "bg-chart-4/10 text-chart-4" },
  Utilities: { icon: UtilityPole, color: "var(--chart-5)", soft: "bg-chart-5/10 text-chart-5" },
  Health: { icon: HeartPulse, color: "var(--chart-6)", soft: "bg-chart-6/10 text-chart-6" },
  Shopping: { icon: ShoppingBag, color: "var(--chart-5)", soft: "bg-chart-5/10 text-chart-5" },
  Entertainment: { icon: Clapperboard, color: "var(--chart-4)", soft: "bg-chart-4/10 text-chart-4" },
  Subscriptions: { icon: Receipt, color: "var(--chart-3)", soft: "bg-chart-3/10 text-chart-3" },
  Travel: { icon: Luggage, color: "var(--chart-2)", soft: "bg-chart-2/10 text-chart-2" },
  Education: { icon: GraduationCap, color: "var(--chart-8)", soft: "bg-chart-8/10 text-chart-8" },
  Insurance: { icon: ShieldCheck, color: "var(--chart-7)", soft: "bg-chart-7/10 text-chart-7" },
  Gifts: { icon: Gift, color: "var(--chart-6)", soft: "bg-chart-6/10 text-chart-6" },
  Household: { icon: Sparkles, color: "var(--chart-2)", soft: "bg-chart-2/10 text-chart-2" },
  Other: { icon: BookOpen, color: "var(--chart-7)", soft: "bg-chart-7/10 text-chart-7" },
  Unclassified: { icon: CircleHelp, color: "var(--muted-foreground)", soft: "bg-muted text-muted-foreground" },
};

export function CategoryIcon({ category, className = "size-4" }: { category: Expense["category"]; className?: string }) { const Icon = categoryMeta[category].icon; return <Icon className={className} aria-hidden="true" />; }
