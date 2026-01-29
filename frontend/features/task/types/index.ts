export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  createdAt?: string;
  priority: TaskPriority;
  status: TaskStatus;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
  priority?: TaskPriority;
}

export interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  clearError: () => void;

  getTasks: (projectId: string) => Promise<void>;
  createTask: (data: CreateTaskDto) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Promise<Task>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  updateTask: (id: string, data: Task) => Promise<void>;
}

export interface TaskCardProps {
  task: Task;
  isProjectMember: boolean;
  onUpdate: (id: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface EditTaskFormProps {
  task: Task;
  onClose: () => void;
  edit?: () => void;
}
