import { redirect } from "next/navigation";

import { getEpisodeIndex, pickRandomShowEpisode } from "@/lib/episodes";

// Per-request so each visit redirects to a different random episode; a cached
// response would pin everyone to one episode.
export const dynamic = "force-dynamic";

export function GET() {
  const pick = pickRandomShowEpisode(getEpisodeIndex());
  redirect(pick ? `/${pick.show}/${pick.episode}` : "/");
}
