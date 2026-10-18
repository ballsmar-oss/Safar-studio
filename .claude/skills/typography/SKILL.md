---
name: typography
description: Type rules for the Safar site — fonts, the size scale, line height and readable line length. Use when adding or changing any text style.
---

# Typography — Safar

## Fonts
- Display / headings: `"Noto Kufi Arabic"`, weights 700–900, letter-spacing about -0.04em to -0.06em.
- Body / UI: `"IBM Plex Sans Arabic"`, weights 400–700.
- Hand note ("Good ideas work."): cursive, decorative only, never for content.
- Do not add new font families.

## Size scale (px) — use only these
| Token | Desktop | Mobile (≤480) | Use |
|---|---|---|---|
| display | 70–80 | 44–52 | hero headline only |
| h2 | 44–52 | 32–36 | section titles |
| h3 | 22–28 | 20–22 | card titles, form title |
| body-lg | 17–18 | 16 | section leads |
| body | 15–16 | 15 | paragraphs |
| small | 13 | 12 | captions, meta |
| micro | 11 | 11 | kickers, legal — the floor |

Existing values like 8–10px outside the phone mock-up are debt: raise them to 11+ when touching that area, and re-check the layout in the browser.

## Rhythm
- Headlines: line-height 1.05–1.2. Body: 1.7–1.9 (Arabic needs the room).
- Max line length for paragraphs: about 60 characters (`max-width: 34em`).
- Numbers and Latin inside Arabic copy: wrap in `dir="ltr"` spans when order matters (phone numbers, emails).
