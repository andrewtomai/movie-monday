import type { MovieStatus } from "../../types";
import { apiFetch } from "./client";

export interface MemberData {
  id: number;
  name: string;
  role: string;
}

export interface MemberCreateData {
  id: number;
  name: string;
  role: string;
}

export interface MemberMovieData {
  id: number;
  title: string;
  watchedAt: string | null;
  createdAt: string;
}

export function fetchMembers(role?: string): Promise<MemberData[]> {
  const params = role ? `?role=${role}` : "";
  return apiFetch<MemberData[]>(`/api/members${params}`);
}

export function createMember(
  name: string,
  role?: string,
): Promise<MemberCreateData> {
  return apiFetch<MemberCreateData>("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, role }),
  });
}

export function fetchMemberMovies(
  id: number,
  status?: MovieStatus,
): Promise<MemberMovieData[]> {
  const params = status ? `?status=${status}` : "";
  return apiFetch<MemberMovieData[]>(`/api/members/${id}/movies${params}`);
}
