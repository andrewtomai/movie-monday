import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { useStore } from "./store";

vi.mock("./api/movies", async () => {
  const actual = await vi.importActual<typeof import("./api/movies")>("./api/movies");
  return {
    ...actual,
    useMovie: vi.fn(),
    useMovieRatings: vi.fn(),
  };
});

vi.mock("./hooks/useMembers", () => ({
  useMembers: vi.fn(),
}));

import { useMembers } from "./hooks/useMembers";
import { useMovie, useMovieRatings } from "./api/movies";

const mockMembers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

function renderWithRouter(initialEntries: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  useStore.setState({ selectedAttendees: [], rollingPool: [] });
  vi.mocked(useMembers).mockReturnValue({
    data: mockMembers,
    isLoading: false,
  } as any);
  vi.mocked(useMovie).mockReturnValue({
    data: { id: 42, title: "Movie 42", nominatedBy: "Alice", watchedAt: null, createdAt: "2026-01-01", rating: { avg: 8.5, count: 10 } },
    isLoading: false,
    isError: false,
  } as any);
  vi.mocked(useMovieRatings).mockReturnValue({
    data: Array.from({ length: 10 }, (_, i) => ({
      memberId: i + 1,
      name: `Rater ${i + 1}`,
      rating: (i % 10) + 1,
    })),
    isLoading: false,
  } as any);
});

describe("App routing", () => {
  it("renders AttendeeSelectPage at /", () => {
    renderWithRouter(["/"]);
    expect(
      screen.getByText("Misc. Movie Monday"),
    ).toBeInTheDocument();
  });

  it("renders RankingsPage at /rankings", () => {
    renderWithRouter(["/rankings"]);
    expect(screen.getByText("Movie Rankings")).toBeInTheDocument();
  });

  it("renders VotingPoolPage at /voting-pool", () => {
    useStore.setState({
      rollingPool: [{ title: "Tenet", isChecked: true }],
    });
    renderWithRouter(["/voting-pool"]);
    expect(screen.getByText("Voting Pool")).toBeInTheDocument();
  });

  it("redirects unknown routes to /", () => {
    renderWithRouter(["/unknown-route"]);
    expect(
      screen.getByText("Misc. Movie Monday"),
    ).toBeInTheDocument();
  });

  it("renders RatingSummaryPage at /movie/:id", () => {
    renderWithRouter(["/movie/42"]);
    expect(screen.getByText("Movie 42")).toBeInTheDocument();
    expect(screen.getByText("8.50")).toBeInTheDocument();
    expect(screen.getByText("10 ratings")).toBeInTheDocument();
  });
});
