# Safar Design System

Source of truth for the public site. Tokens live in `client/src/index.css` `:root`.

## Color
| Token | Value | Use |
|---|---|---|
| `--navy` | #0d2b52 | text, outlines, dark buttons |
| `--turquoise` | #78d2ce | page background |
| `--cream` | #fff5df | cards, form, phone screen |
| `--coral` | #f47763 | accent word, shadows, focus ring, primary hover |
| `--blue-light` | #b9e4dc | secondary surfaces, previews |
| `--ink-muted` | #4d6a80 | secondary text (replaces #557087, #47647a, #4d7084, #42617a) |
| WhatsApp | #25d366 | WhatsApp button only |

Contrast: navy on cream/turquoise passes AA. Coral is for accents and shadows, not body text.

## Typography
Display / Heading: Noto Kufi Arabic 700–900. Body / Caption: IBM Plex Sans Arabic 400–700.
Scale and rules: `.claude/skills/typography/SKILL.md`. Minimum readable size: 11px.

## Spacing
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128

## Radius
- Small 12px — inputs, chips, small buttons
- Medium 22px — cards, previews
- Large 34px — big panels (service picker, form card)
- Pill 999px — CTAs, toggles

## Shadow (hard offset only)
- `--shadow-sm: 3px 3px 0 var(--coral)` — buttons
- `--shadow-md: 7px 8px 0 var(--navy)` — phone, featured card
- `--shadow-soft: 8px 9px 0 rgba(13,43,82,.12)` — large panels

## Motion
`--ease-out: cubic-bezier(.22,.8,.25,1)`; hover 150–200ms, reveal 250ms. See `.claude/skills/animation`.

## Components
- **Button (CTA):** pill, navy outline, cream or navy fill, hard coral shadow, arrow icon.
- **Card:** cream, 1.5–2px navy outline, medium radius, optional hard shadow.
- **Input:** cream, navy 1.5px outline, small radius, coral focus ring.
- **Navigation:** logo + 4 links + ع/EN switch; burger under 850px.
- **Toggle:** the phone/service toggle (navy when on).
- **Kicker:** dot + small label above section titles.
