import { create } from 'zustand';

import { memberServices } from '@/features/members/api/services/memberServices';
import type { MembersStore } from '@/features/members/types';
import { useStoreProject } from '@/features/project/store/use-store-project';

export const useStoreMembers = create<MembersStore>((set) => ({
  isLoading: false,
  error: null,

  addMember: async (projectId, dto) => {
    set({ isLoading: true, error: null });
    try {
      await memberServices.addMember(projectId, dto);
      await useStoreProject.getState().getProjectById(projectId);
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to add member' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  updateRole: async (projectId, memberId, role) => {
    set({ isLoading: true, error: null });
    try {
      await memberServices.updateRole(projectId, memberId, { role });
      await useStoreProject.getState().getProjectById(projectId);
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update role' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMember: async (projectId, memberId) => {
    set({ isLoading: true, error: null });
    try {
      await memberServices.deleteMember(projectId, memberId);
      await useStoreProject.getState().getProjectById(projectId);
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete member' });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
}));
