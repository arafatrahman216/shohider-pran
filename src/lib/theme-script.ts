// Inlined into <head> and run before hydration so there is no flash of the wrong theme.
export const THEME_STORAGE_KEY = "sp-theme";
export const A11Y_LARGE_TEXT_KEY = "sp-a11y-large-text";
export const A11Y_HIGH_CONTRAST_KEY = "sp-a11y-high-contrast";

export const themeInitScript = `(function () {
  try {
    var root = document.documentElement;
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    root.setAttribute("data-theme", theme);
    if (localStorage.getItem("${A11Y_LARGE_TEXT_KEY}") === "1") {
      root.classList.add("a11y-large-text");
    }
    if (localStorage.getItem("${A11Y_HIGH_CONTRAST_KEY}") === "1") {
      root.classList.add("a11y-high-contrast");
    }
  } catch (e) {}
})();`;
