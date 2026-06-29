import { THEME_KEY } from "./constants";

export function readThemeMode() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.state && parsed.state.mode) {
        return parsed.state.mode;
      }
    }
  } catch {
    /* ignore */
  }
  return "system";
}

export function resolveTheme(mode) {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyThemeFromMode(mode) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  if (mode === "dark") {
    root.classList.add("dark");
  } else if (mode === "light") {
    root.classList.add("light");
  }
}

export function writeThemeMode(mode) {
  localStorage.setItem(
    THEME_KEY,
    JSON.stringify({ state: { mode: mode }, version: 0 }),
  );
}

export function enableThemeTransition() {
  document.documentElement.classList.add("theme-transition");
}

export function initTheme() {
  applyThemeFromMode(resolveTheme(readThemeMode()));
}

export function toggleTheme() {
  enableThemeTransition();
  const resolved = resolveTheme(readThemeMode());
  const next = resolved === "dark" ? "light" : "dark";
  writeThemeMode(next);
  applyThemeFromMode(next);
  updateToggleLabels();
}

export function updateToggleLabels() {
  const resolved = resolveTheme(readThemeMode());
  const next = resolved === "dark" ? "light" : "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
    const title = el.getAttribute("data-title-" + next) || next;
    const ariaLabel = el.getAttribute("data-aria-label-" + next) || title;
    el.setAttribute("aria-label", ariaLabel);
    el.setAttribute("title", title);
    const icon = el.querySelector("[data-theme-toggle-icon]");
    if (icon) {
      icon.innerHTML =
        next === "light"
          ? '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />'
          : '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />';
    }
  });
}
