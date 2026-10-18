# QA loop

Paste this into Claude Code from the project folder (with Playwright MCP connected):

```
Run `pnpm dev`, then use Playwright to open http://localhost:3000 and /works.

Check: navigation, ع/EN switch, phone service picker, buttons, links, contact form
validation, WhatsApp button, horizontal overflow, broken images/videos, console errors.

Take full-page screenshots at 1440, 820 and 390 px width, in Arabic and English.
Review them against DESIGN-SYSTEM.md and the taste skill: spacing, type sizes
(nothing readable under 11px), alignment, overflow, hierarchy, consistency.

Fix what you find, retest, and repeat until clean. Report what changed.
```

## Known issues from code review (not yet checked in a browser)
- Many readable labels at 7–10px: `.reference-topbar`, `.service-option-copy small`,
  `.work-card small`, `.works-topbar`, `.reviews-intro-copy`, phone mock-up labels on mobile.
- Off-palette greys (#557087, #47647a, #4d7084, #42617a) → `--ink-muted`.
- ~15 different border radii and many off-scale spacings → snap to the system.
