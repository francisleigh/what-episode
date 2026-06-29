import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAllShows, getShow, getEpisodes } from "@/lib/episodes";
import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { TrackedLink } from "@/components/tracked-link";
import { RandomEpisode } from "@/components/random-episode";
import {
  breadcrumbJsonLd,
  showFaqJsonLd,
  showJsonLd,
} from "@/lib/seo";

// Statically render every known show at build time. Unknown slugs 404 rather
// than render on demand, keeping the route fully static.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllShows().map((show) => ({ show: show.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ show: string }>;
}): Promise<Metadata> {
  const { show: slug } = await params;
  const show = getShow(slug);
  if (!show) return {};

  // Title + description are written to match real search queries:
  // "random us office episode", "what us office episode should i watch".
  const title = `Random ${show.title} Episode — What Should I Watch?`;
  const description = `Can't decide which ${show.title} episode to watch? Get a random ${show.title} episode instantly, then reshuffle until something clicks.`;

  return {
    title,
    description,
    keywords: show.keywords,
    alternates: { canonical: `/${show.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/${show.slug}`,
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

export default async function ShowPage({
  params,
}: {
  params: Promise<{ show: string }>;
}) {
  const { show: slug } = await params;
  const show = getShow(slug);
  if (!show) notFound();

  const episodes = getEpisodes(slug);

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center gap-12 px-6 py-16">
      <JsonLd data={showJsonLd(show)} />
      <JsonLd data={showFaqJsonLd(show)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: show.title, path: `/${show.slug}` },
        ])}
      />

      <nav className="w-full">
        <TrackedLink
          event="back_all_shows"
          data={{ show: show.slug }}
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4" />
          All shows
        </TrackedLink>
      </nav>

      <header className="flex flex-col items-center gap-4 text-center">
        {/* H1 mirrors the target query so the page reads as a direct answer. */}
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
          Random {show.title} Episode
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          Not sure what {show.title} episode to watch? Here&apos;s one to try —
          reshuffle for another.
        </p>
      </header>

      {episodes.length > 0 ? (
        <RandomEpisode episodes={episodes} show={show} />
      ) : (
        <p className="max-w-md text-balance text-muted-foreground">
          We&apos;re still loading the {show.title} episode list — check back soon.
        </p>
      )}

      {/* On-page FAQ that mirrors the FAQPage JSON-LD — good for users and for
          answer-engine surfaces. */}
      <section
        aria-labelledby="faq-heading"
        className="w-full max-w-xl border-t border-border pt-10"
      >
        <h2
          id="faq-heading"
          className="mb-6 text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          Frequently asked
        </h2>
        <dl className="flex flex-col gap-6">
          <div>
            <dt className="text-base font-medium">
              What {show.title} episode should I watch?
            </dt>
            <dd className="mt-1 text-muted-foreground">
              If you can&apos;t decide, let What Episode pick for you — it selects
              a random {show.title} episode every visit, so you can stop scrolling
              and start watching.
            </dd>
          </div>
          <div>
            <dt className="text-base font-medium">
              How do I get a random {show.title} episode?
            </dt>
            <dd className="mt-1 text-muted-foreground">
              A random episode is chosen the moment this page loads. Press
              &quot;Reshuffle&quot; for another suggestion.
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
