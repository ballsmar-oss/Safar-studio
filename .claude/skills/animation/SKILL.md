---
name: animation
description: Motion rules for the Safar site — durations, easing, hover states and reduced motion. Use when adding transitions or animations.
---

# Animation — Safar

## Tokens (defined in index.css :root)
- `--ease-out: cubic-bezier(.22,.8,.25,1)` — default for entrances and reveals.
- Durations: 150–200ms hover, 250ms reveal, 600–1100ms one-off hero / receipt moments.

## Rules
- Hover on buttons with a hard shadow: grow the offset (3px → 6px) and move the button the
  opposite way, so it feels pressed out. Pressed state: offset back to 0.
- Arrows in links nudge 4px toward reading direction (left in Arabic).
- Looping animation only for the cat and "zz" — slow (3–5s), small amplitude.
- Never animate layout properties (width, height, top) — use transform and opacity.
- Every animation must be disabled or reduced under `prefers-reduced-motion: reduce`.
- Any `var(--…)` used in an animation must exist; an undefined variable silently kills the whole animation.
