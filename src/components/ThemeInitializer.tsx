"use client";

import { useEffect } from "react";
import {
  A11Y_HIGH_CONTRAST_KEY,
  A11Y_LARGE_TEXT_KEY,
  THEME_STORAGE_KEY,
} from "@/lib/theme-script";

// Theme initialization belongs in a Client Component. Rendering an inline
// script from the locale layout causes Next.js 16 to encounter a <script>
// during client navigation and report that it cannot execute it.
export default function ThemeInitializer() {
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    root.setAttribute("data-theme", theme);
    root.classList.toggle(
      "a11y-large-text",
      localStorage.getItem(A11Y_LARGE_TEXT_KEY) === "1"
    );
    root.classList.toggle(
      "a11y-high-contrast",
      localStorage.getItem(A11Y_HIGH_CONTRAST_KEY) === "1"
    );
  }, []);

  return null;
}
