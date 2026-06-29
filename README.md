# what-episode.com

Can't decide what to watch? Pick a show and get a random episode, instantly.

Built with the **App Router**, **TypeScript**, **Tailwind CSS v4**, and
**shadcn/ui** (new-york style). White-on-black, minimal monochrome aesthetic,
with the [Doto](https://fonts.google.com/specimen/Doto) display font.

## Getting started

This project uses **bun** (matching the `Velo` workspace convention).

```bash
bun install
bun dev          # http://localhost:3000
bun run build    # production build
bun run check-types
```

Set the canonical origin for correct metadata / sitemap URLs:

```bash
cp .env.example .env.local   # then edit NEXT_PUBLIC_SITE_URL
```

## Architecture

```
app/
  layout.tsx              Root layout: Doto font, global metadata, WebSite JSON-LD
  page.tsx                Home — hero + show list (static)
  [show]/page.tsx         Show page — random picker + FAQ (static, SEO-tuned)
  [show]/[episode]/page.tsx  Per-episode page (static, one indexable URL each)
  sitemap.ts  robots.ts   Generated from the data API
components/
  ui/                     shadcn primitives (button, card)
  random-episode.tsx      Client island: owns the shuffle interaction
  episode-card.tsx        Server-safe presentational card
  json-ld.tsx             Renders schema.org structured data
lib/
  episodes/               Typed data layer (types, placeholder data, query API)
  seo.ts                  schema.org JSON-LD builders
  site.ts                 Canonical URL + SEO defaults
```

### Rendering & caching

- Every route is **statically rendered**. `[show]` and `[show]/[episode]` use
  `generateStaticParams` + `dynamicParams = false`, so unknown slugs 404 instead
  of rendering on demand.
- **Randomization is isolated** to `components/random-episode.tsx`, a client
  component that picks *after mount*. This keeps pages static/cacheable and
  avoids hydration mismatches. `pickRandomEpisode` takes an injectable RNG so it
  stays deterministic in tests/SSR.

### SEO

SEO is a first-class concern, tuned for queries like *"what us office episode
should I watch"* and *"random us office episode"*:

- Title/description templates and per-show metadata mirror real search intent.
- Structured data: `WebSite`, `TVSeries`, `TVEpisode`, `FAQPage`, `BreadcrumbList`.
- On-page FAQ matches the `FAQPage` graph for answer-engine surfaces.
- Per-episode static pages provide long-tail coverage; `sitemap.ts` lists them all.
- Open Graph + Twitter cards, canonical URLs, and `robots` directives throughout.

## Data layer

The catalogue is **placeholder data** (`lib/episodes/data.ts`) — a small sample,
not the full catalogue. All access goes through `lib/episodes/index.ts`, so the
backing store can later become a DB / CMS / external API (e.g. TMDB) behind the
same interface.

### Follow-ups (`TODO` markers in code)

- **`TODO(data)`** — replace placeholder shows/episodes with the real catalogue
  (likely a build-time JSON import generated from TMDB or a maintained sheet).
- **`TODO(streaming)`** — wire up `streamingLinks` ("Where to watch") via
  JustWatch / affiliate deep links; UI placeholders already exist.
- Add an `opengraph-image` for richer social previews.
