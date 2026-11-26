---
name: expense-domain-rules
description: Implement or review annoying. group expenses, money/exchange calculations, dates, classifications, recurring suggestions, notifications, AI memory, summaries, or Drizzle rules. Applies to domain models, validation, authorized queries, and financial tests; excludes generic persistence and UI styling.
---

# Expense domain rules

Read `docs/PRD.md` and `docs/ARCHITECTURE.md`. Surface unresolved decisions instead of encoding guesses.

- Store original/converted amounts as integer minor units with ISO currencies. Rates use approved precise decimal/integer-ratio semantics, explicit direction/date/source/rounding. Never use binary floating point.
- Historical conversions never drift with current rates. Aggregate only in an explicit compatible/group currency and reconcile against the same actual set.
- Parse at a validated server boundary; reject unsupported currency, excess precision, overflow, malformed signs, and ambiguous conversion.
- Separate group-local date, optional morning/afternoon/evening, and UTC creation timestamp. Never invent a time; test DST and period boundaries.
- Resolve user/group/permission server-side for every read/write. Prevent cross-group access in queries and checks.
- Validate categories against group availability. Category, frequency, and expectation remain independent and correctable.
- Optional tags are independent from those 3 dimensions. Validate tag identity/scope, preserve explicit user selection, and never treat a suggested or judgemental tag as confirmed without user action.
- Preserve original input apart from improved description/AI output; record creator and approved provenance.
- Commit related writes atomically and enforce invariants with SQLite foreign keys/checks/uniques.
- Keep actual expenses, recurring rules, and pending suggestions separate. Only actuals count toward totals/budgets/charts.
- Deduplicate due suggestions durably; confirmation creates at most one linked expense under retries.
- Commit expense and notification/outbox intent together; notification failure never prevents persistence.
- Prefer deterministic matching before AI. Validate AI, isolate/bound context by group, require review, and fall back manually.
- Keep deterministic metrics separate from interpretation; never claim savings without adequate facts.

Tests cover precision/rounding, immutable conversion, cross-group access/category/memory, date/time periods, independent classifications, duplicates, notification failure, provider timeout/invalid output, period boundaries, and exact reconciliation. Use pure tests plus migrated temporary SQLite; no UI snapshots for financial correctness or paid live AI in default CI.

