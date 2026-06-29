import Link from "next/link";
import { Clock } from "lucide-react";

import { episodeSlug, type Episode } from "@/lib/episodes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Presentational, server-safe card for a single episode. Pure render — no state,
 * no client hooks — so it can be used in both server and client trees.
 */
export function EpisodeCard({
  episode,
  className,
}: {
  episode: Episode;
  className?: string;
}) {
  const code = `S${episode.season} · E${episode.episode}`;

  return (
    <Card className={cn("w-full max-w-xl bg-card/40 backdrop-blur", className)}>
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>{code}</span>
          {episode.runtime ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden /> {episode.runtime} min
            </span>
          ) : null}
        </div>
        <Link
          href={`/${episode.showSlug}/${episodeSlug(episode)}`}
          className="text-3xl font-semibold leading-tight tracking-tight underline-offset-4 hover:underline sm:text-4xl"
        >
          {episode.title}
        </Link>
      </CardHeader>
      {episode.description ? (
        <CardContent>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {episode.description}
          </p>
          {episode.tags && episode.tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {episode.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border px-3 py-1 text-xs lowercase tracking-wide text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
