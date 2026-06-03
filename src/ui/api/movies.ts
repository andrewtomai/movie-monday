import { apiFetch } from "./client";

export interface MovieData {
  id: number;
  title: string;
  nominatedBy: string;
  watchedAt: string | null;
  createdAt: string;
  rating: { avg: number | null; count: number };
}

export function fetchMovies(): Promise<MovieData[]> {
  return apiFetch<MovieData[]>("/api/movies");
}