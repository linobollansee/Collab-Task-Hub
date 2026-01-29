import { AxiosInstance } from 'axios';

import { CreateTaskDto, Task } from '@/features/task/types';
import { api } from '@/shared/api/axios';

class TaskServices {
  private axios: AxiosInstance = api;

  async getTasksByProject(projectId: string): Promise<Task[]> {
    const res = await this.axios.get<Task[]>('/tasks', { params: { projectId } });
    return res.data;
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    const res = await this.axios.post<Task>('/tasks', data);
    return res.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.axios.delete(`/tasks/${id}`);
  }

  async getTaskById(id: string): Promise<Task> {
    const res = await this.axios.get<Task>(`/tasks/${id}`);
    return res.data;
  }

  async updateTaskStatus(id: string, status: Task['status']): Promise<Task> {
    const res = await this.axios.patch<Task>(`/tasks/${id}`, { status });
    return res.data;
  }

  async updateTask(id: string, data: Task): Promise<Task> {
    const res = await this.axios.patch<Task>(`/tasks/${id}`, data);
    return res.data;
  }
}

export const taskServices = new TaskServices();
