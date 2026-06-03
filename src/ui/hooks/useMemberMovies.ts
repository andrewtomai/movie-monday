import { useQueries } from "@tanstack/react-query";
import { fetchMemberMovies } from "../api/members";
import { type MovieStatus } from "../../types";

function memberMoviesOptions(id: number, status?: MovieStatus) {
  return {
    queryKey: ["member-movies", id, status] as const,
    queryFn: () => fetchMemberMovies(id, status),
    staleTime: 5 * 60 * 1000,
  };
}

export function useMembersMovies(
  ids: number[],
  status?: MovieStatus,
): { titles: string[]; isLoading: boolean } {
  return useQueries({
    queries: ids.map((id) => memberMoviesOptions(id, status)),
    combine: (results) => ({
      titles: results
        .filter((r) => r.data)
        .flatMap((r) => r.data!.map((m) => m.title)),
      isLoading: results.some((r) => r.isLoading),
    }),
  });
}
