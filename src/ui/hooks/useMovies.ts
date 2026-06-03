import { useQuery } from "@tanstack/react-query";
import { fetchMovies, type MovieData } from "../api/movies";

export function useMovies() {
  return useQuery<MovieData[]>({
    queryKey: ["movies"],
    queryFn: fetchMovies,
    staleTime: 5 * 60 * 1000,
  });
}