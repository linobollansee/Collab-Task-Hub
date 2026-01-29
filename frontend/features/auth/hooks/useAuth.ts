import { useStoreAuth } from '@/features/auth/store/use-store-auth';

export const useAuth = () => {
  const { isAuth, user, isLoading, logoutUser, loginUser, registerUser, authError } =
    useStoreAuth();

  return { registerUser, loginUser, logoutUser, user, isAuth, isLoading, authError };
};
