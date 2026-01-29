import { create } from 'zustand';

import { projectServices } from '@/features/project/api/services/projectServices';
import { ProjectStore } from '@/features/project/types';

export const useStoreProject = create<ProjectStore>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  hasLoadedProject: false,

  clearError: () => set({ error: null }),

  getProjects: async () => {
    try {
      set({ isLoading: true, error: null });

      const data = await projectServices.getProjects();
      set({ projects: data, isLoading: false });
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : 'Failed to load projects',
      });
      throw e;
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const created = await projectServices.createProject(data);

      set({
        projects: [created, ...get().projects],
      });

      return created;
    } catch (e) {
      set({
        isLoading: false,
        error: e instanceof Error ? e.message : 'Failed to create project',
      });

      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  getProjectById: async (id) => {
    set({ isLoading: true, error: null, hasLoadedProject: false, selectedProject: null });

    try {
      const project = await projectServices.getProjectById(id);
      set({ selectedProject: project, hasLoadedProject: true });
      return project;
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load project',
        hasLoadedProject: true,
      });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await projectServices.updateProject(id, data);

      set({
        projects: get().projects.map((p) => (p.id === id ? updated : p)),
      });

      if (get().selectedProject?.id === id) {
        set({ selectedProject: updated });
      }

      return updated;
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to update project',
      });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await projectServices.deleteProject(id);

      set({
        projects: get().projects.filter((p) => p.id !== id),
      });

      if (get().selectedProject?.id === id) {
        set({ selectedProject: null });
      }
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
}));
