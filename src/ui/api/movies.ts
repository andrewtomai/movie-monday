import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { MovieStatus } from "../../types";

export interface MovieData {
  id: number;
  title: string;
  nominatedBy: string;
  watchedAt: string | null;
  createdAt: string;
  rating: { avg: number | null; count: number };
}

export function fetchMovies(status?: MovieStatus): Promise<MovieData[]> {
  const path = status ? `/api/movies?status=${status}` : "/api/movies";
  return apiFetch<MovieData[]>(path);
}

export function markMovieWatched(id: number, watchedAt: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/movies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ watchedAt }),
  });
}

export function useMarkMovieWatched() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, watchedAt }: { id: number; watchedAt: string }) =>
      markMovieWatched(id, watchedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}
