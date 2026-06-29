/**
 * Single source of truth for site-wide identity and SEO defaults.
 * Keeping this centralised means metadata, sitemap, robots and JSON-LD all
 * agree on the canonical URL and naming.
 */
export const siteConfig = {
  name: "What Episode",
  // The product's one-line promise — also used as the default meta description.
  description:
    "Can't decide what to watch? Get a random episode of your favourite show, instantly. No more endless scrolling.",
  // Read from env so previews/staging can override the canonical origin.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://what-episode.com").replace(
    /\/$/,
    "",
  ),
  ogImage: "/opengraph-image.png",
  twitter: "@whatepisode",
} as const;

export type SiteConfig = typeof siteConfig;

/** Build an absolute URL against the canonical origin (for OG tags, JSON-LD, sitemap). */
export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
