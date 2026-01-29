import { create } from 'zustand';

import Board from '@/features/board/components/Board';
import Chat from '@/features/chat/components/Chat';
import { TabItemProps } from '@/features/tabs/types';
import TaskList from '@/features/task/components/TaskList';
import UserList from '@/features/user/components/UserList';

interface StoreProps {
  tabs: TabItemProps[];
  activeTabIndex: number;
  setActiveIndex: (index: number) => void;
}

export const useStoreTabs = create<StoreProps>((set) => ({
  tabs: [
    { id: 'tasks', label: 'Tasks', component: TaskList },
    { id: 'board', label: 'Board', component: Board, className: 'hidden md:flex' },
    { id: 'chat', label: 'Chat', component: Chat },
    { id: 'users', label: 'Users', component: UserList },
  ],

  activeTabIndex: 0,
  setActiveIndex: (index) => set({ activeTabIndex: index }),
}));
