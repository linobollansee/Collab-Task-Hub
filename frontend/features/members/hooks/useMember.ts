import { useStoreMembers } from '@/features/members/store/use-store-member';

export const useMembers = () => {
  const isLoading = useStoreMembers((s) => s.isLoading);
  const error = useStoreMembers((s) => s.error);

  const addMember = useStoreMembers((s) => s.addMember);
  const updateRole = useStoreMembers((s) => s.updateRole);
  const deleteMember = useStoreMembers((s) => s.deleteMember);

  return { isLoading, error, addMember, updateRole, deleteMember };
};
