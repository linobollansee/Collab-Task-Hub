import { create } from 'zustand';

import { BoardState } from '@/features/board/types';

export const useStoreBoard = create<BoardState>(() => ({
  columns: [
    { id: 'backlog', title: 'Backlog' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ],
}));
