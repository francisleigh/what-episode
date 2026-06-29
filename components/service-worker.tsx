"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (public/sw.js) after load, in production only.
 * Renders nothing. Kept out of dev so the SW cache never masks local changes.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
