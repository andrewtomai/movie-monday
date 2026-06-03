import { useQueries } from "@tanstack/react-query";
import { fetchMemberMovies } from "../api/members";

function memberMoviesOptions(id: number, status?: "unwatched") {
  return {
    queryKey: ["member-movies", id, status] as const,
    queryFn: () => fetchMemberMovies(id, status),
    staleTime: 5 * 60 * 1000,
  };
}

export function useMembersMovies(
  ids: number[],
  status?: "unwatched",
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
