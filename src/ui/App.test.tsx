import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { useStore } from "./store";

vi.mock("./hooks/useMembers", () => ({
  useMembers: vi.fn(),
}));

import { useMembers } from "./hooks/useMembers";

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
  vi.clearAllMocks();
  useStore.setState({ selectedAttendees: [], rollingPool: [] });
  vi.mocked(useMembers).mockReturnValue({
    data: mockMembers,
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
    expect(
      screen.getByText("Rating summary coming soon"),
    ).toBeInTheDocument();
  });
});
