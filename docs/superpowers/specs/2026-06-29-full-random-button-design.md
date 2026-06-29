# Full Random ("Surprise me") — Design

**Date:** 2026-06-29
**Status:** Approved for implementation

## Summary

Add a single "Surprise me" button to the home page that picks a random show
**and** a random episode, for visitors who don't want to choose a show at all.

The button navigates directly to that episode's page (`/[show]/sNeM`) — a real,
shareable, indexable URL. It is not a dead end: the episode page links back to
the series and home, so deep-linking to one episode is a feature (easy to share
a specific pick with someone), not a trap.

A companion route, **`/surprise-me`**, is a server-side redirect that does the
same pick and 307s straight to a random episode. This gives a shareable,
bookmarkable entry URL — open `/surprise-me` (from a link, bookmark, or typed
address) and land on a random episode every time. The in-app button does NOT
route through it; the button keeps its instant client-side pick (offline-capable,
no round-trip), while `/surprise-me` serves direct/external landings.

## Motivation

The home page hero already says *"Don't know what to watch? Stop scrolling."*
The fastest path — not even choosing a show — has no entry point today. This
feature provides it as the primary call-to-action, and lands on a concrete,
linkable episode the visitor can act on or share immediately.

## Approach

### Landing on a specific episode URL

Navigating to `/[show]/sNeM` requires picking a real episode slug at click time.
The home page does not currently have episode data, so we supply a compact
index.

- **Cost is negligible.** A `Record<showSlug, episodeSlug[]>` index over the
  full catalogue (2,549 episodes) is 19.6 KB raw / **2.2 KB gzipped**.
- **Derived server-side, never drifts.** The home page is a server component;
  it builds the index from the existing data layer
  (`getEpisodes(slug).map(episodeSlug)`) and passes it to the client button.
  No separate generated file, no sync step.
- **The button stays fully static and offline-capable.** The home page and the
  button render statically; the pick + navigation happen client-side, so the
  in-app "Surprise me" works offline as a PWA with no server round-trip. The
  only dynamic route in the app is `/surprise-me` (below), a deliberate,
  isolated exception whose whole purpose is a per-request redirect.

### Direct entry: the `/surprise-me` redirect route

A server route handler at `app/surprise-me/route.ts` provides a shareable,
bookmarkable URL that always redirects to a random episode:

- Marked `export const dynamic = "force-dynamic"` so it runs per request (a
  cached/static response would always send everyone to the same episode).
- On GET: builds the same `Record<slug, episodeSlug[]>` index server-side from
  the data layer, calls the shared `pickRandomShowEpisode` helper, and
  `redirect(\`/${show}/${episode}\`)` (Next's `redirect()` issues a 307 from a
  route handler). Falls back to `redirect("/")` if the index is somehow empty.
- It is the one dynamic route; everything else stays statically prerendered.
- Crawler treatment: add `/surprise-me` to `robots.ts` `disallow` so crawlers
  don't chase the random redirect. It is not in the sitemap (the sitemap only
  enumerates shows/episodes), so no sitemap change is needed.
- Analytics: the client button fires `track("full_random", …)` on click as
  before. Direct `/surprise-me` hits are server-side and are not client-tracked;
  adding server-side analytics is out of scope.
- DRY: the route and the button share one picking implementation
  (`pickRandomShowEpisode`); only the call site (server vs client) differs.

### Client/server split

The button must be a client component: it uses `Math.random()` and client-side
navigation, both of which must run per-click in the browser (not at build time).
This mirrors how `RandomEpisode` isolates non-determinism into a `"use client"`
island while the host page stays statically rendered. `app/page.tsx` remains a
server component and only computes the (serializable) index.

### Randomness: uniform over shows, then over episodes

Pick a show uniformly at random, then an episode uniformly within that show.
Every show has an equal chance. (The alternative — uniform over all 2,549
episodes — would over-represent large catalogues, e.g. The Simpsons ~31% of
the time. "Picks the show as well as the episode" reads as two deliberate
picks, so equal-per-show is the chosen behavior.)

