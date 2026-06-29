"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import type { ComponentProps, MouseEvent } from "react";

/**
 * Smallest possible client island for analytics: a link that fires a Vercel
 * Analytics custom event on click, then navigates as normal. Used in place of
 * `next/link` / `<a>` at the few interactive leaves we instrument, so the
 * surrounding pages stay server-rendered (fast first paint, fully crawlable).
 *
 * `track()` is fire-and-forget (sendBeacon), so it never blocks navigation —
 * safe for both client-side `Link` transitions and external `target="_blank"`.
 */
type TrackedLinkProps = ComponentProps<"a"> & {
  event: string;
  data?: Record<string, string | number | boolean | null>;
  /** Render a plain `<a>` (external) instead of a client-routed next/link. */
  external?: boolean;
};

export function TrackedLink({
  event,
  data,
  external,
  href,
  onClick,
  children,
  ...rest
}: TrackedLinkProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    track(event, data);
    onClick?.(e);
  }

  if (external) {
    return (
      <a href={href} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href ?? "#"} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
