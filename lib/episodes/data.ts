import type { Episode, Show } from "./types";
import generatedEpisodes from "./episodes.generated.json";

/**
 * ───────────────────────────────────────────────────────────────────────────
 * SHOW METADATA — hand-maintained, the source of truth.
 * ───────────────────────────────────────────────────────────────────────────
 * Episodes are fetched from TMDB into `episodes.generated.json` (see
 * `scripts/fetch-catalogue.ts`); this file owns the stable, editorial fields:
 * slug, title, description, JustWatch slug, SEO keywords, and production status.
 *
 * NOTE(justwatch): JustWatch slugs follow `title(-year)`. `the-office-2005` is
 * confirmed; the others are best-effort and should be spot-checked against
 * justwatch.com/uk/tv-series/<slug>. A wrong slug only breaks the outbound link,
 * not the app.
 */
function keywords(name: string): string[] {
  return [
    `random ${name} episode`,
    `what ${name} episode should i watch`,
    `best ${name} episodes`,
    `${name} random episode generator`,
  ];
}

export const SHOWS: Show[] = [
  {
    slug: "us-office",
    title: "The Office (US)",
    description:
      "A mockumentary sitcom following the everyday absurdities of the staff at the Scranton branch of the Dunder Mifflin paper company.",
    network: "NBC",
    startYear: 2005,
    status: "ended",
    justWatchSlug: "the-office-2005",
    keywords: keywords("the office"),
  },
  {
    slug: "friends",
    title: "Friends",
    description:
      "Six twenty-something friends navigate life, love, and careers in Manhattan, hanging out at their favourite coffee house, Central Perk.",
    network: "NBC",
    startYear: 1994,
    status: "ended",
    justWatchSlug: "friends",
    keywords: keywords("friends"),
  },
  {
    slug: "seinfeld",
    title: "Seinfeld",
    description:
      "Comedian Jerry Seinfeld and his neurotic friends find comedy in the minutiae of everyday life in New York City — the show famously about nothing.",
    network: "NBC",
    startYear: 1989,
    status: "ended",
    justWatchSlug: "seinfeld",
    keywords: keywords("seinfeld"),
  },
  {
    slug: "parks-and-recreation",
    title: "Parks and Recreation",
    description:
      "A mockumentary following Leslie Knope and the quirky public servants of the Parks Department in Pawnee, Indiana.",
    network: "NBC",
    startYear: 2009,
    status: "ended",
    justWatchSlug: "parks-and-recreation",
    keywords: keywords("parks and rec"),
  },
  {
    slug: "brooklyn-nine-nine",
    title: "Brooklyn Nine-Nine",
    description:
      "An immature but talented detective and his diverse colleagues solve crimes under a strait-laced new captain at Brooklyn's 99th Precinct.",
    network: "Fox / NBC",
    startYear: 2013,
    status: "ended",
    justWatchSlug: "brooklyn-nine-nine",
    keywords: keywords("brooklyn nine nine"),
  },
  {
    slug: "frasier",
    title: "Frasier",
    description:
      "Radio psychiatrist Dr. Frasier Crane returns to Seattle to host a call-in show, juggling his brother, his father, and a revolving cast of egos.",
    network: "NBC",
    startYear: 1993,
    status: "ended",
    justWatchSlug: "frasier-1993",
    keywords: keywords("frasier"),
  },
  {
    slug: "community",
    title: "Community",
    description:
      "A disbarred lawyer joins a community college study group that becomes an unlikely, pop-culture-obsessed family at Greendale.",
    network: "NBC / Yahoo!",
    startYear: 2009,
    status: "ended",
    justWatchSlug: "community",
    keywords: keywords("community"),
  },
  {
    slug: "psych",
    title: "Psych",
    description:
      "A police consultant with razor-sharp observation skills fakes being a psychic to solve cases alongside his reluctant best friend.",
    network: "USA Network",
    startYear: 2006,
    status: "ended",
    justWatchSlug: "psych",
    keywords: keywords("psych"),
  },
  {
    slug: "scrubs",
    title: "Scrubs",
    description:
      "The surreal, heartfelt misadventures of young doctors, nurses, and staff at Sacred Heart teaching hospital.",
    network: "NBC / ABC",
    startYear: 2001,
    status: "ended",
    justWatchSlug: "scrubs",
    keywords: keywords("scrubs"),
  },
  {
    slug: "malcolm-in-the-middle",
    title: "Malcolm in the Middle",
    description:
      "A gifted boy navigates the chaos of his dysfunctional working-class family in this single-camera comedy.",
    network: "Fox",
    startYear: 2000,
    status: "ended",
    justWatchSlug: "malcolm-in-the-middle",
    keywords: keywords("malcolm in the middle"),
  },
  {
    slug: "the-simpsons",
    title: "The Simpsons",
    description:
      "The satirical misadventures of the Simpson family — Homer, Marge, Bart, Lisa, and Maggie — in the chaotic town of Springfield.",
    network: "Fox",
    startYear: 1989,
    status: "running",
    justWatchSlug: "the-simpsons",
    keywords: keywords("simpsons"),
  },
];

/**
 * Episodes, keyed by `showSlug`. Generated from TMDB via `bun run fetch:catalogue`.
 * The committed JSON is the baseline; the refresh cron re-fetches "running" shows.
 */
export const EPISODES: Record<string, Episode[]> = generatedEpisodes as Record<
  string,
  Episode[]
>;
