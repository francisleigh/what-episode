import type { Metadata } from "next";

// Precached by the service worker and served as the fallback when a navigation
// fails offline. Kept out of search indexes — it has no standalone value.
export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
        You&apos;re offline
      </h1>
      <p className="max-w-md text-balance text-lg text-muted-foreground">
        We can&apos;t reach the network right now. Reconnect and try again — pages
        you&apos;ve already visited still work offline.
      </p>
    </main>
  );
}
