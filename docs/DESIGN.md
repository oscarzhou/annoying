---
title: Carbon — annoying. Design System
status: approved-source-of-truth
applies_to: all product UI and charts
---

# Carbon direction

Carbon is the visual system for **annoying.** It is cyber minimal: premium, precise, compact, dark, and quietly AI-native. Linear, Raycast, and Nothing are references for restraint and information density, never templates to copy. Avoid generic SaaS dashboards, banking-site conventions, default shadcn presentation, gaming language, decorative cyberpunk, glow, gradients, and glassmorphism.

Dark mode is the primary M2.5 experience. A complete light theme is outside this milestone.

## Semantic colour

All product UI uses shadcn semantic tokens. Feature components must not contain raw colours.

| Role | Carbon value | Use |
|---|---:|---|
| background | `#090A0C` | carbon canvas |
| foreground | `#F0F2F5` | platinum primary text |
| card | `#14161A` | graphite elevated surface |
| popover | `#181A1F` | overlay surface |
| muted | `#202329` | secondary surface |
| muted-foreground | `#A0A6B0` | silver metadata |
| border/input | `#30343B` | subtle 1px structure |
| primary/ring | `#C7F65B` | signal lime action/focus |
| primary-foreground | `#090A0C` | text on signal lime |
| destructive | `#FF737D` | destructive/error only |

Signal lime is reserved for primary actions, active navigation, AI focus, focus rings, and meaningful highlights. It is not the default icon, label, border, or chart colour. Category colours use a stable, low-saturation shared palette and always include an icon and label.

## Typography

- Space Grotesk Variable: wordmark, page titles, display headings.
- Geist Sans: interface copy and controls.
- Geist Mono: money, analytical data, dates where alignment matters.
- Wordmark: 24–32px; primary amount: 36–44px; page title: 24px; section: 16px; body/control: 14–16px; metadata: 12–14px; mobile nav: 11–12px.
- Mobile inputs remain at least 16px. Financial values use tabular numerals.
- Fonts are served from installed local packages; no runtime font CDN request is allowed.

## Geometry and spacing

- 4px base grid; prefer 4, 8, 12, 16, 24, 32, 48.
- 16px mobile gutter. Wide content remains centred and bounded.
- Corner radii: 8–16px, derived from the shared radius token.
- Use subtle borders and layered surfaces, not heavy shadows.
- Every interactive target is at least 44×44 CSS pixels.
- Use short transform/opacity/colour transitions and honour reduced motion.

## Navigation and shell

Main destinations are Home, Activity, Capture, Insights, and Settings. Capture is the central mobile action. Home, Activity, Insights, and Settings use real App Router URLs, anchors/Links, browser history, and deep-linkable filters where practical. Persistent navigation respects safe areas and never covers focused controls or final content.

The shell uses a compact wordmark, household selector, period context, and notification entry. Promotional copy does not appear inside the authenticated product.

## Product compositions

- Start with shadcn primitives and preserve their accessibility contracts.
- Prefer flat lists and separators to nested cards.
- Use one primary action per task region.
- Short desktop overlays require a title, contained overscroll, initial focus, focus restoration, and safe-area-aware actions. Mobile Capture is not an overlay.
- Large option sets use searchable, touch-friendly full-screen pickers on mobile. Small option sets use compact segmented controls or chips with clear pressed and selected states.
- Labels remain visible; placeholders are examples only. Errors sit beside their control and focus the first invalid field.
- Empty states explain the absence and offer one relevant next action.

### Transaction row

Order: stable category icon, description, creator/date metadata, optional tags, group-currency amount. Creator means recorded-by, never payer. Foreign original amount remains visible where relevant. Rows are shared across Home and Activity.

### Capture

Capture is a dedicated full-screen mobile route in normal document flow. It hides the application navigation, returns to its originating route, and persists one Smart/Manual draft through picker interactions and accidental navigation. Desktop may use the same route or a focused dialog, but both presentations reuse the same draft and domain rules.

Immediately visible: amount, adjacent currency, description/smart input, expense date, time of day, category, frequency, expectation, and optional tags. Time supports Now only for the current expense date; historical entries use Morning, Afternoon, Evening, or Unspecified and never inherit a current-time timestamp.

History autocomplete responds to typed input and uses existing authorised group history. A selected suggestion fills only fields that the user has not explicitly set. Deterministic parsing and simulated AI must be labelled honestly. Explicit amount, currency, and date always win. Save remains visible through scrolling, keyboard use, validation, and long input.

The capture layout must tolerate visual-viewport resize, browser chrome, orientation changes, and safe areas without hardcoded keyboard offsets. Prefer normal document scrolling; focused fields and the save action must remain reachable with numeric or text keyboards open. Currency and category use searchable pickers; frequency, expectation, and time use compact reliable choices. Physical iPhone and Android verification remains mandatory because emulation and desktop WebKit cannot prove virtual-keyboard behavior.

### Activity

Activity is a dense chronological ledger with search, period/date, category, member, frequency, expectation, and tag filters. Show matching count and exact group-currency total, date groups, and daily subtotals.

### Home and Insights

Home is a financial command centre: total, comparable change only when supported, budget/remaining, compact daily bars, due recurring suggestions, recent transactions, and an AI-analysis entry state. Financial values dominate; do not assemble decorative cards.

Insights owns detailed period comparisons, category ranking, frequency, expectation, and recorded-by analysis. Deterministic amounts remain visibly separate from simulated/generated interpretation.

## Charts

Use shadcn Chart over Recharts with the shared configuration and category metadata. Use bars for time and category comparison. No 3D, gradients, dual axes, meaningless animation, or isolated palettes. Every chart has adjacent accessible labelled values. Tooltips use shared money formatters. Exercise empty, single-value, long-label, foreign-currency, and many-category states.

## Content and states

Voice is concise, calm, and direct. Do not expose developer-oriented explanations in normal screens. Show loading, empty, validation, success, unavailable comparison, missing budget, AI-not-configured, and provider-error states. Never fabricate trends or claim live AI when inference is deterministic or simulated.

## Review gate

Verify 320×740, 375×812, 390×844, and 1440×900; 200% zoom; keyboard order; focus entry/restoration; screen-reader names; minimum targets; safe areas; reduced motion; keyboard viewport; long text; no horizontal overflow; chart alternatives; and normal/error/empty states. Physical-device findings must be distinguished from browser emulation.
