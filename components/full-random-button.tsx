"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dices } from "lucide-react";
import { track } from "@vercel/analytics";

import { pickRandomShowEpisode } from "@/lib/episodes";
import { Button } from "@/components/ui/button";

/**
 * Client island for the "Surprise me" full-random pick. Receives a compact
 * show→episode-slug index from the (static) home page, picks in the browser,
 * and navigates to that episode's page — keeping the host page server-rendered
 * while isolating the non-determinism here.
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
    <Button
      size="lg"
      onClick={surprise}
      className="w-full"
      disabled={Object.keys(episodeIndex).length === 0}
    >
      <Dices aria-hidden />
      Surprise me
    </Button>
  );
}
