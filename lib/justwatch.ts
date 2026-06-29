import type { Show } from "./episodes";

/**
 * JustWatch deep-link builders for the "Where to watch" surface.
 *
 * JustWatch aggregates regional streaming/rent/buy availability, so a single
 * link covers every provider. URLs are derived from a show's `justWatchSlug`
 * plus a region — we never store full URLs in the dataset.
 *
 * TODO(region): drive the region from geo/IP or a user preference. Hardcoded to
 * UK for now to match the catalogue's link format.
 */
export const JUSTWATCH_REGION = "uk";

const JUSTWATCH_BASE = "https://www.justwatch.com";

/** Series page, e.g. https://www.justwatch.com/uk/tv-series/the-office-2005 */
export function justWatchSeriesUrl(
  show: Pick<Show, "justWatchSlug">,
): string | null {
  if (!show.justWatchSlug) return null;
  return `${JUSTWATCH_BASE}/${JUSTWATCH_REGION}/tv-series/${show.justWatchSlug}`;
}

/** Season page, e.g. .../the-office-2005/season-2 */
export function justWatchSeasonUrl(
  show: Pick<Show, "justWatchSlug">,
  season: number,
): string | null {
  const series = justWatchSeriesUrl(show);
  return series ? `${series}/season-${season}` : null;
}
