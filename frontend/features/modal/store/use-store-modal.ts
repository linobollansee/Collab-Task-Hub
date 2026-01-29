import { create } from 'zustand';

import { ModalState } from '../types';

export const useStoreModal = create<ModalState>((set) => ({
  isOpen: false,
  content: null,

  open: (content) =>
    set((state) => {
      if (state.isOpen) return state;
      return { isOpen: true, content };
    }),

  close: () => set({ isOpen: false, content: null }),
}));
