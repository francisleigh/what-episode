/**
 * Global footer with the TMDB attribution required by their brand guidelines
 * (https://www.themoviedb.org/about/logos-attribution). Kept small and pushed
 * to the right; the disclaimer states we use the API without endorsement.
 */
export function SiteFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-3xl items-center justify-end gap-3 px-6 py-8 text-xs text-muted-foreground">
      <span className="flex items-center gap-2">
        <span>Powered by</span>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="The Movie Database (TMDB)"
        >
          {/* Official TMDB logo asset in /public; do not recolour or distort. */}
          <img src="/tmdb.svg" alt="TMDB" className="h-3 w-auto" />
        </a>
      </span>
      <span className="sr-only">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </span>
    </footer>
  );
}
