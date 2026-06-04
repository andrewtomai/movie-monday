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

vi.mock("../hooks/useMovies", () => ({
  useMovies: vi.fn(),
}));

import { useMovies } from "../hooks/useMovies";

const mockMoviesData = [
  {
    id: 1,
    title: "Baby Driver",
    nominatedBy: "Devin",
    watchedAt: "2026-02-09",
    createdAt: "2026-01-01",
    rating: { avg: 7.92, count: 12 },
  },
  {
    id: 2,
    title: "The Man From U.N.C.L.E.",
    nominatedBy: "Alex",
    watchedAt: "2026-03-02",
    createdAt: "2026-01-01",
    rating: { avg: 7.91, count: 11 },
  },
  {
    id: 3,
    title: "The Witch",
    nominatedBy: "Scott",
    watchedAt: "2026-04-06",
    createdAt: "2026-01-01",
    rating: { avg: 7.14, count: 14 },
  },
  {
    id: 4,
    title: "Altered States",
    nominatedBy: "Ciela",
    watchedAt: "2026-05-11",
    createdAt: "2026-01-01",
    rating: { avg: 6.75, count: 8 },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RankingsPage", () => {
  it("renders the title and subtitle", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: mockMoviesData,
    } as any);

    render(<RankingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText("Movie Rankings")).toBeInTheDocument();
    expect(
      screen.getByText("All watched movies, ranked"),
    ).toBeInTheDocument();
    expect(useMovies).toHaveBeenCalledWith("watched");
  });

  it("renders movies sorted by rating descending", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: mockMoviesData,
    } as any);

    render(<RankingsPage />, { wrapper: createWrapper() });
    const cards = screen.getAllByText(
      /Baby Driver|The Man From U.N.C.L.E.|The Witch|Altered States/,
    );

    expect(cards[0]).toHaveTextContent("Baby Driver");
  });

  it("displays rank numbers (1-indexed)", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: mockMoviesData,
    } as any);

    render(<RankingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("displays ratings with count", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: mockMoviesData,
    } as any);

    render(<RankingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText("7.92")).toBeInTheDocument();
    expect(screen.getByText("(12)")).toBeInTheDocument();
    expect(screen.getByText("6.75")).toBeInTheDocument();
    expect(screen.getByText("(8)")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: [],
    } as any);

    render(<RankingsPage />, { wrapper: createWrapper() });
    expect(
      screen.getByText("No rankings available yet."),
    ).toBeInTheDocument();
  });

  it("filters out unwatched movies (null watchedAt)", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: [
        ...mockMoviesData,
        {
          id: 5,
          title: "Unwatched Movie",
          nominatedBy: "Test",
          watchedAt: null,
          createdAt: "2026-01-01",
          rating: { avg: null, count: 0 },
        },
      ],
    } as any);

    render(<RankingsPage />, { wrapper: createWrapper() });
    expect(screen.queryByText("Unwatched Movie")).toBeNull();
  });

  it("navigates home when ← Home is clicked", async () => {
    vi.mocked(useMovies).mockReturnValue({
      data: mockMoviesData,
    } as any);

    render(<RankingsPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("← Home"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("navigates to movie page when a card is clicked", async () => {
    vi.mocked(useMovies).mockReturnValue({
      data: mockMoviesData,
    } as any);

    render(<RankingsPage />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByText("Baby Driver"));
    expect(mockNavigate).toHaveBeenCalledWith("/movie/1");
  });
});
