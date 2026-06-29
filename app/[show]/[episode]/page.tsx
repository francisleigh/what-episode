import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Shuffle } from "lucide-react";

import {
  episodeSlug,
  getAllShows,
  getEpisodeBySlug,
  getEpisodes,
  getShow,
} from "@/lib/episodes";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { TrackedLink } from "@/components/tracked-link";
import { EpisodeCard } from "@/components/episode-card";
import { WhereToWatch } from "@/components/where-to-watch";
import { buttonVariants } from "@/components/ui/button";
import { breadcrumbJsonLd, episodeJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

// Pre-render a static page for every known episode of every show. This is what
// gives long-tail SEO coverage — one indexable URL per episode.
export function generateStaticParams() {
  return getAllShows().flatMap((show) =>
    getEpisodes(show.slug).map((episode) => ({
      show: show.slug,
      episode: episodeSlug(episode),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ show: string; episode: string }>;
}): Promise<Metadata> {
  const { show: slug, episode: epSlug } = await params;
  const show = getShow(slug);
  const episode = getEpisodeBySlug(slug, epSlug);
  if (!show || !episode) return {};

  const code = `S${episode.season}E${episode.episode}`;
  const title = `${show.title} ${code}: ${episode.title}`;
  const description =
    episode.description ??
    `${show.title} season ${episode.season}, episode ${episode.episode}: "${episode.title}".`;

  return {
    title,
    description,
    alternates: { canonical: `/${show.slug}/${epSlug}` },
    openGraph: {
      type: "video.episode",
      title,
      description,
      url: `/${show.slug}/${epSlug}`,
      images: [siteConfig.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ show: string; episode: string }>;
}) {
  const { show: slug, episode: epSlug } = await params;
  const show = getShow(slug);
  const episode = getEpisodeBySlug(slug, epSlug);
  if (!show || !episode) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center gap-10 px-6 py-16">
      <JsonLd data={episodeJsonLd(show, episode)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: show.title, path: `/${show.slug}` },
          {
            name: `S${episode.season}E${episode.episode}`,
            path: `/${show.slug}/${epSlug}`,
          },
        ])}
      />

      <nav className="w-full">
        <TrackedLink
          event="back_to_show"
          data={{ show: show.slug }}
          href={`/${show.slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {show.title}
        </TrackedLink>
      </nav>

      <header className="text-center">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
          {show.title}
        </p>
        <h1 className="sr-only">
          {show.title} Season {episode.season} Episode {episode.episode}:{" "}
          {episode.title}
        </h1>
      </header>

      <EpisodeCard episode={episode} />

      <WhereToWatch show={show} season={episode.season} />

      <TrackedLink
        event="pick_another_episode"
        data={{ show: show.slug }}
        href={`/${show.slug}`}
        className={cn(buttonVariants({ size: "lg" }))}
      >
        <Shuffle aria-hidden />
        Pick another episode
      </TrackedLink>
    </main>
  );
}
