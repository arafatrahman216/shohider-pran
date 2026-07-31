"use client";

import { useEffect } from "react";
import { flushQueue, registerOnlineFlush } from "@/lib/offline-queue";

// Mounted once in the root layout. Registers the offline-first service
// worker (Section 1) and flushes any registrations queued while offline —
// both on mount (in case connectivity was restored before this reload) and
// whenever the browser's 'online' event fires.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    // A service worker caching Turbopack's development chunks can leave the
    // browser stuck on "Rendering..." after a schema or component change.
    // Offline caching is a production feature; actively remove old dev
    // registrations/caches so local development always loads fresh chunks.
    if (process.env.NODE_ENV !== "production") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => void registration.unregister());
        });
      }
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.filter((key) => key.startsWith("sp-shell-")).forEach((key) => void caches.delete(key));
        });
      }
      return;
    }

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
