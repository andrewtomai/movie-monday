import { useQuery } from "@tanstack/react-query";
import { fetchMovies, type MovieData } from "../api/movies";
import type { MovieStatus } from "../../types";

export function useMovies(status?: MovieStatus) {
  return useQuery<MovieData[]>({
    queryKey: ["movies", status],
    queryFn: () => fetchMovies(status),
    staleTime: 5 * 60 * 1000,
  });
}
