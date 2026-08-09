import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RatingSummaryPage } from "./RatingSummaryPage";
import { createWrapper } from "../test/test-utils";

vi.mock("../api/movies", async () => {
  const actual = await vi.importActual<typeof import("../api/movies")>("../api/movies");
  return {
    ...actual,
    useMovie: vi.fn(),
    useMovieRatings: vi.fn(),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useParams: () => ({ id: "42" }) };
});

import { useMovie, useMovieRatings } from "../api/movies";

const mockMovie = {
  data: {
    id: 42,
    title: "Movie 42",
    nominatedBy: "Alice",
    watchedAt: null,
    createdAt: "2026-01-01",
    rating: { avg: 8.5, count: 3 },
  },
  isLoading: false,
  isError: false,
} as any;

const mockRaters = [
  { memberId: 1, name: "Alice", rating: 9 },
  { memberId: 2, name: "Bob", rating: 8 },
  { memberId: 3, name: "Devin", rating: 8 },
];

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(useMovie).mockReturnValue(mockMovie);
  vi.mocked(useMovieRatings).mockReturnValue({ data: mockRaters, isLoading: false } as any);
});

describe("RatingSummaryPage", () => {
  it("defaults to results mode showing score and no QR", () => {
    render(<RatingSummaryPage />, { wrapper: createWrapper() });
    expect(screen.getByText("8.50")).toBeInTheDocument();
    expect(screen.getByText("3 ratings")).toBeInTheDocument();
    expect(screen.queryByText("Scan to rate this movie")).toBeNull();
    expect(screen.getByRole("button", { name: "Start Voting" })).toBeInTheDocument();
  });

  it("toggles to voting mode showing QR and hiding the score", async () => {
    const user = userEvent.setup();
    render(<RatingSummaryPage />, { wrapper: createWrapper() });
    await user.click(screen.getByRole("button", { name: "Start Voting" }));
    expect(screen.getByText("Scan to rate this movie")).toBeInTheDocument();
    expect(screen.queryByText("8.50")).toBeNull();
    expect(screen.getByRole("button", { name: "Show Results" })).toBeInTheDocument();
  });

  it("restores voting mode from localStorage on load", () => {
    localStorage.setItem("rating-summary-mode", "voting");
    render(<RatingSummaryPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Scan to rate this movie")).toBeInTheDocument();
    expect(screen.queryByText("8.50")).toBeNull();
    expect(screen.getByRole("button", { name: "Show Results" })).toBeInTheDocument();
  });

  it("shows a single aggregate chip for anonymous raters", () => {
    vi.mocked(useMovieRatings).mockReturnValue({
      data: [
        { memberId: 1, name: "Alice", rating: 9 },
        { memberId: null, name: null, rating: 7 },
        { memberId: null, name: null, rating: 8 },
      ],
      isLoading: false,
    } as any);
    render(<RatingSummaryPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("2 anonymous")).toBeInTheDocument();
  });
});
