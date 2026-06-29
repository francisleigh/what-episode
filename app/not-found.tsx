import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-display text-6xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t find that show or episode.
      </p>
      <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
        Back to all shows
      </Link>
    </main>
  );
}
