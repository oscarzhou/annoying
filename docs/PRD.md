# Product Requirements — annoying.

Status: foundation proposal  
Tagline: **A little annoying. A lot of savings.**

## Vision and principles

**annoying.** is a lightweight, self-hosted, AI-assisted household expense tracker designed primarily for couples. It makes shared spending transparent, capture extremely easy, habits understandable, and saving suggestions practical without judgement or conflict.

- Mobile and one-handed operation define the base experience; desktop progressively enhances it.
- Facts and totals come from persisted records and deterministic calculations, never an LLM.
- AI proposes; users review and correct. AI failure never blocks expense recording.
- Group data, memory, credentials, and authorization remain isolated.
- Self-hosting and recoverability outrank infrastructure novelty.

## Users and groups

- Users register, log in, and may belong to multiple expense groups. Email verification is not required for MVP.
- The first registered user bootstraps the instance; subsequent registration is invitation-based.
- A group has a name, default currency, timezone, members, permissions, and optional budget settings.
- Authorized members invite another person through a secure link; the invitee registers or logs in before joining.
- All members can view their group's shared expenses. Every group operation is authorized server-side and every expense records its creator.

## MVP requirements

### Identity and groups

- Registration, login/logout, secure password storage, and sessions.
- Create, switch, and configure groups.
- Secure, expiring, single-purpose invitations subject to permissions.
- Server-side authorization for every group-scoped query and mutation.

### Expense capture and correction

Accept short, informal text such as `groceries countdown 85`, `rent 690`, or `car repair unexpected 350`. Persist:

- Original input and a separately reviewable improved description.
- Original amount/currency; currency defaults to the group currency but is overridable.
- For foreign currency: exchange rate, rate date, and converted group-currency amount. Historical converted values never drift with later rates.
- Expense date, creation timestamp, creator, category, frequency (`recurring` or `one-off`), and expectation (`expected` or `unexpected`).
- For historical entries without exact time, optional `morning`, `afternoon`, or `evening`; never invent an exact time.

Category, frequency, and expectation are independent. AI may suggest descriptions and classifications, but users can review/correct them. Capture must not force completion of all three dimensions: uncertain values may remain unclassified or pending review. Manual capture remains available during AI failure.

Expenses may also have optional, user-editable tags such as Household, Essential, Moving, Subscription, Holiday, Work, Emergency, or Entertainment. Tags are independent from category, frequency, and expectation; they assist recall and filtering and must never become judgemental confirmed facts without user action. Historical tag suggestions prefer relevant authorised group history. Persisted custom tags and tag administration are deferred to the persistence milestone.

### Activity, summaries, and budgets

- Recent history with deterministic date grouping and group/date/category/classification filters.
- Create, view, edit, and delete/recover according to an approved audit policy.
- Weekly/monthly totals, trends, category distribution, recurring versus one-off, expected versus unexpected, member contribution, and current versus previous month where supported by data.
- Optional monthly spending budget and savings target.
- Charts use persisted records, shared styling, responsive tooltips, and adjacent accessible values.

### Recurring suggestions

- Suggest descriptions, amounts, and categories from group history; detect likely regular payments deterministically before any LLM call.
- Keep actual expenses, recurring rules, and pending suggestions logically and persistently separate.
- Present due items for confirmation. Unconfirmed/future items never enter actual totals; duplicate recurring suggestions are prevented.

### In-app notifications

- Notify other group members after an expense is successfully added.
- Store unread state and notification history.
- Notification failure must not roll back or prevent expense persistence.

### Configurable AI and memory

- Support OpenAI, Anthropic Claude, and xAI Grok through server-side adapters, preferably using Vercel AI SDK where useful.
- Configure provider, model, and API key. Keys never reach browser code/logs and are encrypted at rest if stored in SQLite.
- Runtime-validate structured outputs.
- Assist description, category, frequency, expectation, and user-requested weekly/monthly analysis.
- Distinguish deterministic metrics from generated interpretation and disclose that relevant data may be sent to the provider.
- Use bounded, relevant group history: prior records, common descriptions/categories, recurring patterns, corrections, preferences, and compact summaries. Never send the whole ledger by default; no vector database without demonstrated need.
- Insights may explain spending, changes, budget status, potentially avoidable expenses, and practical recommendations. Never claim a savings target was achieved without adequate income/savings facts.

## MVP quality requirements

- Persistent bottom navigation and quick capture from every main screen.
- Design primarily at 390px and verify 320px and 375px without page overflow; targets at least 44×44 CSS pixels.
- Target ordinary expense capture in under 10 seconds and recurring-expense confirmation in under 3 seconds. These are initial product targets, not measured outcomes.
- Prefer progressive disclosure to long forms.
- Keyboard, screen-reader, focus-visible, reduced-motion, and 200% zoom support.
- Loading, empty, provider-unavailable, validation, and error states.
- Exact financial calculations using integer minor units and/or precise decimals for exchange rates; never binary floating point.
- Migrations and tested backup/restore on a configurable persistent volume.
- No telemetry or external transfer by default beyond explicitly configured AI requests.

## Later enhancements

PWA installation/offline behavior; Web Push; bank feeds; receipt OCR/attachments; import/export; richer permissions and account recovery; advanced recurring automation, forecasting, and income/savings tracking. Vector search requires demonstrated need. Native apps and public SaaS tenancy are not current commitments.

## Success measures

Baseline after a usable slice: capture time/abandonment, correction rate, suggestion acceptance/correction, weekly active members, dashboard use, provider-failure impact, notification delivery, and reconciliation errors. No numeric targets are assumed yet.

## Unresolved product decisions

1. Detailed Owner/Member permission matrix, including who may edit others' expenses or delete data.
3. Invitation expiry/revocation/reuse and public base URL.
4. Password reset/recovery without mandatory email verification.
5. Delete/audit policy and visible edit history.
6. Category defaults/customization/retirement.
7. Exchange-rate source, override, precision/rounding, unavailable-rate behavior, and provenance.
8. Required capture fields versus fields confirmed after suggestions.
8. Group-level AI credential encryption-key provisioning and rotation.
10. Exact MVP boundary for recurring, budgets, and AI analysis if sequencing is needed.
11. Notification retention.
11. Single-container deployment details, data volume, TLS/proxy, backup ownership, and recovery objectives.

