# Full Random ("Surprise me") Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a primary "Surprise me" button to the home page that navigates to a uniformly-random show's uniformly-random episode at its real `/[show]/sNeM` URL.

**Architecture:** A pure, `rng`-injectable picker (`pickRandomShowEpisode`) lives in the data layer beside `pickRandomEpisode`. The home page (a server component) derives a compact `Record<showSlug, episodeSlug[]>` index from the existing catalogue and passes it to a small `"use client"` button that picks and navigates in the browser. A companion `/surprise-me` server route does the same pick and 307-redirects, giving a shareable entry URL; it is the only dynamic route, everything else stays statically rendered.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4, shadcn/ui `Button`, `lucide-react` `Dices`, `@vercel/analytics`, `bun` + built-in `bun test`.

## Global Constraints

- The in-app button stays static + offline: `app/page.tsx` remains a server component and the button picks client-side. The ONLY dynamic route is `/surprise-me` (Task 3), a per-request redirect; no other route becomes dynamic.
- Button is the primary variant (`default` — filled white-on-black), `size="lg"`, full width (`w-full`), `Dices` icon, label exactly `Surprise me`.
- Randomness: pick a show uniformly, then an episode uniformly within that show (equal chance per show — do NOT pick uniformly over all episodes).
- Analytics event name is exactly `full_random` with payload `{ show, episode }`.
- Reuse the existing `episodeSlug` helper. The only data-layer additions are `pickRandomShowEpisode` and `getEpisodeIndex` (Task 1); the index-building logic lives ONLY in `getEpisodeIndex` — never inline it in `app/page.tsx` or the route.
- Episode slug format is `s${season}e${episode}` (e.g. `s3e4`), produced by `episodeSlug`.
- Code comments kept to a minimum (only non-obvious reasons), per repo policy.
- Every commit message ends with: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

### Task 1: Pure full-random picker

**Files:**
- Modify: `lib/episodes/index.ts` (add `pickRandomShowEpisode`, after `pickRandomEpisode`)
- Test: `lib/episodes/full-random.test.ts` (create)

**Interfaces:**
- Consumes: existing `getAllShows`, `getEpisodes`, `episodeSlug` from the same module.
- Produces (both exported from `@/lib/episodes`, consumed by Tasks 2 and 3):
  - `pickRandomShowEpisode(index: Record<string, string[]>, rng?: () => number): { show: string; episode: string } | null`
  - `getEpisodeIndex(): Record<string, string[]>` — the single source of truth for the show→episode-slug map used by both the home-page button and the `/surprise-me` route.

- [ ] **Step 1: Write the failing test**

Create `lib/episodes/full-random.test.ts`:

```ts
import { test, expect } from "bun:test";

import {
  getAllShows,
  getEpisodes,
  getEpisodeIndex,
  pickRandomShowEpisode,
} from "./index";

/** Deterministic rng: returns the given values in order, then cycles. */
function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

test("picks the show then episode addressed by the rng sequence", () => {
  const index = { a: ["s1e1", "s1e2"], b: ["s2e1"] };
  // show: floor(0.6 * 2) = 1 → "b"; episode: floor(0 * 1) = 0 → "s2e1"
  expect(pickRandomShowEpisode(index, seq([0.6, 0]))).toEqual({
    show: "b",
    episode: "s2e1",
  });
});

test("the picked episode belongs to the picked show", () => {
  const index = { a: ["s1e1", "s1e2"], b: ["s2e1"] };
  // show: floor(0 * 2) = 0 → "a"; episode: floor(0.9 * 2) = 1 → "s1e2"
  expect(pickRandomShowEpisode(index, seq([0, 0.9]))).toEqual({
    show: "a",
    episode: "s1e2",
  });
});

test("returns null for an empty index", () => {
  expect(pickRandomShowEpisode({}, seq([0]))).toBeNull();
});

test("getEpisodeIndex maps every show slug to its episode slugs", () => {
  const index = getEpisodeIndex();
  const shows = getAllShows();
  expect(Object.keys(index).sort()).toEqual(shows.map((s) => s.slug).sort());
  for (const show of shows) {
    expect(index[show.slug].length).toBe(getEpisodes(show.slug).length);
  }
});

test("getEpisodeIndex values are well-formed episode slugs", () => {
  const all = Object.values(getEpisodeIndex()).flat();
  expect(all.length).toBeGreaterThan(0);
  expect(all.every((slug) => /^s\d+e\d+$/.test(slug))).toBe(true);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test lib/episodes/full-random.test.ts`
