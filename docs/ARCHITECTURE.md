# Architecture — annoying.

Status: approved foundation; M2.5 interactive prototype implemented, persistence pending.

## Shape and stack

Build a modular monolith: one strict-TypeScript Next.js App Router application, one SQLite database, and one deployable container/service. Use Tailwind CSS, shadcn/ui, Recharts through shadcn Chart, Drizzle ORM, Playwright, and Vercel AI SDK behind provider adapters. Do not add microservices, Redis, a vector database, separate API tier, or global client store for MVP.

```text
Mobile-first browser
  -> Next.js Server Components + Server Actions/Route Handlers
  -> application services (identity/groups, expenses, recurring, notifications, insights)
  -> domain rules + provider ports
  -> Drizzle/SQLite on persistent storage
  -> optional outbound AI adapters (OpenAI, Anthropic, xAI)
```

AI is optional. Expense persistence completes independently. MVP in-app notification records are created in the same SQLite transaction as the expense. Do not add a worker, event bus, outbox processor, or external queue without a concrete external-delivery requirement.

## Boundaries

```text
src/app/                 routes, layouts, server entry points
src/components/ui/       shadcn-managed primitives
src/components/          shared product compositions
src/features/            auth, groups, expenses, recurring, notifications, insights
src/domain/              money, exchange, time, classifications; framework-free
src/db/                  schema, connection, migrations, seeds
src/providers/           AI and exchange-rate adapters
src/lib/                 config, crypto, small infrastructure adapters
tests/                   integration helpers and Playwright suites
```

The domain imports no Next.js, React, Drizzle, or AI SDK. UI never imports SQLite. Avoid broad barrel exports, generic repositories over one adapter, and provider-specific types outside adapters.

## Proposed data model

- `user`, `session`, plus selected auth support records.
- `expense_group`, `group_member`, `group_invitation` with roles and secure token lifecycle.
- `category` with stable group/default identity, label, icon/color keys, active state, and order.
- `expense_tag` plus an `expense_tag_assignment` join record. Tags are group-scoped, optional, and independent from category/frequency/expectation; suggested tags are not assignments until confirmed.
- `expense`: group/creator, original input, confirmed description, original amount/currency, converted group amount, exchange rate/date/source, expense date, optional time-period enum, exact timestamp only if supplied, and independent category/frequency/expectation.
- `recurring_rule` and `expense_suggestion`, separate from actual expenses, with due state, source, confirmation link, and dedupe key.
- `notification` with recipient/read state and history metadata.
- `group_budget` for monthly budget/savings target.
- `ai_configuration` (scope unresolved), encrypted credential envelope, provider/model; `ai_suggestion`/correction evidence and `ai_insight` with deterministic inputs and generated interpretation.

Use stable application IDs, foreign keys, unique/check constraints, and explicit group scope. Amounts use integer minor units; rates use an approved precise decimal/integer ratio and rounding rule. Calendar expense dates remain separate from UTC creation timestamps. Never create an instant for a coarse time period.

## Authorization and writes

Server code resolves a secure same-origin session. Every group read/write proves membership and permission; client IDs are untrusted selectors. Writes validate runtime input and commit expense plus in-app notification records atomically. Route revalidation follows the commit. External delivery and AI remain independent and can never undo an expense.

Invitation bearer tokens are hashed at rest, expiring, revocable, and transactionally consumed. Auth must provide strong password hashing, session rotation, cookie protections, sensitive-endpoint rate limits, and documented bootstrap/recovery.

## AI, memory, and credentials

- Manual paths never require AI; provider calls have bounded timeout/fallback.
- If credentials are persisted, use authenticated encryption with an instance secret outside SQLite and a rotation plan.
- Select least-necessary group context using deterministic matches, corrections, patterns, and compact summaries—not the full ledger.
- Runtime-validate structured output and require user confirmation for expense suggestions.
- Persist deterministic metrics separately from narrative and enough provider/model provenance for explanation without sensitive prompt/key logging.
- Disclose external transfer at AI enablement.

## Recurring and notifications

Actual expenses, rules, and suggestions use separate tables/state transitions. Confirmation transactionally creates one linked expense. A uniqueness key prevents duplicate suggestions for a rule/due period.

Expense creation and in-app notification records commit together in one SQLite transaction. Read-state changes are ordinary authorized writes. External delivery is later scope and must justify any asynchronous infrastructure.

## SQLite and deployment

- One application replica on persistent local/block storage; no unsafe network filesystem or multi-replica shared file.
- Foreign keys, bounded busy timeout, and WAL only after host/backup validation.
- Forward migrations run explicitly after a consistent backup; restore is exercised on a disposable instance.
- Pin Node/package-manager versions in a single container/service with persistent volume, health checks, instance encryption secret, public base URL, and operator-owned backups.

## Security and privacy

Keep secrets, invitation tokens, and free-text expenses out of client bundles, logs, and errors. Validate startup config; apply least filesystem privilege, CSRF-safe same-origin mutations, Secure/HttpOnly/SameSite cookies, headers, bounded inputs, and rate limits. No telemetry by default. External transfer occurs only for configured AI with disclosure and bounded payloads.

## Testing and performance

Prefer Server Components, authorized direct queries, bounded pagination, selected columns, parallel independent reads, and small client islands. Add dynamic chart/provider loading only when measurement supports it.

- Unit: money/rates/rounding, dates, classifications, policy, dedupe, aggregates, bounded context.
- Integration: migrated temporary SQLite, constraints, invites, isolation, mutations, outbox, reconciliation.
- Contract: AI adapters using structured fixtures, timeout/error cases, and no live paid calls in default CI.
- Playwright: auth, group switching/invites, quick capture with AI down, correction, notifications, dashboards at narrow/mobile/desktop viewports.
- Visual/accessibility: focus, no overflow, reduced motion, chart alternatives, intentional screenshots.

## Open decisions

Auth library/recovery and detailed Owner/Member permissions; SQLite driver; exchange provider and precision; group-level AI key rotation; audit/retention; single-container TLS/base URL/backup/RPO/RTO.

