import { ExternalLink } from "lucide-react";

import type { Show } from "@/lib/episodes";
import {
  JUSTWATCH_REGION,
  justWatchSeasonUrl,
  justWatchSeriesUrl,
} from "@/lib/justwatch";
import { buttonVariants } from "@/components/ui/button";
import { TrackedLink } from "@/components/tracked-link";
import { cn } from "@/lib/utils";

/**
 * "Where to watch" — deep-links to JustWatch for regional streaming/rent/buy
 * availability. Links to the specific season when one is given, with a fallback
 * link to the full series. Renders nothing when the show has no JustWatch slug.
 */
export function WhereToWatch({
  show,
  season,
  className,
}: {
  show: Show;
  season?: number;
  className?: string;
}) {
  const seasonUrl = season ? justWatchSeasonUrl(show, season) : null;
  const seriesUrl = justWatchSeriesUrl(show);
  const primaryUrl = seasonUrl ?? seriesUrl;

  if (!primaryUrl) return null;

  return (
    <section
      aria-label="Where to watch"
      className={cn(
        "flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-border p-6 text-center",
        className,
      )}
    >
      <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Where to watch
      </h2>

      <TrackedLink
        external
        event="justwatch_click"
        data={{ show: show.slug, season: season ?? null }}
        href={primaryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size: "lg" }))}
      >
        <ExternalLink aria-hidden />
        {season ? `Watch Season ${season} on JustWatch` : "Find it on JustWatch"}
      </TrackedLink>

      {seasonUrl && seriesUrl ? (
        <TrackedLink
          external
          event="browse_all_seasons"
          data={{ show: show.slug }}
          href={seriesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Browse all seasons
        </TrackedLink>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Streaming availability via JustWatch ({JUSTWATCH_REGION.toUpperCase()}).
      </p>
    </section>
  );
}
