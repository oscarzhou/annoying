# annoying.

**annoying.** is an early-stage, mobile-first household expense tracking prototype. It explores fast manual and deterministic smart capture, a shared activity ledger, financial summaries, recurring-expense suggestions, and the Carbon cyber-minimal interface.

This repository currently contains an interactive in-browser prototype backed by synthetic mock data. It is not production-ready.

## Current implementation

- Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.
- Responsive Home, Activity, Capture, Insights, and Settings experiences.
- URL-based main navigation and persistent mobile capture access.
- In-memory/session-scoped mock expenses shared across screens.
- Exact integer minor-unit calculations and deterministic mock currency conversion.
- Deterministic natural-language hints and history-based autocomplete.
- Recharts visualisations through the shared shadcn Chart wrapper.
- Vitest and Playwright coverage at 320×740, 375×812, 390×844, and 1440×900.

The following are **not implemented**: real authentication or authorization, SQLite/Drizzle persistence, durable recurring deduplication, production notifications, live AI inference, encrypted provider credentials, deployment packaging, or real household data import.

## Local development

Use Node.js 20.19 or newer and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Quality commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Playwright uses the production server, so run a successful build before invoking the end-to-end suite directly after source changes.

## Product and engineering documentation

- [Product requirements](docs/PRD.md)
- [Carbon design system](docs/DESIGN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Agent engineering guide](AGENTS.md)

All committed financial records, household names, and member identities are synthetic fixtures. Do not add real financial data, credentials, exported databases, or identifying screenshots to the repository.

## Agent skills

The three project-authored skills under `.agents/skills/` are version controlled. Externally maintained skills are recorded by source and hash in `skills-lock.json` and intentionally excluded from Git to avoid silently vendoring third-party material.

On Windows, install or refresh the external skills with:

```powershell
./scripts/install-agent-skills.ps1
```

See [Agent skill management](docs/AGENT_SKILLS.md) for sources, licensing notes, and manual commands.

## Environment and data

The prototype requires no environment variables or database. If configuration is added later, commit only a safe `.env.example`; real `.env*` files, databases, runtime data, backups, screenshots, and review artifacts are ignored.

## Licence

No project open-source licence has been selected. Copyright law therefore reserves project rights by default. A licence must be chosen explicitly before inviting external reuse or contributions. Third-party packages and agent skills remain governed by their own licences.
