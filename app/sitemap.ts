import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { episodeSlug, getAllShows, getEpisodes } from "@/lib/episodes";

/**
 * Generated sitemap covering the home page, every show page, and every
 * per-episode page. As the catalogue grows this scales automatically because
 * it is derived from the same data API the pages use.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const shows = getAllShows();

  const showRoutes: MetadataRoute.Sitemap = shows.map((show) => ({
    url: absoluteUrl(`/${show.slug}`),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const episodeRoutes: MetadataRoute.Sitemap = shows.flatMap((show) =>
    getEpisodes(show.slug).map((episode) => ({
      url: absoluteUrl(`/${show.slug}/${episodeSlug(episode)}`),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  );

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...showRoutes,
    ...episodeRoutes,
  ];
}