## Components

### New: `components/full-random-button.tsx` (`"use client"`)

- **Props:** `{ episodeIndex: Record<string, string[]> }` — show slug → its
  episode slugs (e.g. `{ "peep-show": ["s1e1", "s1e2", ...] }`).
- **On click:**
  1. Pick a show slug uniformly:
     `slugs[Math.floor(Math.random() * slugs.length)]` where
     `slugs = Object.keys(episodeIndex)`.
  2. Pick an episode slug uniformly within that show's array.
  3. Fire analytics: `track("full_random", { show, episode })` (fire-and-forget
     via `@vercel/analytics`, matching `TrackedLink`).
  4. Navigate: `useRouter().push(\`/${show}/${episode}\`)` from
     `next/navigation`.
- **Render:** `<Button variant="default" size="lg">` (filled white-on-black,
  the primary variant) with a `Dices` icon from `lucide-react` and the label
  **"Surprise me"**. Full width (`w-full`) to match the show-list buttons.
  - Icon rationale: `Dices` signals "luck / full random" and is distinct from
    the `Shuffle` icon `RandomEpisode` already uses for "Reshuffle".

A dedicated component (rather than reusing `TrackedLink`) is required because
the destination is computed at click time; `TrackedLink` expects a fixed `href`.

### Changed: `app/page.tsx`

- Stays a server component.
- Build the index from the data layer:
  `Object.fromEntries(shows.map((s) => [s.slug, getEpisodes(s.slug).map(episodeSlug)]))`.
- Insert `<FullRandomButton episodeIndex={index} />` between the `<header>` and
  the `<section aria-labelledby="shows-heading">` (the "Choose a show" list).
  This places the primary CTA at the top, where it stays discoverable as the
  catalogue grows.

No other files change. The data layer, routing, and per-show/episode pages are
untouched (the `episodeSlug` helper from `@/lib/episodes` is reused, not
modified).

## Data flow

```
Home (server)
  builds Record<slug, episodeSlug[]> via getEpisodes + episodeSlug
        │  passes index (≈2.2 KB gz) as a prop
        ▼
FullRandomButton (client)
        │ click → pick random show → pick random episode slug
        │ track("full_random", { show, episode })
        ▼
router.push(`/${show}/${episodeSlug}`)
        ▼
/[show]/[episode] page (existing, static, shareable URL)
```

## Visual placement

```
Don't know what to watch?
Stop scrolling...

┌───────────────────────────┐
│  ⚄  Surprise me           │   ← filled primary, full width
└───────────────────────────┘

CHOOSE A SHOW
┌──────────┐  ┌──────────┐
│ Friends  │  │ Seinfeld │  ...   ← existing outline buttons
└──────────┘  └──────────┘
```

## Edge cases

- The index is always non-empty (12 shows, every show has episodes), so both
  picks always resolve; no empty-state handling needed.
- We ship real episode slugs, so there is no dependence on episode numbering
  being contiguous.
- `track()` is fire-and-forget (`sendBeacon`) and never blocks navigation.
- No "avoid repeat" logic: each click is an independent one-shot navigation, so
  there is no "previous" pick to compare against (unlike `RandomEpisode`'s
  reshuffle).

## Out of scope

- Server-side analytics for direct `/surprise-me` hits.
- Re-rolling from the destination page beyond the episode page's existing
  `RandomEpisode` reshuffle (which re-picks within the landed show only).
- Any change to the per-show or per-episode random behavior or the data layer.

## Verification

- `bun run check-types` passes clean.
- `bun run build`: `/surprise-me` is the only dynamic (`ƒ`) route; all others
  stay static (`○`).
- Manual `bun dev`: clicking "Surprise me" repeatedly lands on varied shows and
  episodes at real `/[show]/sNeM` URLs; the URL is shareable (reload shows the
  same episode); back-navigation to the series/home works.
- `curl -sI localhost:3000/surprise-me` returns `307` with a `location:
  /<show>/sNeM` header; repeated calls vary the target.
