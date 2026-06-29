/**
 * Global footer with the TMDB attribution required by their brand guidelines
 * (https://www.themoviedb.org/about/logos-attribution). Kept small on the
 * right; the disclaimer states we use the API without endorsement. The site
 * logo sits opposite on the left, linking back to the home page.
 */
import { TrackedLink } from "@/components/tracked-link";

export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground">
      <TrackedLink
        event="footer_click"
        data={{ target: "brand" }}
        href="/"
        aria-label="what-episode home"
      >
        <img src="/logo.svg" alt="what-episode" className="h-8 w-auto" />
      </TrackedLink>
      <span className="flex items-center gap-2">
        <span>Powered by</span>
        <TrackedLink
          external
          event="footer_click"
          data={{ target: "tmdb" }}
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="The Movie Database (TMDB)"
        >
          {/* Official TMDB logo asset in /public; do not recolour or distort. */}
          <img src="/tmdb.svg" alt="TMDB" className="h-3 w-auto" />
        </TrackedLink>
      </span>
      <span className="sr-only">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </span>
    </footer>
  );
}
