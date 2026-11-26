# annoying. Engineering Guide

This repository contains **Annoying**, styled **annoying.**, a mobile-first, self-hosted, AI-assisted group expense tracker. The approved product visual system is **Carbon**, a dark cyber-minimal system defined only in `docs/DESIGN.md`. This file is mandatory guidance for every coding agent. Product requirements live in `docs/PRD.md`, technical decisions in `docs/ARCHITECTURE.md`, and delivery gates in `docs/IMPLEMENTATION_PLAN.md`.

## Before changing code

1. Read the relevant project documentation and inspect the existing implementation, tests, and `components.json`.
2. Load the applicable skills from `.agents/skills/`:
   - `mobile-first-ux` for any screen, form, navigation, or interaction.
   - `expense-design-system` for UI, Tailwind, shadcn/ui, charts, or visual review.
   - `expense-domain-rules` for money, transactions, categories, dates, summaries, imports, or persistence.
   - `shadcn` before adding, changing, or composing shadcn/ui components.
   - `vercel-react-best-practices` for React/Next.js implementation and performance.
   - `vercel-composition-patterns` when designing reusable component APIs or shared state.
   - `web-design-guidelines` for the visual/accessibility review gate.
3. Check current shadcn project metadata and component documentation through the shadcn CLI before using component APIs. Reuse installed components and variants before creating custom UI.
4. Keep the change within the accepted milestone. Record unresolved product choices; do not turn guesses into durable behavior.

## Mandatory standards

- Use TypeScript with strict checking. Do not introduce `any` without a documented boundary and runtime validation.
- Use the Next.js App Router. Prefer Server Components; add Client Components only at the smallest interactive boundary.
- Keep domain logic framework-independent and testable. UI and route handlers must not contain money arithmetic or duplicate domain rules.
- Represent amounts as integer minor units plus ISO 4217 currency. Represent exchange rates with approved precise decimal/integer-ratio semantics and explicit rounding. Never use binary floating-point arithmetic for financial values.
- Authorize every group-scoped read and write on the server. Never trust group, membership, creator, or permission claims from the client.
- Keep manual expense recording functional without AI. Treat AI output as untrusted suggestions, validate it structurally, keep credentials server-only/encrypted at rest, and isolate bounded memory by group.
- Keep actual expenses, recurring rules, and pending suggestions distinct. Future or unconfirmed records never contribute to actual totals.
- Validate every write at the server boundary. Treat client validation as feedback, not enforcement.
- Use Drizzle migrations for schema changes. Never edit a deployed database by hand or run destructive migrations without an explicit data-migration and backup plan.
- Reuse shadcn/ui components and semantic theme tokens. Avoid arbitrary page-specific colors, typography, radii, shadows, and one-off primitives.
- Build mobile-first for a 320px minimum viewport and one-handed use. Primary actions belong in the lower reach zone where practical; touch targets must be at least 44 by 44 CSS pixels.
- All functionality must be keyboard operable, screen-reader labelled, focus-visible, and usable at 200% zoom. Do not rely on color alone.
- Charts must use the shared chart configuration in `docs/DESIGN.md`, have a non-chart summary or table, and use consistent category colors.
- Add or update automated tests with behavior. Avoid snapshot tests for business rules.
- Do not add dependencies until existing platform, React, shadcn/ui, or project utilities have been evaluated. Record the reason for any new runtime dependency.
- Avoid speculative abstractions, repositories over a single database adapter, microservices, global client stores, event buses, or generic design systems without a current requirement.

## Required workflow

Use proportionate gates. Small UI changes require lint, type checking, and relevant browser verification. Feature changes require relevant unit, integration, and end-to-end tests. Milestone completion requires the full quality suite, production build, and visual/accessibility review. Always inspect and present `git diff` plus verification results; do not create commits unless explicitly requested. Never bypass a failing gate by weakening the check.

Expected commands will be finalized when the application is scaffolded, with these stable names: `lint`, `typecheck`, `test`, `test:e2e`, and `build`.

## Definition of done

A change is done only when its documented acceptance criteria pass; loading, empty, error, validation, and success states are handled; mobile interaction and accessibility are verified; domain and migration risks are covered; documentation reflects changed decisions; and the Git diff contains no unrelated or generated debris.


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
