import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMembers,
  createMember,
  type MemberData,
  type MemberCreateData,
} from "../api/members";
import { queryKeys } from "../api/query-keys";

export function useMembers(role?: string) {
  return useQuery<MemberData[]>({
    queryKey: role
      ? [...queryKeys.members.all, { role }]
      : queryKeys.members.all,
    queryFn: () => fetchMembers(role),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, role }: { name: string; role?: string }) =>
      createMember(name, role),
    onSuccess: (data: MemberCreateData) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      return data;
    },
  });
}
