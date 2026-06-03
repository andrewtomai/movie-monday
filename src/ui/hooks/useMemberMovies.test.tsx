import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMemberMovies } from "./useMemberMovies";

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

const mockMovies = [
  { id: 1, title: "Inception", watchedAt: null, createdAt: "2026-01-01" },
  { id: 2, title: "Tenet", watchedAt: null, createdAt: "2026-01-01" },
];

describe("useMemberMovies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches movies for a given member id", async () => {
    vi.mocked(fetchMemberMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useMemberMovies(1), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockMovies);
    expect(fetchMemberMovies).toHaveBeenCalledWith(1, undefined);
  });

  it("passes status filter to fetch", async () => {
    vi.mocked(fetchMemberMovies).mockResolvedValue(mockMovies);

    renderHook(() => useMemberMovies(1, "unwatched"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(fetchMemberMovies).toHaveBeenCalledWith(1, "unwatched");
    });
  });

  it("caches results by id and status", async () => {
    vi.mocked(fetchMemberMovies).mockResolvedValue(mockMovies);

    const { result, rerender } = renderHook(
      ({ id, status }: { id: number; status?: "unwatched" }) =>
        useMemberMovies(id, status),
      {
        initialProps: { id: 1, status: "unwatched" as const },
        wrapper: createQueryWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchMemberMovies).toHaveBeenCalledTimes(1);

    rerender({ id: 2, status: "unwatched" });
    await waitFor(() => {
      expect(fetchMemberMovies).toHaveBeenCalledTimes(2);
    });
  });
});
