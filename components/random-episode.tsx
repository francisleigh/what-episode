"use client";

import { useCallback, useEffect, useState } from "react";
import { Shuffle } from "lucide-react";

import { pickRandomEpisode, type Episode } from "@/lib/episodes";
import { Button } from "@/components/ui/button";
import { EpisodeCard } from "@/components/episode-card";

/**
 * Client island that owns the random-selection interaction.
 *
 * It receives the full (static) episode list from the server and picks on the
 * client *after mount* — this keeps the host page statically rendered and avoids
 * hydration mismatches, while isolating all non-determinism to this component.
 */
export function RandomEpisode({ episodes }: { episodes: Episode[] }) {
  const [current, setCurrent] = useState<Episode | null>(null);

  const shuffle = useCallback(() => {
    setCurrent((previous) => {
      if (episodes.length <= 1) return episodes[0] ?? null;
      // Avoid repeating the same episode twice in a row.
      let next = pickRandomEpisode(episodes) ?? null;
      while (next && previous && next === previous) {
        next = pickRandomEpisode(episodes) ?? null;
      }
      return next;
    });
  }, [episodes]);

  // First pick happens on mount only — never during SSR.
  useEffect(() => {
    shuffle();
  }, [shuffle]);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {current ? (
        <EpisodeCard episode={current} />
      ) : (
        <EpisodeCardSkeleton />
      )}

      <Button size="lg" onClick={shuffle} disabled={episodes.length === 0}>
        <Shuffle aria-hidden />
        Reshuffle
      </Button>

      {/* TODO(streaming): surface `current.streamingLinks` here as "Where to watch"
          badges (JustWatch / affiliate deep links) once the data is wired up. */}
    </div>
  );
}

/** Matches EpisodeCard dimensions to avoid layout shift before the first pick. */
function RandomEpisodeCardSkeletonInner() {
  return (
    <div className="w-full max-w-xl animate-pulse rounded-xl border border-border bg-card/40 p-6">
      <div className="mb-3 h-3 w-24 rounded bg-foreground/10" />
      <div className="mb-2 h-9 w-3/4 rounded bg-foreground/10" />
      <div className="mt-6 h-4 w-full rounded bg-foreground/10" />
      <div className="mt-2 h-4 w-5/6 rounded bg-foreground/10" />
    </div>
  );
}

const EpisodeCardSkeleton = RandomEpisodeCardSkeletonInner;
