import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { MovieStatus } from "../../types";
import { queryKeys } from "./query-keys";

export interface MovieData {
  id: number;
  title: string;
  nominatedBy: string;
  watchedAt: string | null;
  createdAt: string;
  rating: { avg: number | null; count: number };
}

export function fetchMovie(id: number): Promise<MovieData> {
  return apiFetch<MovieData>(`/api/movies/${id}`);
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export function fetchMovieRatings(id: number): Promise<RatingDistribution[]> {
  return apiFetch<RatingDistribution[]>(`/api/movies/${id}/ratings`);
}

export function useMovie(id: number, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKeys.movies.detail(id),
    queryFn: () => fetchMovie(id),
    ...options,
  });
}

export function useMovieRatings(id: number, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: queryKeys.movies.ratings(id),
    queryFn: () => fetchMovieRatings(id),
    ...options,
  });
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

export function removeMovieWatched(id: number): Promise<{ success: boolean }> {
  return apiFetch(`/api/movies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ watchedAt: null }),
  });
}

export function submitRating(
  movieId: number,
  memberId: number,
  rating: number,
): Promise<{ success: boolean }> {
  return apiFetch(`/api/movies/${movieId}/ratings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId, rating }),
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ movieId, memberId, rating }: { movieId: number; memberId: number; rating: number }) =>
      submitRating(movieId, memberId, rating),
    onSuccess: (_data, { movieId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.ratings(movieId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.detail(movieId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.all });
    },
  });
}

export function useRemoveMovieWatched() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeMovieWatched(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.all });
    },
  });
}

export function useMarkMovieWatched() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, watchedAt }: { id: number; watchedAt: string }) =>
      markMovieWatched(id, watchedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movies.all });
    },
  });
}
