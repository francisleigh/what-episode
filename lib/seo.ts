import { absoluteUrl, siteConfig } from "./site";
import { episodeSlug } from "./episodes";
import type { Episode, Show } from "./episodes";

/**
 * JSON-LD (schema.org) builders.
 *
 * Structured data is how we win rich results and answer-engine surfaces for
 * queries like "what us office episode should i watch" — search engines read
 * these graphs to understand that a page is a TV series, an episode, or a
 * direct answer to a question (FAQPage).
 */

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function showJsonLd(show: Show) {
  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: show.title,
    description: show.description,
    url: absoluteUrl(`/${show.slug}`),
    ...(show.network ? { productionCompany: { "@type": "Organization", name: show.network } } : {}),
    ...(show.startYear ? { startDate: String(show.startYear) } : {}),
  };
}

export function episodeJsonLd(show: Show, episode: Episode) {
  return {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: episode.title,
    episodeNumber: episode.episode,
    ...(episode.description ? { description: episode.description } : {}),
    url: absoluteUrl(`/${show.slug}/${episodeSlug(episode)}`),
    partOfSeries: {
      "@type": "TVSeries",
      name: show.title,
      url: absoluteUrl(`/${show.slug}`),
    },
    partOfSeason: {
      "@type": "TVSeason",
      seasonNumber: episode.season,
    },
  };
}

/**
 * FAQPage built from the exact questions people type into search. This is the
 * single highest-leverage piece for capturing "what episode should I watch"
 * intent, because it lets the page appear as a direct answer.
 */
export function showFaqJsonLd(show: Show) {
  const qa: Array<{ q: string; a: string }> = [
    {
      q: `What ${show.title} episode should I watch?`,
      a: `If you can't decide, let ${siteConfig.name} pick for you — it selects a random ${show.title} episode every time you visit or hit reshuffle, so you can stop scrolling and start watching.`,
    },
    {
      q: `How do I get a random ${show.title} episode?`,
      a: `Open the ${show.title} page on ${siteConfig.name} and a random episode is chosen instantly. Press "Reshuffle" for another suggestion.`,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
