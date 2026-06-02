import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RankingsPage } from "./RankingsPage";
import { createWrapper } from "../test/test-utils";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RankingsPage", () => {
  it("renders the title and subtitle", () => {
    render(<RankingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Movie Rankings")).toBeInTheDocument();
    expect(
      screen.getByText("All watched movies, ranked"),
    ).toBeInTheDocument();
  });

  it("renders movies sorted by rating descending", () => {
    render(<RankingsPage />, { wrapper: createWrapper() });
    const cards = screen.getAllByText(/Baby Driver|The Man From U.N.C.L.E.|The Witch|Altered States/);

    const titles = cards.map((c) => c.textContent);
    expect(titles[0]).toBe("Baby Driver");
  });

  it("displays rank numbers (1-indexed)", () => {
    render(<RankingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("displays ratings", () => {
    render(<RankingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText("7.92")).toBeInTheDocument();
  });

  it("navigates home when ← Home is clicked", async () => {
    render(<RankingsPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("← Home"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
