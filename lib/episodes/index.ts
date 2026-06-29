import { EPISODES, SHOWS } from "./data";
import type { Episode, Show, ShowWithEpisodes } from "./types";

export type { Episode, Show, ShowWithEpisodes, StreamingLink } from "./types";

/**
 * Read API over the catalogue. Every consumer goes through these functions
 * rather than importing the raw data, so the backing store can change later
 * (DB, CMS, external API) behind the same synchronous interface.
 */

export function getAllShows(): Show[] {
  return SHOWS;
}

export function getShow(slug: string): Show | undefined {
  return SHOWS.find((s) => s.slug === slug);
}

export function getEpisodes(showSlug: string): Episode[] {
  return EPISODES[showSlug] ?? [];
}

export function getShowWithEpisodes(slug: string): ShowWithEpisodes | undefined {
  const show = getShow(slug);
  if (!show) return undefined;
  return { ...show, episodes: getEpisodes(slug) };
}

// ── Episode slugs (the canonical, indexable per-episode URL segment) ──────────

/** Format a season/episode pair as the route segment `s2e1`. */
export function episodeSlug(episode: Pick<Episode, "season" | "episode">): string {
  return `s${episode.season}e${episode.episode}`;
}

/** Parse an `s2e1` segment back into numbers. Returns null when malformed. */
export function parseEpisodeSlug(
  slug: string,
): { season: number; episode: number } | null {
  const match = /^s(\d+)e(\d+)$/i.exec(slug);
  if (!match) return null;
  return { season: Number(match[1]), episode: Number(match[2]) };
}

export function getEpisodeBySlug(
  showSlug: string,
  slug: string,
): Episode | undefined {
  const parsed = parseEpisodeSlug(slug);
  if (!parsed) return undefined;
  return getEpisodes(showSlug).find(
    (e) => e.season === parsed.season && e.episode === parsed.episode,
  );
}

// ── Random selection (isolated + pure) ────────────────────────────────────────

/**
 * Pick a random episode from a list.
 *
 * Randomness is injected via `rng` so callers can keep things deterministic
 * (e.g. server rendering, tests) by passing a seeded generator. Defaults to
 * `Math.random` for genuine shuffles in the browser.
 */
export function pickRandomEpisode(
  episodes: Episode[],
  rng: () => number = Math.random,
): Episode | undefined {
  if (episodes.length === 0) return undefined;
  return episodes[Math.floor(rng() * episodes.length)];
}

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
