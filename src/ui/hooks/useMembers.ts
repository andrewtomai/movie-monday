import { useQuery } from "@tanstack/react-query";
import { fetchMembers, type MemberData } from "../api/members";
import { queryKeys } from "../api/query-keys";

export function useMembers() {
  return useQuery<MemberData[]>({
    queryKey: queryKeys.members.all,
    queryFn: fetchMembers,
    staleTime: 5 * 60 * 1000,
  });
}
