import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  applyTheme,
  getResolvedTheme,
  getStoredTheme,
  getTheme,
  isTheme,
  resolveTheme,
  setTheme,
  subscribeTheme,
} from "./theme";

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
    ),
  };
  if (typeof window.matchMedia !== "function") {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(),
    });
  }
  vi.spyOn(window, "matchMedia").mockImplementation(
    () => query as unknown as MediaQueryList,
  );
  return { query, listeners };
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isTheme", () => {
  it("accepts the three supported themes", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("light")).toBe(true);
    expect(isTheme("system")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isTheme("blue")).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme("")).toBe(false);
  });
});

describe("stored theme", () => {
  it("returns null when nothing is stored", () => {
    expect(getStoredTheme()).toBeNull();
  });

  it("ignores an invalid stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "neon");
    expect(getStoredTheme()).toBeNull();
  });

  it("reads a valid stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    expect(getStoredTheme()).toBe("light");
  });
});

describe("getTheme", () => {
  it("defaults to dark when nothing is saved", () => {
    expect(DEFAULT_THEME).toBe("dark");
    expect(getTheme()).toBe("dark");
  });

  it("returns the saved theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    expect(getTheme()).toBe("light");
  });
});

describe("resolveTheme", () => {
  it("passes explicit themes through", () => {
    expect(resolveTheme("dark")).toBe("dark");
    expect(resolveTheme("light")).toBe("light");
  });

  it("follows the OS preference in system mode", () => {
    mockMatchMedia(true);
    expect(resolveTheme("system")).toBe("dark");
    mockMatchMedia(false);
    expect(resolveTheme("system")).toBe("light");
  });

  it("falls back to dark when matchMedia is unavailable", () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, "matchMedia");
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: undefined,
    });
    try {
      expect(resolveTheme("system")).toBe("dark");
    } finally {
      if (descriptor) Object.defineProperty(window, "matchMedia", descriptor);
    }
  });
});

describe("getResolvedTheme", () => {
  it("resolves the stored theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "system");
    mockMatchMedia(false);
    expect(getResolvedTheme()).toBe("light");
  });
});

describe("applyTheme", () => {
  it("adds the dark class for the dark theme", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("removes the dark class for the light theme", () => {
    document.documentElement.classList.add("dark");
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("creates and updates the theme-color meta tag", () => {
    applyTheme("dark");
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    expect(meta).not.toBeNull();
    const darkColor = meta?.content;
    expect(darkColor).toMatch(/^#|oklch/);

    applyTheme("light");
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
        ?.content,
    ).not.toBe(darkColor);
  });
});

describe("setTheme", () => {
  it("persists the selection and applies it", () => {
    setTheme("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists system mode and resolves it for the document", () => {
    mockMatchMedia(true);
    setTheme("system");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("subscribeTheme", () => {
  it("notifies listeners when the theme changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);
    setTheme("light");
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);
    unsubscribe();
    setTheme("light");
    expect(listener).not.toHaveBeenCalled();
  });

  it("re-applies the theme when storage changes in another tab", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: THEME_STORAGE_KEY,
        newValue: "light",
      }),
    );
    expect(listener).toHaveBeenCalled();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    unsubscribe();
  });

  it("re-applies system resolution when the OS preference changes", () => {
    const { query, listeners } = mockMatchMedia(false);
    localStorage.setItem(THEME_STORAGE_KEY, "system");
    const unsubscribe = subscribeTheme(vi.fn());
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    query.matches = true;
    for (const listener of listeners) {
      listener({ matches: true } as MediaQueryListEvent);
    }
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    unsubscribe();
  });

  it("applies the stored theme on subscribe", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    const unsubscribe = subscribeTheme(vi.fn());
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    unsubscribe();
  });
});
