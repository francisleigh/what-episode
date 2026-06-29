/**
 * Domain types for the episode catalogue.
 *
 * These are intentionally storage-agnostic: today they are satisfied by the
 * static placeholder data in `./data`, but the same shapes can later be hydrated
 * from a database, CMS, or an external API (e.g. TMDB) without consumers changing.
 */

/** Where a viewer can watch — placeholder for future JustWatch / deep-link data. */
export interface StreamingLink {
  /** Display name, e.g. "Netflix", "Peacock". */
  provider: string;
  /** Deep link to the title on that provider. */
  url: string;
  /** Commercial model, useful for "free with subscription" vs "rent/buy" badges. */
  type: "subscription" | "rent" | "buy" | "free" | "ads";
}

export interface Episode {
  /** Foreign key back to the owning {@link Show}. */
  showSlug: string;
  season: number;
  /** Episode number within the season (1-indexed). */
  episode: number;
  title: string;
  description?: string;
  /** Runtime in minutes. */
  runtime?: number;
  /** Free-form tags for filtering / theming, e.g. ["bottle episode", "fan favourite"]. */
  tags?: string[];
  /** TODO: populate from JustWatch or affiliate feeds. */
  streamingLinks?: StreamingLink[];
}

export interface Show {
  /** URL-safe identifier and route segment, e.g. "us-office". */
  slug: string;
  /** Human title, e.g. "The Office (US)". */
  title: string;
  /** Short, indexable summary used in metadata and on the show page. */
  description: string;
  /** Originating network/streamer — handy for "Where to watch" and JSON-LD. */
  network?: string;
  /**
   * Production status. Drives the refresh cron: only "running" shows are
   * re-fetched from TMDB on a schedule (ended shows never gain episodes).
   */
  status: "running" | "ended";
  /** First air year — feeds JSON-LD `startDate` and disambiguates reboots. */
  startYear?: number;
  /**
   * JustWatch title slug used to build "Where to watch" deep links, e.g.
   * "the-office-2005" → justwatch.com/uk/tv-series/the-office-2005. URLs are
   * derived from this in `lib/justwatch.ts`; we never store full URLs here.
   */
  justWatchSlug?: string;
  /**
   * SEO keyword seeds for this show. These mirror real search intent
   * ("random us office episode", "what office episode should i watch") and are
   * surfaced in metadata + the on-page FAQ.
   */
  keywords?: string[];
}

/** A show joined with its episodes — the shape most UI surfaces consume. */
export interface ShowWithEpisodes extends Show {
  episodes: Episode[];
}
