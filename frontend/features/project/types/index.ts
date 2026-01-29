export enum ProjectRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

export interface MemberUser {
  id: string;
  email: string;
  name: string;
}

export interface ProjectMember {
  id: string;
  role: ProjectRole;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdById: string;
  createdBy: {
    id: string;
    email: string;
    name: string;
  };
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCardProps {
  project: Project;
  isAuth?: boolean;
}

export interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  hasLoadedProject: boolean;

  getProjects: () => Promise<void>;
  getProjectById: (id: string) => Promise<Project>;
  createProject: (data: CreateProjectDto) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectDto) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
}
