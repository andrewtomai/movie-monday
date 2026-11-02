import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./ThemeToggle";
import { THEME_STORAGE_KEY } from "@/lib/theme";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
  it("starts on the default dark theme", () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", {
        name: "Color theme: Dark. Switch to Light.",
      }),
    ).toBeInTheDocument();
  });

  it("cycles dark to light and applies the light theme", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", {
        name: "Color theme: Dark. Switch to Light.",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Color theme: Light. Switch to System.",
      }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("cycles light to system and back to dark", async () => {
    const user = userEvent.setup();
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", {
        name: "Color theme: Light. Switch to System.",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Color theme: System. Switch to Dark.",
      }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");

    await user.click(
      screen.getByRole("button", {
        name: "Color theme: System. Switch to Dark.",
      }),
    );

    expect(
      screen.getByRole("button", {
        name: "Color theme: Dark. Switch to Light.",
      }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
