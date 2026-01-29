import { create } from 'zustand';

import { userServices } from '@/features/user/api/services/userServices';
import type { UsersStore } from '@/features/user/types';

export const useStoreUsers = create<UsersStore>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  getUsers: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await userServices.getUsers(search);
      set({ users: data });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to load users' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
}));
