import { NextResponse } from "next/server";

import { getAllShows } from "@/lib/episodes";

// Always run on-demand; never cache the cron response.
export const dynamic = "force-dynamic";

/**
 * Scheduled catalogue refresh (wired up via `vercel.json` → crons).
 *
 * Because the catalogue is a committed JSON baked into the static build, this
 * handler cannot mutate it directly. Instead it triggers a Vercel Deploy Hook,
 * whose rebuild runs `fetch:catalogue:running` (see vercel.json buildCommand) to
 * re-fetch only the shows still in production.
 *
 * Required env:
 *   CRON_SECRET      — Vercel sends it as `Authorization: Bearer <secret>`.
 *   DEPLOY_HOOK_URL  — Vercel Deploy Hook to trigger the rebuild.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const running = getAllShows().filter((s) => s.status === "running");
  if (running.length === 0) {
    return NextResponse.json({ refreshed: false, reason: "no running shows" });
  }

  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) {
    return NextResponse.json(
      { error: "DEPLOY_HOOK_URL not configured" },
      { status: 500 },
    );
  }

  const res = await fetch(hook, { method: "POST" });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Deploy hook failed: ${res.status}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    refreshed: true,
    shows: running.map((s) => s.slug),
  });
}
