---
name: taste
description: Safar's design direction. Use before designing, restyling or reviewing any page or component of the Safar studio site, so the result looks like Safar and not like a generic AI template.
---

# Taste — Safar

Safar (سَفَر) means the first light of day, not travel. The site should feel like a
warm, hand-drawn morning: confident, playful, a little editorial, never corporate.

## The look we already have (keep it)
- Flat color fields in the four brand colors: navy, turquoise, cream, coral.
- Hard offset shadows (`3px 3px 0 var(--coral)`, `7px 8px 0 var(--navy)`), never blurred drop shadows.
- 1.5–2px navy outlines on cards, buttons and the phone.
- Hand-drawn touches: doodle arrows, squiggles, sparks ✦, the sleeping cat, stickers.
- Big, tight Kufi headlines with one word highlighted in coral.

## Avoid
- Generic AI gradients, glassmorphism, neon glows, blurred shadows.
- Stock "SaaS" layouts: three identical icon cards, centered hero + gradient blob.
- New colors outside the palette (see DESIGN-SYSTEM.md). Muted text uses `--ink-muted` only.
- Text under 11px anywhere a visitor has to read it (the phone mock-up is the one exception, and its labels still need to be legible at 390px width).
- Animation that loops forever on content (decorative mascots are fine, slow and subtle).
- More than one coral accent competing in the same view.

## Priorities
1. Strong hierarchy: one clear headline, one primary action per section.
2. Arabic first: RTL layout, Arabic copy is the reference, English mirrors it.
3. Intentional whitespace from the spacing scale, not ad-hoc numbers.
4. Personality through illustration and copy, not through effects.
5. Every interaction gives feedback (hover, pressed, focus ring in coral).

## Review question
Before finishing, ask: "Could this section belong to any other studio?" If yes, it
needs a Safar detail (doodle, hard shadow, coral word, cat) or sharper copy.
