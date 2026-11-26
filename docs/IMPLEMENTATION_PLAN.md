# Implementation Plan — annoying.

Status: M2.5 Part A.1 mobile interaction remediation implemented; physical-device acceptance pending.

## Proportionate workflow

- Small UI changes: lint, strict type checking, and relevant browser verification.
- Feature changes: relevant unit, integration, and end-to-end tests.
- Milestone completion: full lint/type/test/e2e gates, production build, and visual/accessibility review.
- Never weaken an existing check. Present the diff and verification evidence for review; do not create Git commits unless explicitly requested.

## M0 — Foundation approval

Architecture, stack, requirements, design source of truth, and local skills approved. Product defaults: Owner/Member roles; first-user bootstrap then invitation registration; single-use seven-day invitations; group-level AI configuration; customizable default categories; recoverable soft deletion with lightweight history; in-app notifications; English-first UI; Carbon dark mode as the primary experience; single-container deployment with persistent SQLite.

## M1 — Application scaffold and design system

Deliverables: strict TypeScript Next.js App Router project; Tailwind and shadcn semantic tokens; responsive shell with persistent mobile bottom navigation; shared charts; lint/type/test/Playwright scripts. The original M1 colour foundation is superseded by Carbon in M2.5.

Acceptance: clean install; lint and typecheck pass; production build succeeds; 390px is the primary design viewport with 320px/375px compatibility and desktop enhancement; tokens and shadcn components avoid page-local visual systems.

## M2 — Interactive mobile-first UI prototype

Deliverables: navigable Dashboard, Activity, Quick Add, Insights, and Settings using realistic in-memory data; mock create/edit/filter/confirm flows; responsive charts; loading/empty/error designs; simulated AI labels and failure-safe manual entry.

Acceptance: ordinary capture is designed toward under 10 seconds and recurring confirmation under 3 seconds; classifications may remain unclassified/pending; quick add is available everywhere; local save updates visible activity/summary; all main screens and charts work at 320/375/390px and desktop without unintended overflow; screenshots and browser verification are captured.

## M2.5 Part A — Carbon visual pilot and smart capture

Replace the initial warm-neutral interface with the approved Carbon cyber-minimal system without rebuilding the application. Add URL-based main navigation, locally hosted Space Grotesk/Geist typography, exact 44px interactions, accessible drawer focus, expanded stable categories, optional tags, and a shared Smart/Manual capture draft. Essential capture controls remain immediately visible. Deterministic parsing and responsive history autocomplete use the shared mock ledger and never claim live AI.

Acceptance: explicit amount/currency/date win over inferred values; historical time is never invented; selecting history never overwrites explicit input; manual save works without inference; tags remain independent; shared totals still reconcile; exact target viewports, keyboard/focus, autocomplete, loading/error/empty states, production build, and Carbon screenshots pass review.

Review gate: stop after Home, Capture, and shared-shell approval. Part B applies the approved Carbon language to Activity, Insights, Settings, and future authentication designs and resolves remaining M2 review findings without expanding into backend work.

## M3 — Authentication, groups, and invitations

Implement strong sessions/passwords, first-user bootstrap, invitation-only subsequent registration, multi-group switching, Owner/Member authorization, and single-use seven-day invitations. Every group read/write is server-authorized. Finalize recovery and detailed permissions in this milestone.

## M4 — Real expense engine

Add Drizzle/SQLite migrations and persistent categories, expenses, soft deletion/history, foreign-currency provenance, filtering, edits, historical autocomplete, totals, and expense-backed charts. Preserve original input, precise money, group-local dates, optional time periods, independent/pending classifications, and exact reconciliation.

## M5 — AI-native capture

Add OpenAI, Anthropic, and xAI provider adapters, structured description and classification/tag suggestions, bounded group memory, correction feedback, and encrypted server-side credential handling. Manual capture remains independent, AI output stays reviewable, and default CI uses no paid calls.

## M6 — Financial intelligence

Create expense and in-app notification records in one SQLite transaction. Add recurring rules and due suggestions with durable deduplication, budgets, notifications, and user-initiated AI financial insights that visibly separate deterministic facts from generated interpretation. Actuals, rules, and suggestions remain separate.

## M7 — Production release

Complete behavioral/accessibility/performance coverage, 320/375/390px and desktop polish, installable PWA work, production single-container packaging, persistent-volume migrations, health checks, backup/restore exercise, security/privacy review, and release runbook.

## Git and review

Use `codex/` branches only when requested. Keep changes coherent with tests/migrations/docs, preserve unrelated work, and exclude generated artifacts. Report product impact, data/security risk, command results, browser evidence, mobile screenshots, and remaining issues before any requested commit.
