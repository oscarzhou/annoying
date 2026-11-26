---
name: mobile-first-ux
description: Design, implement, or review annoying. flows for small screens and one-handed operation. Apply to layouts, persistent navigation, quick capture, forms, lists, overlays, and mobile browser tests; pair with shadcn and the project design system rather than replacing component guidance.
---

# Mobile-first UX

Read `docs/PRD.md` and `docs/DESIGN.md` before acting.

- Start at 320px; preserve task order as screens widen.
- Keep persistent bottom navigation on main mobile screens, respect safe areas, and expose quick capture from every main destination.
- Put frequent actions in lower thumb reach where they do not obscure content. Targets are at least 44×44 CSS pixels; destructive actions need separation.
- Sticky UI must not cover focus, errors, or final rows. Never require hover, precision gestures, or page-level horizontal scrolling.
- Use full pages for long forms and accessible bottom drawers for short selections/edits. Preserve browser back behavior.
- Prefer vertical lists/progressive disclosure over compressed tables and nested scrollers.
- Quick capture minimizes required typing, accepts informal original text, defaults from group settings, and makes AI suggestions editable before confirmation.
- Implement capture as a bottom drawer or full-screen mobile flow with a scrollable body and safe-area-aware persistent save footer. Amount, description, currency, date, time of day, category, frequency, and expectation are immediately discoverable. Smart and Manual modes share one draft; optional tags are compact and editable.
- Main destinations use App Router URLs and Links so browser back, reload, and deep links behave predictably.
- Keep authenticated screens compact. Remove promotional taglines, redundant greetings, and explanations when a label or financial value is clearer.
- Keep labels visible and form text at least 16px. Preserve values through errors; prevent duplicate submission; manual capture survives provider failure.
- Optimize for one thumb without sacrificing keyboard, switch, zoom, or screen-reader use.

Test 320px and the primary phone Playwright viewport for overflow, clipped focus, sticky overlap, safe areas, keyboard order/names, 200% zoom, reduced motion, and loading/empty/provider-error/validation/success states. Inspect reach and density as well as assertions.

Defer tokens, component APIs, and charts to `expense-design-system`, `docs/DESIGN.md`, and `shadcn`.

