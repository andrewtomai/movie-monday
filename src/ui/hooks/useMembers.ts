import { useQuery } from "@tanstack/react-query";
import { fetchMembers, type MemberData } from "../api/members";

export function useMembers() {
  return useQuery<MemberData[]>({
    queryKey: ["members"],
    queryFn: fetchMembers,
    staleTime: 5 * 60 * 1000,
  });
}
