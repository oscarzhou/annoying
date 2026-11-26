"use client";

import { useState } from "react";
import { BellRing, Bot, CalendarDays, ChevronRight, CircleDollarSign, Database, FolderCog, Info, SlidersHorizontal, Tags, Target, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FilterSelect, PageTitle } from "@/features/prototype/shared-ui";

const settingsGroups = [
  { title: "Account", rows: [{ label: "Profile", icon: UserRound, status: "Planned" }, { label: "Account preferences", icon: SlidersHorizontal, status: "Planned" }] },
  { title: "Household", rows: [{ label: "Household preferences", icon: FolderCog, status: "Prototype" }, { label: "Members & invitations", icon: Users, status: "Prototype" }, { label: "Monthly budget", icon: Target, status: "Prototype" }, { label: "Categories & tags", icon: Tags, status: "Preview" }, { label: "Recurring expenses", icon: CalendarDays, status: "Preview" }] },
  { title: "Intelligence", rows: [{ label: "AI provider & model", icon: Bot, status: "Not connected" }, { label: "Notifications", icon: BellRing, status: "Preview" }] },
  { title: "Application", rows: [{ label: "Currency & timezone", icon: CircleDollarSign, status: "Prototype" }, { label: "Privacy & data", icon: Database, status: "Planned" }, { label: "About annoying.", icon: Info, status: "Prototype" }] },
] as const;

export function SettingsScreen() {
  const [detail, setDetail] = useState<string | null>(null);
  return <div><PageTitle title="Settings" subtitle="Demo Household · prototype configuration" />{settingsGroups.map((group) => <section key={group.title} className="mb-6" aria-labelledby={`settings-${group.title}`}><h2 id={`settings-${group.title}`} className="mb-1 px-1 text-xs font-semibold text-muted-foreground">{group.title}</h2><div className="rounded-xl border bg-card px-3">{group.rows.map(({ label, icon: Icon, status }, index) => <div key={label}>{index ? <Separator /> : null}<button type="button" className="flex min-h-14 w-full items-center gap-3 rounded-md text-left outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setDetail(label)}><Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span><Badge variant="outline" className="hidden sm:inline-flex">{status}</Badge><ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></button></div>)}</div></section>)}<SettingsDrawer detail={detail} onOpenChange={(open) => !open && setDetail(null)} /></div>;
}

function SettingsDrawer({ detail, onOpenChange }: { detail: string | null; onOpenChange: (open: boolean) => void }) {
  const editable = ["Household preferences", "Members & invitations", "Monthly budget", "AI provider & model", "Currency & timezone"].includes(detail ?? "");
  return <Drawer open={Boolean(detail)} onOpenChange={onOpenChange}><DrawerContent className="max-h-[86dvh] overscroll-contain"><DrawerHeader className="text-left"><DrawerTitle>{detail}</DrawerTitle><DrawerDescription>{detail === "AI provider & model" ? "No provider or credential is connected in this prototype." : "Configuration preview for Demo Household."}</DrawerDescription></DrawerHeader><div className="overflow-y-auto overscroll-contain px-4 pb-4"><SettingsDetail detail={detail} /></div><DrawerFooter>{editable ? <Button onClick={() => { toast.success(`${detail} updated in this prototype`); onOpenChange(false); }}>Save changes</Button> : null}<DrawerClose asChild><Button variant="outline">{editable ? "Cancel" : "Close"}</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer>;
}

function SettingsDetail({ detail }: { detail: string | null }) {
  if (detail === "Household preferences") return <FieldGroup><Field><FieldLabel htmlFor="group-name">Household name</FieldLabel><Input id="group-name" name="group-name" autoComplete="off" defaultValue="Demo Household" /></Field></FieldGroup>;
  if (detail === "Members & invitations") return <div className="flex flex-col gap-3"><SettingsMember name="Alex" role="Owner" /><SettingsMember name="Jordan" role="Member" /><Button variant="outline" onClick={() => toast.info("Mock invitation created", { description: "Single use · expires in 7 days · not persisted" })}>Create mock invitation</Button><p className="text-xs text-muted-foreground">Authentication and real invitations begin in M3.</p></div>;
  if (detail === "Monthly budget") return <Field><FieldLabel htmlFor="budget">Monthly budget</FieldLabel><Input id="budget" name="budget" autoComplete="off" inputMode="decimal" defaultValue="3800" /><FieldDescription>NZD per calendar month · session-only prototype</FieldDescription></Field>;
  if (detail === "AI provider & model") return <FieldGroup><Field><FieldLabel>Provider</FieldLabel><FilterSelect label="Provider" value="OpenAI" onChange={() => undefined} options={["OpenAI", "Anthropic", "xAI"]} /></Field><Field><FieldLabel htmlFor="ai-model">Model</FieldLabel><Input id="ai-model" name="ai-model" autoComplete="off" defaultValue="gpt-5-mini" /></Field><Alert><AlertTitle>Not connected</AlertTitle><AlertDescription>Real credentials are not accepted in this milestone. Analysis remains explicitly simulated.</AlertDescription></Alert></FieldGroup>;
  if (detail === "Currency & timezone") return <FieldGroup><Field><FieldLabel>Group currency</FieldLabel><FilterSelect label="Currency" value="NZD" onChange={() => undefined} options={["NZD", "AUD", "USD"]} /></Field><Field><FieldLabel>Group timezone</FieldLabel><FilterSelect label="Timezone" value="Pacific/Auckland" onChange={() => undefined} options={["Pacific/Auckland", "Australia/Sydney"]} /></Field></FieldGroup>;
  if (detail === "Categories & tags") return <PreviewList title="Not editable yet" items={["16 shared categories", "8 suggested tags", "Custom capture tags remain session-only"]} />;
  if (detail === "Recurring expenses") return <PreviewList title="Confirmation preview only" items={["Weekly rent · NZ$690", "Streaming service · NZ$19.99", "Persistent rules begin after the expense engine"]} />;
  if (detail === "Notifications") return <PreviewList title="In-app preview only" items={["Expense-added notifications", "Unread state and history planned", "No external delivery configured"]} />;
  if (detail === "About annoying.") return <Alert><AlertTitle>annoying. prototype</AlertTitle><AlertDescription>M2.5 Carbon interface. In-memory demo data only; no authentication, database, or live AI.</AlertDescription></Alert>;
  return <Alert><AlertTitle>Planned for M3 or later</AlertTitle><AlertDescription>This destination is included for information architecture review but is not implemented.</AlertDescription></Alert>;
}

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return <div><Badge variant="secondary">Preview</Badge><h3 className="mt-3 font-semibold">{title}</h3><ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function SettingsMember({ name, role }: { name: string; role: string }) {
  return <div className="flex items-center gap-3 rounded-lg bg-muted p-3"><span className="flex size-9 items-center justify-center rounded-full bg-background text-sm font-semibold">{name[0]}</span><div className="flex-1"><p className="text-sm font-medium">{name}</p><p className="text-xs text-muted-foreground">{role}</p></div></div>;
}
