import type { Episode, Show } from "./types";

/**
 * ───────────────────────────────────────────────────────────────────────────
 * PLACEHOLDER DATASET
 * ───────────────────────────────────────────────────────────────────────────
 * This is deliberately a *small, representative* sample, not the full catalogue.
 *
 * TODO(data): Replace these literals with the real episode catalogue. The likely
 * path is a build-time import from a generated JSON file (sourced from TMDB or a
 * maintained spreadsheet) that conforms to the `Show` / `Episode` types. Because
 * everything is typed and accessed through `lib/episodes/index.ts`, swapping the
 * source here will not require changes in the app/ layer.
 */

export const SHOWS: Show[] = [
  {
    slug: "us-office",
    title: "The Office (US)",
    description:
      "A mockumentary sitcom following the everyday absurdities of the staff at the Scranton branch of the Dunder Mifflin paper company.",
    network: "NBC",
    startYear: 2005,
    keywords: [
      "random us office episode",
      "what office episode should i watch",
      "best the office episodes",
      "the office random episode generator",
    ],
  },
  // TODO(data): add more shows (parks-and-rec, brooklyn-99, friends, ...).
];

/**
 * Episodes keyed by `showSlug`. Only a handful per show for now — enough to
 * exercise routing, random selection, and per-episode SEO pages.
 */
export const EPISODES: Record<string, Episode[]> = {
  "us-office": [
    {
      showSlug: "us-office",
      season: 1,
      episode: 1,
      title: "Pilot",
      description:
        "The documentary crew arrives at Dunder Mifflin and meets regional manager Michael Scott, who insists he is the world's best boss.",
      runtime: 23,
      tags: ["series premiere"],
    },
    {
      showSlug: "us-office",
      season: 2,
      episode: 1,
      title: "The Dundies",
      description:
        "Michael hosts the annual Dundie Awards at Chili's, and Pam has a night to remember.",
      runtime: 22,
      tags: ["fan favourite", "awards"],
    },
    {
      showSlug: "us-office",
      season: 2,
      episode: 22,
      title: "Casino Night",
      description:
        "The office holds a casino fundraiser in the warehouse, leading to a pivotal moment between Jim and Pam.",
      runtime: 28,
      tags: ["season finale", "jim and pam"],
    },
    {
      showSlug: "us-office",
      season: 3,
      episode: 23,
      title: "The Job",
      description:
        "Michael, Jim, and Karen interview for a corporate position in New York while Pam waits at her desk.",
      runtime: 28,
      tags: ["season finale", "fan favourite"],
    },
    {
      showSlug: "us-office",
      season: 5,
      episode: 14,
      title: "Stress Relief",
      description:
        "After Dwight stages a fire drill that triggers chaos, the staff undergo a tense CPR training and a roast of Michael.",
      runtime: 42,
      tags: ["super bowl episode", "fan favourite"],
    },
    {
      showSlug: "us-office",
      season: 7,
      episode: 22,
      title: "Goodbye, Michael",
      description:
        "Michael spends his final day in the office quietly saying goodbye to the people who mattered most.",
      runtime: 28,
      tags: ["emotional", "michael's last episode"],
    },
    // TODO(data): backfill the remaining episodes across all nine seasons.
  ],
};
