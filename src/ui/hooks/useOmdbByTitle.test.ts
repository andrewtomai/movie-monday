import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOmdbByTitle } from "./useOmdbByTitle";
import { useMovies } from "./useMovies";

vi.mock("./useMovies", () => ({
  useMovies: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useOmdbByTitle", () => {
  it("maps titles to omdb data, skipping movies without data", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: [
        { id: 1, title: "Tenet", omdb: { imdb: 7.4, rt: 70, year: "2020" } },
        { id: 2, title: "Dunkirk", omdb: null },
        { id: 3, title: "Inception" },
      ],
    } as unknown as ReturnType<typeof useMovies>);

    const { result } = renderHook(() => useOmdbByTitle());

    expect(result.current.get("Tenet")).toEqual({
      imdb: 7.4,
      rt: 70,
      year: "2020",
    });
    expect(result.current.has("Dunkirk")).toBe(false);
    expect(result.current.has("Inception")).toBe(false);
  });

  it("returns an empty map while movies load", () => {
    vi.mocked(useMovies).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useMovies>);

    const { result } = renderHook(() => useOmdbByTitle());

    expect(result.current.size).toBe(0);
  });
});