Expected: FAIL — `pickRandomShowEpisode` / `getEpisodeIndex` not exported.

- [ ] **Step 3: Write the minimal implementation**

In `lib/episodes/index.ts`, add at the end of the file (after `pickRandomEpisode`):

```ts
/**
 * Full-random pick: a uniformly-random show, then a uniformly-random episode
 * within it (so large catalogues don't dominate). `index` maps show slug →
 * episode slugs (e.g. "s3e4"). `rng` is injectable for deterministic tests,
 * mirroring `pickRandomEpisode`. Returns null for an empty index.
 */
export function pickRandomShowEpisode(
  index: Record<string, string[]>,
  rng: () => number = Math.random,
): { show: string; episode: string } | null {
  const slugs = Object.keys(index);
  if (slugs.length === 0) return null;
  const show = slugs[Math.floor(rng() * slugs.length)];
  const episodes = index[show];
  if (!episodes || episodes.length === 0) return null;
  const episode = episodes[Math.floor(rng() * episodes.length)];
  return { show, episode };
}

/**
 * Compact show→episode-slug index for the full-random pickers. The single
 * definition shared by the home-page button and the /surprise-me route.
 */
export function getEpisodeIndex(): Record<string, string[]> {
  return Object.fromEntries(
    getAllShows().map((s) => [s.slug, getEpisodes(s.slug).map(episodeSlug)]),
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test lib/episodes/full-random.test.ts`
Expected: PASS — 5 pass, 0 fail.

- [ ] **Step 5: Type-check**

Run: `bun run check-types`
Expected: no output, exit 0.

- [ ] **Step 6: Commit**

```bash
git add lib/episodes/index.ts lib/episodes/full-random.test.ts
git commit -m "feat(random): add full-random picker and episode index helper

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: "Surprise me" button + home page wiring

**Files:**
- Create: `components/full-random-button.tsx`
- Modify: `app/page.tsx` (imports + render the button between `<header>` and the shows `<section>`)

**Interfaces:**
- Consumes: `pickRandomShowEpisode`, `getAllShows`, `getEpisodeIndex` from `@/lib/episodes` (Task 1); `Button` from `@/components/ui/button`.
- Produces: `<FullRandomButton episodeIndex={Record<string, string[]>} />` (default export not used; named export `FullRandomButton`).

- [ ] **Step 1: Create the client component**

Create `components/full-random-button.tsx`:

```tsx
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dices } from "lucide-react";
import { track } from "@vercel/analytics";

import { pickRandomShowEpisode } from "@/lib/episodes";
import { Button } from "@/components/ui/button";

/**
 * Client island for the "Surprise me" full-random pick. Receives a compact
 * show→episode-slug index from the (static) home page, picks in the browser,
 * and navigates to that episode's page — keeping the host page server-rendered
 * while isolating the non-determinism here.
 */
export function FullRandomButton({
  episodeIndex,
}: {
  episodeIndex: Record<string, string[]>;
}) {
  const router = useRouter();

  const surprise = useCallback(() => {
    const pick = pickRandomShowEpisode(episodeIndex);
    if (!pick) return;
    track("full_random", { show: pick.show, episode: pick.episode });
    router.push(`/${pick.show}/${pick.episode}`);
  }, [episodeIndex, router]);

  return (
    <Button
      size="lg"
      onClick={surprise}
      className="w-full"
      disabled={Object.keys(episodeIndex).length === 0}
    >
      <Dices aria-hidden />
      Surprise me
    </Button>
  );
}
```

- [ ] **Step 2: Wire it into the home page**

In `app/page.tsx`:

Replace the import line:

```tsx
import { getAllShows } from "@/lib/episodes";
```

with:

```tsx
import { getAllShows, getEpisodeIndex } from "@/lib/episodes";
import { FullRandomButton } from "@/components/full-random-button";
```

Inside `HomePage`, after `const shows = getAllShows();`, add:

```tsx
  const episodeIndex = getEpisodeIndex();
```

Then insert the button between the closing `</header>` and the opening
`<section aria-labelledby="shows-heading" ...>`:

```tsx
      </header>

      <FullRandomButton episodeIndex={episodeIndex} />

      <section aria-labelledby="shows-heading" className="w-full">
