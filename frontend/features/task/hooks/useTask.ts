import { useStoreTask } from '@/features/task/store/use-store-task';

export const useTasks = () => {
  const tasks = useStoreTask((s) => s.tasks);
  const isLoading = useStoreTask((s) => s.isLoading);
  const error = useStoreTask((s) => s.error);

  const getTasks = useStoreTask((s) => s.getTasks);
  const createTask = useStoreTask((s) => s.createTask);
  const deleteTask = useStoreTask((s) => s.deleteTask);
  const getTaskById = useStoreTask((s) => s.getTaskById);
  const clearError = useStoreTask((s) => s.clearError);

  return { tasks, isLoading, error, getTasks, createTask, deleteTask, getTaskById, clearError };
};
