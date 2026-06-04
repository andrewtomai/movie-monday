import { useQuery } from "@tanstack/react-query";
import type { MovieStatus } from "../../types";
import { apiFetch } from "./client";

export interface MemberData {
  id: number;
  name: string;
}

export interface MemberMovieData {
  id: number;
  title: string;
  watchedAt: string | null;
  createdAt: string;
}

export function fetchMembers(): Promise<MemberData[]> {
  return apiFetch<MemberData[]>("/api/members");
}

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });
}

export function fetchMemberMovies(
  id: number,
  status?: MovieStatus,
): Promise<MemberMovieData[]> {
  const params = status ? `?status=${status}` : "";
  return apiFetch<MemberMovieData[]>(`/api/members/${id}/movies${params}`);
}
