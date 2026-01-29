import { useStoreUsers } from '@/features/user/store/use-store-users';

export const useUsers = () => {
  const users = useStoreUsers((s) => s.users);
  const isLoading = useStoreUsers((s) => s.isLoading);
  const error = useStoreUsers((s) => s.error);

  const getUsers = useStoreUsers((s) => s.getUsers);

  return { users, isLoading, error, getUsers };
};
