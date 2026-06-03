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
