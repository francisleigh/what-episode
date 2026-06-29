/**
 * Fetches the full episode catalogue from TMDB and writes it to
 * `lib/episodes/episodes.generated.json` (committed, imported by the data layer).
 *
 * Usage:
 *   1. Put a TMDB credential in `.env.local` (gitignored, auto-loaded by Bun):
 *        TMDB_ACCESS_TOKEN=...   (v4 read access token — preferred)
 *      or
 *        TMDB_API_KEY=...        (v3 api key)
 *   2. bun run fetch:catalogue
 *
 * Show metadata (slug, title, year, JustWatch slug, keywords) lives in
 * `lib/episodes/data.ts` — this script only resolves and fetches *episodes*,
 * so the two never drift. Shows are matched on TMDB by name + first-air-year.
 */
import { SHOWS } from "../lib/episodes/data";
import existingCatalogue from "../lib/episodes/episodes.generated.json";
import type { Episode } from "../lib/episodes/types";

const TOKEN = process.env.TMDB_ACCESS_TOKEN;
const API_KEY = process.env.TMDB_API_KEY;

const BASE = "https://api.themoviedb.org/3";

/** Search-query overrides where the display title isn't the best TMDB query. */
const QUERY_OVERRIDES: Record<string, string> = {
  "us-office": "The Office",
};

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const headers: Record<string, string> = { accept: "application/json" };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  else url.searchParams.set("api_key", API_KEY!);

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`TMDB ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json() as Promise<T>;
}

interface TmdbSearchResult {
  results: Array<{ id: number; name: string; first_air_date?: string }>;
}
interface TmdbShow {
  id: number;
  number_of_seasons: number;
}
interface TmdbSeason {
  episodes: Array<{
    season_number: number;
    episode_number: number;
    name: string;
    overview?: string;
    runtime?: number | null;
  }>;
}

async function resolveTmdbId(query: string, year?: number): Promise<number> {
  const params: Record<string, string> = { query };
  if (year) params.first_air_date_year = String(year);
  const search = await tmdb<TmdbSearchResult>("/search/tv", params);
  const hit = search.results[0];
  if (!hit) throw new Error(`No TMDB match for "${query}" (${year ?? "any year"})`);
  return hit.id;
}

async function fetchEpisodesForShow(slug: string): Promise<Episode[]> {
  const show = SHOWS.find((s) => s.slug === slug)!;
  const query = QUERY_OVERRIDES[slug] ?? show.title;
  const id = await resolveTmdbId(query, show.startYear);
  const details = await tmdb<TmdbShow>(`/tv/${id}`);

  const seasonNumbers = Array.from(
    { length: details.number_of_seasons },
    (_, i) => i + 1,
  );

  // Seasons fetched in parallel; season 0 (specials) is excluded by construction.
  const seasons = await Promise.all(
    seasonNumbers.map((n) => tmdb<TmdbSeason>(`/tv/${id}/season/${n}`)),
  );

  const episodes: Episode[] = seasons.flatMap((season) =>
    season.episodes.map((ep) => ({
      showSlug: slug,
      season: ep.season_number,
      episode: ep.episode_number,
      title: ep.name,
      ...(ep.overview ? { description: ep.overview } : {}),
      ...(ep.runtime ? { runtime: ep.runtime } : {}),
    })),
  );

  return episodes;
}

async function main() {
  // `--running-only` (used by the refresh cron) refreshes just the shows still
  // in production and preserves the committed episodes for everything else.
  const runningOnly = process.argv.includes("--running-only");
  const targets = runningOnly
    ? SHOWS.filter((s) => s.status === "running")
    : SHOWS;

  // Missing creds is a hard error for a full fetch, but only a skip for the
  // running-only refresh — so a normal build never fails when there's nothing
  // to refresh and no token configured.
  if (!TOKEN && !API_KEY) {
    const msg =
      "Missing TMDB credentials (TMDB_ACCESS_TOKEN or TMDB_API_KEY in .env.local).";
    if (runningOnly) {
      console.warn(`${msg} Skipping refresh; using committed catalogue.`);
      return;
    }
    console.error(msg);
    process.exit(1);
  }

  const catalogue: Record<string, Episode[]> = runningOnly
    ? { ...(existingCatalogue as Record<string, Episode[]>) }
    : {};

  if (runningOnly && targets.length === 0) {
    console.log("No shows marked as running — nothing to refresh.");
    return;
  }

  // Sequential across shows to stay well within TMDB rate limits.
  for (const show of targets) {
    process.stdout.write(`Fetching ${show.title} … `);
    const episodes = await fetchEpisodesForShow(show.slug);
    catalogue[show.slug] = episodes;
    console.log(`${episodes.length} episodes`);
  }

  const outPath = new URL(
    "../lib/episodes/episodes.generated.json",
    import.meta.url,
  );
  await Bun.write(outPath, JSON.stringify(catalogue, null, 2) + "\n");

  const total = Object.values(catalogue).reduce((n, e) => n + e.length, 0);
  console.log(`\nWrote ${total} episodes across ${SHOWS.length} shows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
