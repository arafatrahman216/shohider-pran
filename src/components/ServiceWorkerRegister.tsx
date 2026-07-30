"use client";

import { useEffect } from "react";
import { flushQueue, registerOnlineFlush } from "@/lib/offline-queue";

// Mounted once in the root layout. Registers the offline-first service
// worker (Section 1) and flushes any registrations queued while offline —
// both on mount (in case connectivity was restored before this reload) and
// whenever the browser's 'online' event fires.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // offline support degrades gracefully to "no offline caching" —
        // never block the app on this.
      });
    }
    flushQueue();
    return registerOnlineFlush();
  }, []);

  return null;
}
