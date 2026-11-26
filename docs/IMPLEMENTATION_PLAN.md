# Implementation Plan — annoying.

Status: M0 approved; M1 and M2 implemented as an interactive prototype pending review.

## Proportionate workflow

- Small UI changes: lint, strict type checking, and relevant browser verification.
- Feature changes: relevant unit, integration, and end-to-end tests.
- Milestone completion: full lint/type/test/e2e gates, production build, and visual/accessibility review.
- Never weaken an existing check. Present the diff and verification evidence for review; do not create Git commits unless explicitly requested.

## M0 — Foundation approval

Architecture, stack, requirements, design source of truth, and local skills approved. Product defaults: Owner/Member roles; first-user bootstrap then invitation registration; single-use seven-day invitations; group-level AI configuration; customizable default categories; recoverable soft deletion with lightweight history; in-app notifications; English-first UI; light theme first; single-container deployment with persistent SQLite.

## M1 — Application scaffold and design system

Deliverables: strict TypeScript Next.js App Router project; Tailwind and shadcn semantic tokens; responsive shell with persistent mobile bottom navigation; shared charts; lint/type/test/Playwright scripts. The original M1 colour foundation is superseded by Carbon in M2.5.

Acceptance: clean install; lint and typecheck pass; production build succeeds; 390px is the primary design viewport with 320px/375px compatibility and desktop enhancement; tokens and shadcn components avoid page-local visual systems.

## M2 — Interactive mobile-first UI prototype

Deliverables: navigable Dashboard, Activity, Quick Add, Insights, and Settings using realistic in-memory data; mock create/edit/filter/confirm flows; responsive charts; loading/empty/error designs; simulated AI labels and failure-safe manual entry.

Acceptance: ordinary capture is designed toward under 10 seconds and recurring confirmation under 3 seconds; classifications may remain unclassified/pending; quick add is available everywhere; local save updates visible activity/summary; all main screens and charts work at 320/375/390px and desktop without unintended overflow; screenshots and browser verification are captured.

## M2.5 — Carbon redesign and smart capture

Replace the initial warm-neutral interface with the approved Carbon cyber-minimal system without rebuilding the application. Add URL-based main navigation, locally hosted Space Grotesk/Geist typography, exact 44px interactions, accessible drawer focus, expanded stable categories, optional tags, and a shared Smart/Manual capture draft. Essential capture controls remain immediately visible. Deterministic parsing and responsive history autocomplete use the shared mock ledger and never claim live AI.

Acceptance: explicit amount/currency/date win over inferred values; historical time is never invented; selecting history never overwrites explicit input; manual save works without inference; tags remain independent; shared totals still reconcile; exact target viewports, keyboard/focus, autocomplete, loading/error/empty states, production build, and Carbon screenshots pass review.

## M3 — Authentication, groups, and invitations

Implement strong sessions/passwords, first-user bootstrap, invitation-only subsequent registration, multi-group switching, Owner/Member authorization, and single-use seven-day invitations. Every group read/write is server-authorized. Finalize recovery and detailed permissions in this milestone.

## M4 — Persistent expense management, dashboard, and deterministic charts

Add Drizzle/SQLite migrations and persistent categories, expenses, soft deletion/history, foreign-currency provenance, filtering, edits, totals, budgets, and charts. Preserve original input, precise money, group-local dates, optional time periods, independent/pending classifications, and exact reconciliation.

## M5 — Notifications, historical suggestions, and recurring expenses

Create expense and in-app notification records in one SQLite transaction. Add unread/history, deterministic prior-description/category/amount suggestions, recurring rules/due suggestions, confirmation, and durable deduplication. Actuals, rules, and suggestions remain separate; no background worker or queue without a demonstrated need.

## M6 — AI integration, group memory, and financial insights

Add group-level encrypted provider configuration and OpenAI/Anthropic/xAI adapters, structured reviewable suggestions, bounded group-isolated history, disclosure, timeouts/fallback, and weekly/monthly insights that visibly separate deterministic facts from generated interpretation. Default CI uses no paid calls.

## M7 — Testing, mobile polish, PWA, and self-hosted deployment

Complete behavioral/accessibility/performance coverage, 320/375/390px and desktop polish, installable PWA work, production single-container packaging, persistent-volume migrations, health checks, backup/restore exercise, security/privacy review, and release runbook.

## Git and review

Use `codex/` branches only when requested. Keep changes coherent with tests/migrations/docs, preserve unrelated work, and exclude generated artifacts. Report product impact, data/security risk, command results, browser evidence, mobile screenshots, and remaining issues before any requested commit.
