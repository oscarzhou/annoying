---
name: expense-design-system
description: Apply or review annoying.'s visual identity, semantic tokens, component conventions, financial presentation, and chart styling. Use for UI, Tailwind/shadcn styling, shared components, dashboards, and visual consistency; not as a generic component guide.
---

# Carbon design system

Treat `docs/DESIGN.md` as the source of truth. Load `shadcn` for APIs and `mobile-first-ux` for behavior.

- Use **annoying.** and its tagline only in approved brand contexts. Keep the voice friendly and lightly persistent, never judgemental or conflict-inducing.
- Use shared semantic tokens. Never invent page palettes, type scales, radii, shadows, control heights, or category colors.
- Carbon-black, graphite, platinum/silver, and restrained signal lime are approved. Dark mode is primary. Do not reintroduce warm neutral, teal, default-shadcn, banking, gaming, glow, gradient, or glass-heavy styling.
- Space Grotesk is display/brand, Geist Sans is interface, and Geist Mono is financial/analytical. Use installed local fonts and tabular numerals.
- Reuse installed shadcn components/variants before product compositions; create a primitive only after docs/registry inspection identifies a gap.
- Name compositions for stable concepts (transaction row, suggestion review, notification item, period summary), not page positions.
- Use tabular numerals and explicit currency/period context. Spending is not destructive-state red.
- Keep category label/icon-or-pattern/color stable. Frequency and expectation remain independent dimensions.
- Distinguish persisted facts, pending suggestions, and AI interpretation by labels and hierarchy, not color alone.
- Use category icons, not member initials, as the primary transaction marker. Share the same category metadata and semantic chart color on every screen.
- Prefer compact divided lists for activity and settings indexes. Reserve cards for genuinely grouped surfaces instead of wrapping every section.
- Capture uses the full-screen mobile route defined in `docs/DESIGN.md`, exposes amount, searchable currency, date, time, and all 3 independent classifications without a “More details” gate, and uses native-like pressed/selected feedback. Smart and Manual modes share one protected draft. Optional tags remain a fourth, separate concept.

Charts use shadcn Chart and shared config. Avoid isolated palettes/tooltips, 3D, gradients, dual axes, and meaningless animation. Pair every chart with deterministic labelled totals and accessible values; support touch and reduced motion. Exercise empty, single, many-category, long-label, budget, and foreign-currency states.

Dashboard uses compact daily bars. Insights uses period bars, ranked category bars, and separate segmented frequency/expectation summaries. All values derive from the shared ledger and integer-money formatters.

For review, check token use, hierarchy, spacing, safe-area bottom navigation, state coverage, category/classification consistency, charts, contrast, focus, and narrow overflow. Use `web-design-guidelines` for generic accessibility/UX audit.

