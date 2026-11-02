import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { Toaster } from "sonner";
import { ThemedToaster } from "./ThemedToaster";
import { setTheme } from "@/lib/theme";

vi.mock("sonner", () => ({
  Toaster: vi.fn(() => null),
}));

const toasterProps = () =>
  vi.mocked(Toaster).mock.calls.at(-1)?.[0] as {
    richColors?: boolean;
    theme?: string;
  };

beforeEach(() => {
  localStorage.clear();
  vi.mocked(Toaster).mockClear();
});

describe("ThemedToaster", () => {
  it("renders toasts in the default dark theme", () => {
    render(<ThemedToaster />);

    expect(toasterProps()).toMatchObject({ richColors: true, theme: "dark" });
  });

  it("follows the active theme", () => {
    render(<ThemedToaster />);

    act(() => setTheme("light"));

    expect(toasterProps()).toMatchObject({ theme: "light" });
  });
});
