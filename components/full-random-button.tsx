"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Moon } from "lucide-react";
import { track } from "@vercel/analytics";

import { pickRandomShowEpisode } from "@/lib/episodes";
import { cn } from "@/lib/utils";

/**
 * Client island for the "Surprise me" full-random pick. Receives a compact
 * show→episode-slug index from the (static) home page, picks in the browser,
 * and navigates to that episode's page — keeping the host page server-rendered
 * while isolating the non-determinism here.
 *
 * Rendered as a sleep-framed clickable card for someone who just wants
 * *something* on in the background. It's a real <button> (not a Card div) so
 * keyboard focus, Enter/Space activation, and screen-reader semantics come for
 * free — the action is client-side navigation, so a button is the honest tag.
 */
export function FullRandomButton({
  episodeIndex,
}: {
  episodeIndex: Record<string, string[]>;
}) {
  const router = useRouter();

  const surprise = useCallback(() => {
    const pick = pickRandomShowEpisode(episodeIndex);
    if (!pick) return;
    track("full_random", { show: pick.show, episode: pick.episode });
    router.push(`/${pick.show}/${pick.episode}`);
  }, [episodeIndex, router]);

  return (
    <button
      type="button"
      onClick={surprise}
      disabled={Object.keys(episodeIndex).length === 0}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border",
        "bg-card p-5 text-left text-card-foreground transition-colors",
        "hover:bg-foreground/[0.04]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      <Moon className="size-6 shrink-0 text-muted-foreground" aria-hidden />
      <span className="flex flex-col gap-1">
        <span className="text-lg font-semibold leading-none tracking-tight">
          I really don&apos;t care
        </span>
        <span className="text-sm text-muted-foreground">
          Eyes half shut? Tap and we&apos;ll drift you into whatever&apos;s next.
        </span>
      </span>
      <ArrowRight
        className="ml-auto size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
        aria-hidden
      />
    </button>
  );
}
