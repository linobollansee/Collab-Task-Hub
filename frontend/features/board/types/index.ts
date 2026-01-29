import { Task } from '@/features/task/types';

export interface ColumnProps {
  id: string;
  title: string;
}

export type ColumnType = {
  column: ColumnProps;
  tasks: Task[];
};

export interface BoardCardProps {
  task: Task;
}

export interface BoardState {
  columns: ColumnProps[];
}
