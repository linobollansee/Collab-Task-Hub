import { AxiosError, AxiosInstance } from 'axios';

import { CreateProjectDto, Project, UpdateProjectDto } from '@/features/project/types';
import { api } from '@/shared/api/axios';

class ProjectServices {
  private axios: AxiosInstance = api;

  public async getProjects(): Promise<Project[]> {
    try {
      const response = await this.axios.get<Project[]>('/projects/all');
      return response.data;
    } catch (e: unknown) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  public async createProject(data: CreateProjectDto): Promise<Project> {
    try {
      const response = await this.axios.post<Project>('/projects', data);
      return response.data;
    } catch (e: unknown) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  public async getProjectById(id: string): Promise<Project> {
    try {
      const response = await this.axios.get<Project>(`/projects/${id}`);
      return response.data;
    } catch (e: unknown) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  public async updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    try {
      const response = await this.axios.patch<Project>(`/projects/${id}`, data);
      return response.data;
    } catch (e: unknown) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  public async deleteProject(id: string): Promise<void> {
    try {
      await this.axios.delete(`/projects/${id}`);
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        const errorMessage = e.response?.data?.message || e.message || 'Failed to delete project';
        throw new Error(errorMessage);
      }
      throw new Error('Failed to delete project');
    }
  }
}

export const projectServices = new ProjectServices();
