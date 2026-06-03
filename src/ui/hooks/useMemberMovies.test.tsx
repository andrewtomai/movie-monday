import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMembersMovies } from "./useMemberMovies";

vi.mock("../api/members", () => ({
  fetchMemberMovies: vi.fn(),
}));

import { fetchMemberMovies } from "../api/members";

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockMoviesA = [
  { id: 1, title: "Inception", watchedAt: null, createdAt: "2026-01-01" },
  { id: 2, title: "Tenet", watchedAt: null, createdAt: "2026-01-01" },
];
const mockMoviesB = [
  { id: 3, title: "Dunkirk", watchedAt: null, createdAt: "2026-01-01" },
];

describe("useMembersMovies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches unwatched movies for multiple ids and flattens titles", async () => {
    vi.mocked(fetchMemberMovies)
      .mockResolvedValueOnce(mockMoviesA)
      .mockResolvedValueOnce(mockMoviesB);

    const { result } = renderHook(
      () => useMembersMovies([1, 2], "unwatched"),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.titles).toEqual(["Inception", "Tenet", "Dunkirk"]);
    expect(fetchMemberMovies).toHaveBeenCalledTimes(2);
    expect(fetchMemberMovies).toHaveBeenCalledWith(1, "unwatched");
    expect(fetchMemberMovies).toHaveBeenCalledWith(2, "unwatched");
  });

  it("returns empty titles when no ids given", () => {
    const { result } = renderHook(() => useMembersMovies([]), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.titles).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(fetchMemberMovies).not.toHaveBeenCalled();
  });

  it("reports isLoading while any query is loading", async () => {
    let resolveA!: (v: typeof mockMoviesA) => void;
    const promiseA = new Promise<typeof mockMoviesA>((r) => {
      resolveA = r;
    });
    vi.mocked(fetchMemberMovies)
      .mockReturnValueOnce(promiseA)
      .mockResolvedValueOnce(mockMoviesB);

    const { result } = renderHook(
      () => useMembersMovies([1, 2], "unwatched"),
      { wrapper: createQueryWrapper() },
    );

    expect(result.current.isLoading).toBe(true);

    resolveA(mockMoviesA);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.titles).toHaveLength(3);
  });

  it("handles fetch errors gracefully", async () => {
    vi.mocked(fetchMemberMovies)
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce(mockMoviesB);

    const { result } = renderHook(
      () => useMembersMovies([1, 2], "unwatched"),
      { wrapper: createQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.titles).toEqual(["Dunkirk"]);
  });
});
