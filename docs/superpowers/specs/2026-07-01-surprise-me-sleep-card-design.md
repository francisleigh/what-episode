# Design: reframe "Surprise me" as a sleep-framed clickable card

**Date:** 2026-07-01
**Status:** Approved

## Goal

Reframe the home-page full-random CTA from a plain button into a card aimed at
someone who's about to fall asleep and just wants *something* on in the
background — they don't care what, they just want it on. Same location on the
page, same behaviour, new shape and voice.

## Scope

**Presentation and copy only.** The random-pick logic is unchanged:

- `pickRandomShowEpisode(episodeIndex)` still does the full-random pick.
- `track("full_random", { show, episode })` analytics is unchanged.
- The `episodeIndex` prop and the disabled-when-empty guard are unchanged.
- Placement in `app/page.tsx` is unchanged (between the header and the
  "Choose a show" section).

Out of scope: biasing the pick toward "comfort"/background content, changing
the picking algorithm, or adding new behavioural niceties.

## Component

`components/full-random-button.tsx` remains the single client island. The
filename and the exported `FullRandomButton` name are kept so `app/page.tsx`'s
import and the `"full_random"` analytics key are untouched — the reframe is
skin-deep by design.

Internally it changes from rendering `<Button>` to rendering a **clickable
card** in an icon-left row layout:

```
┌────────────────────────────────────────────┐
│                                              │
│  🌙   I really don't care                →   │
│       Eyes half shut? Tap and we'll          │
│       drift you into whatever's next.        │
│                                              │
└────────────────────────────────────────────┘
```

- **Left:** `Moon` icon (lucide-react), replacing the previous `Dices` icon, to
  lean into the sleep framing.
- **Middle:** title **"I really don't care"** (leans into the just-put-
  something-on mood) and subline
  **"Eyes half shut? Tap and we'll drift you into whatever's next."**
- **Right:** `ArrowRight` (lucide-react) with the same
  `group-hover:translate-x-1` nudge the "Choose a show" buttons use, so it feels
  native to the page.

## Markup & accessibility

The whole card is a single semantic `<button>` (full width), styled with the
card look (`rounded-xl border border-border bg-card text-card-foreground`,
padding, hover state). It is **not** a `Card` `<div>` with a click handler.

Rationale: the action is client-side navigation via `router.push`, not an
`href`, so it is genuinely a button. A real `<button>` gives keyboard focus,
Enter/Space activation, and screen-reader semantics for free. We reuse the
card's *visual classes* without inheriting the non-interactive `div` semantics.

Focus, disabled, and icon-sizing styling follow the existing `buttonVariants`
conventions in `components/ui/button.tsx`
(`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`,
`disabled:opacity-50 disabled:pointer-events-none`).

## Testing / verification

This repo has no test runner wired up (no `test` script in `package.json`), so
verification is:

1. `bun run check-types` — passes.
2. `bun run lint` — passes.
3. Local visual check: card renders in the correct slot, is keyboard-focusable,
   activates on click and on Enter/Space, and navigates to a random episode.
