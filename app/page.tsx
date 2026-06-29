import { ArrowRight } from "lucide-react";

import { getAllShows } from "@/lib/episodes";
import { buttonVariants } from "@/components/ui/button";
import { TrackedLink } from "@/components/tracked-link";
import { cn } from "@/lib/utils";

// Static by default — the home page has no dynamic data, so it's prerendered
// at build time and served from the edge cache.
export default function HomePage() {
  const shows = getAllShows();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-12 px-6 py-20 text-center">
      <header className="flex flex-col items-center gap-6">
        <p className="font-display text-sm uppercase tracking-[0.4em] text-muted-foreground">
          What Episode
        </p>
        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          Don&apos;t know
          <br />
          what to watch?
        </h1>
        <p className="max-w-md text-balance text-lg text-muted-foreground">
          Stop scrolling. Pick a show and we&apos;ll choose an episode for you —
          at random, instantly.
        </p>
      </header>

      <section aria-labelledby="shows-heading" className="w-full">
        <h2
          id="shows-heading"
          className="mb-5 text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          Choose a show
        </h2>
        <ul className="flex flex-col gap-3">
          {shows.map((show) => (
            <li key={show.slug}>
              <TrackedLink
                event="show_select"
                data={{ show: show.slug }}
                href={`/${show.slug}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "group w-full justify-between text-lg",
                )}
              >
                {show.title}
                <ArrowRight
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </TrackedLink>
            </li>
          ))}
        </ul>
        {/* TODO(data): as the catalogue grows, replace this list with a
            searchable grid and group by genre. */}
      </section>
    </main>
  );
}
