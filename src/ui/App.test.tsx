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
  { name: "Alice", movies: ["Inception"] },
  { name: "Bob", movies: ["Tenet"] },
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
});
