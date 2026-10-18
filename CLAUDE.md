# Safar Studio — Project Rules

## Brand
سَفَر: a creative studio (AI video, automation systems, brand identity, UI/UX, consulting).
The name means first light / dawn, not travel. Arabic first, English mirror.

## Design
Warm, playful, editorial, hand-drawn. Follow `DESIGN-SYSTEM.md` and the skills in
`.claude/skills/` (taste, typography, spacing, layout, animation). Read `taste` first.

## Avoid
- generic AI gradients, glassmorphism, blurred shadows
- colors outside the palette, new font families
- text under 11px that a visitor has to read
- random or endless animations, inconsistent spacing, unnecessary components

## Code
- Frontend: React + Vite + Tailwind, styles mostly in `client/src/index.css`.
- Public homepage: `client/src/pages/Home.tsx` (route `/`). `/v2` is an experiment.
- Do not touch payment, contract or admin logic when doing design work.
- Run: `pnpm install && pnpm dev` → http://localhost:3000

## Done means
Never stop at writing code. For every visual change run the loop in `QA.md`:
build → open in browser → screenshots at 1440 / 820 / 390 → review → fix → retest.
