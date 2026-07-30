"use client";

import { useSyncExternalStore } from "react";
import { A11Y_HIGH_CONTRAST_KEY, A11Y_LARGE_TEXT_KEY } from "@/lib/theme-script";
import type { Dictionary } from "@/lib/dictionaries";

const A11Y_EVENT = "sp-a11y-change";

function subscribe(callback: () => void) {
  window.addEventListener(A11Y_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(A11Y_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getLargeTextSnapshot() {
  return localStorage.getItem(A11Y_LARGE_TEXT_KEY) === "1";
}

function getHighContrastSnapshot() {
  return localStorage.getItem(A11Y_HIGH_CONTRAST_KEY) === "1";
}

function getServerSnapshotFalse() {
  return false;
}

export default function AccessibilityToggle({
  dict,
}: {
  dict: Dictionary["a11y"];
}) {
  const largeText = useSyncExternalStore(subscribe, getLargeTextSnapshot, getServerSnapshotFalse);
  const highContrast = useSyncExternalStore(subscribe, getHighContrastSnapshot, getServerSnapshotFalse);

  function toggleLargeText() {
    const next = !largeText;
    localStorage.setItem(A11Y_LARGE_TEXT_KEY, next ? "1" : "0");
    document.documentElement.classList.toggle("a11y-large-text", next);
    window.dispatchEvent(new Event(A11Y_EVENT));
  }

  function toggleHighContrast() {
    const next = !highContrast;
    localStorage.setItem(A11Y_HIGH_CONTRAST_KEY, next ? "1" : "0");
    document.documentElement.classList.toggle("a11y-high-contrast", next);
    window.dispatchEvent(new Event(A11Y_EVENT));
  }

  return (
    <div className="a11y-toggle-group" role="group" aria-label={dict.groupLabel}>
      <button
        type="button"
        onClick={toggleLargeText}
        aria-pressed={largeText}
        className="a11y-toggle"
      >
        {dict.largeText}
      </button>
      <button
        type="button"
        onClick={toggleHighContrast}
        aria-pressed={highContrast}
        className="a11y-toggle"
      >
        {dict.highContrast}
      </button>
    </div>
  );
}
