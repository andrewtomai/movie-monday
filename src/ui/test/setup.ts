import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  // Reset the appearance preference so theme state never leaks between tests.
  localStorage.removeItem("movie-monday-theme");
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
});

Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn();
Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();

