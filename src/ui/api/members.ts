import { apiFetch } from "./client";

export interface MemberData {
  name: string;
  movies: string[];
}

export function fetchMembers(): Promise<MemberData[]> {
  return apiFetch<MemberData[]>("/api/members");
}
