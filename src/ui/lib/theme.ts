export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

export const THEME_STORAGE_KEY = "movie-monday-theme";
export const DEFAULT_THEME: Theme = "dark";

const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: "#070b09",
  light: "#f9fdfb",
};

const listeners = new Set<() => void>();

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light" || value === "system";
}

export function getStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function getTheme(): Theme {
  return getStoredTheme() ?? DEFAULT_THEME;
}

export function getMediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia("(prefers-color-scheme: dark)");
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== "system") return theme;
  const query = getMediaQuery();
  // Without a media query we cannot know the OS preference, so stay on the
  // default dark theme rather than guessing light.
  if (!query) return "dark";
  return query.matches ? "dark" : "light";
}

export function getResolvedTheme(): ResolvedTheme {
  return resolveTheme(getTheme());
}

function getBackgroundColor(resolved: ResolvedTheme): string {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return THEME_COLORS[resolved];
  }
  const fromStyles = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--background")
    .trim();
  return fromStyles || THEME_COLORS[resolved];
}

export function applyTheme(resolved?: ResolvedTheme): void {
  if (typeof document === "undefined") return;

  const active = resolved ?? getResolvedTheme();
  const root = document.documentElement;

  root.classList.toggle("dark", active === "dark");
  root.style.colorScheme = active;

  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = getBackgroundColor(active);
}

export function setTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for
    // this page view.
  }
  applyTheme(resolveTheme(theme));
  emit();
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);

  const query = getMediaQuery();
  const onQueryChange = () => {
    applyTheme(getResolvedTheme());
    emit();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
    applyTheme(getResolvedTheme());
    emit();
  };

  query?.addEventListener?.("change", onQueryChange);
  window.addEventListener("storage", onStorage);

  // Make sure the document reflects stored state as soon as anything subscribes.
  applyTheme();

  return () => {
    listeners.delete(listener);
    query?.removeEventListener?.("change", onQueryChange);
    window.removeEventListener("storage", onStorage);
  };
}
