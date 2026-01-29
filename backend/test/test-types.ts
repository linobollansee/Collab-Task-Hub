// Type definitions for test responses to avoid 'any' types

export interface AuthResponseBody {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UserResponseBody {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResponseBody {
  id: string;
  title: string;
  description: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMemberResponseBody[];
}

export interface ProjectMemberResponseBody {
  id: string;
  userId: string;
  projectId: string;
  role: string;
  joinedAt: string;
  user?: UserResponseBody;
}

export interface TaskResponseBody {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponseBody {
  id: string;
  content: string;
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: UserResponseBody;
}