```

- [ ] **Step 3: Type-check**

Run: `bun run check-types`
Expected: no output, exit 0.

- [ ] **Step 4: Production build (proves the page stays static)**

Run: `bun run build`
Expected: build succeeds; `/` is listed as a static/prerendered route (a `○` / "Static" marker, not `ƒ`/Dynamic). No new dynamic routes appear.

- [ ] **Step 5: Manual verification**

Run: `bun dev`, open http://localhost:3000.
Confirm:
- A filled "Surprise me" button with a dice icon sits directly below the hero, above "Choose a show".
- Clicking it lands on a `/[show]/sNeM` URL; the episode page renders that episode.
- Repeated clicks reach different shows and episodes.
- Reloading the landed URL shows the same episode (shareable); back-navigation returns to home.

- [ ] **Step 6: Commit**

```bash
git add components/full-random-button.tsx app/page.tsx
git commit -m "feat(home): add \"Surprise me\" full-random button

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `/surprise-me` server redirect route

**Files:**
- Create: `app/surprise-me/route.ts`
- Modify: `app/robots.ts` (add `disallow` for the redirector)

**Interfaces:**
- Consumes: `getEpisodeIndex`, `pickRandomShowEpisode` from `@/lib/episodes` (Task 1).
- Produces: a `GET /surprise-me` endpoint that 307-redirects to `/[show]/sNeM`.

- [ ] **Step 1: Create the route handler**

Create `app/surprise-me/route.ts`:

```ts
import { redirect } from "next/navigation";

import { getEpisodeIndex, pickRandomShowEpisode } from "@/lib/episodes";

// Per-request so each visit redirects to a different random episode; a cached
// response would pin everyone to one episode.
export const dynamic = "force-dynamic";

export function GET() {
  const pick = pickRandomShowEpisode(getEpisodeIndex());
  redirect(pick ? `/${pick.show}/${pick.episode}` : "/");
}
```

- [ ] **Step 2: Keep crawlers off the redirector**

In `app/robots.ts`, change the rules object from:

```ts
    rules: { userAgent: "*", allow: "/" },
```

to:

```ts
    rules: { userAgent: "*", allow: "/", disallow: "/surprise-me" },
```

- [ ] **Step 3: Type-check**

Run: `bun run check-types`
Expected: no output, exit 0.

- [ ] **Step 4: Production build (proves only this route is dynamic)**

Run: `bun run build`
Expected: build succeeds; `/surprise-me` is listed as a Dynamic (`ƒ`) route and every other route (`/`, `/[show]`, `/[show]/[episode]`) remains static (`○`).

- [ ] **Step 5: Verify the redirect**

Run: `bun dev`, then in another shell:

```bash
curl -sI http://localhost:3000/surprise-me | grep -i -E "^(HTTP|location)"
```

Expected: an HTTP `307` status and a `location:` header pointing at a
`/<show>/sNeM` path. Run the `curl` a few times — the `location` target varies.

- [ ] **Step 6: Commit**

```bash
git add app/surprise-me/route.ts app/robots.ts
git commit -m "feat(surprise-me): add /surprise-me redirect route

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Primary filled button, top placement, `Dices`, "Surprise me", `w-full` → Task 2, Steps 1–2 + Global Constraints. ✓
- Lands on specific shareable `/[show]/sNeM` URL → Task 2, Steps 1, 5. ✓
- Server-derived compact index, no drift → Task 2, Step 2. ✓
- Stays static / no dynamic route / PWA-offline → Global Constraints + Task 2, Step 4. ✓
- Uniform over shows then episodes → Task 1 impl + tests. ✓
- Analytics `full_random` `{ show, episode }` → Task 2, Step 1. ✓
- Index-building DRY: defined once in `getEpisodeIndex` (Task 1), consumed by both `app/page.tsx` (Task 2) and the route (Task 3) — no inline duplication. ✓
- `/surprise-me` server redirect, `force-dynamic`, shares `pickRandomShowEpisode` + `getEpisodeIndex`, only dynamic route → Task 3. ✓
- Crawler treatment (`robots.ts` disallow), no sitemap change → Task 3, Step 2. ✓
- Edge case empty index → Task 1 (returns null) + Task 2 (`disabled`, early return) + Task 3 (`redirect("/")` fallback). ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to" — all steps contain concrete code/commands. ✓

**Type consistency:** `pickRandomShowEpisode(index, rng?)` returning `{ show, episode } | null` is defined identically in Task 1 and consumed in Task 2; `episodeIndex: Record<string, string[]>` prop name matches between component and page. ✓
