---
name: layout
description: Grid, alignment and responsive breakpoints for the Safar site. Use when building or rearranging sections.
---

# Layout — Safar

## Containers
- Content width: `min(1180px, calc(100% - 72px))`; narrow sections (forms, picker): `min(960px, …)`.
- Desktop thinks in a 12-column grid; hero is roughly 6 / 6 (copy / phone scene).

## Breakpoints (already in the CSS — reuse them, do not invent new ones)
- `max-width: 850px` — tablet: stack two-column sections, phone scene goes under the copy.
- `max-width: 480px` — mobile: single column, smaller display type, 16–20px gutters.
- `prefers-reduced-motion: reduce` — must stay supported.

## Rules
- RTL first: use logical properties (`margin-inline-start`, `inset-inline-end`) for new code.
- No horizontal scroll at 360px width. Decorative doodles and stickers must be clipped
  (`overflow: hidden` on their wrapper) or hidden on mobile.
- One primary CTA per viewport on mobile.
- The floating WhatsApp button must not cover the form submit button or the footer links.
