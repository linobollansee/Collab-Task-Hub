import type { ProjectMember, ProjectRole } from '@/features/project/types';

export interface MemberUser {
  id: string;
  name: string;
  email: string;
}

export interface MemberCardProps {
  member: ProjectMember;
  canManage: boolean;
  isLastAdmin: boolean;
  onChangeRole: (role: ProjectRole) => void | Promise<void>;
  onDelete: () => void;
}

export interface MembersListProps {
  members: ProjectMember[];
  adminRole: boolean;
  lastAdminId: string | null;
  onDelete: (memberId: string, isLastAdmin: boolean) => void;
  onChangeRole: (memberId: string, role: ProjectRole, isLastAdmin: boolean) => Promise<void> | void;
}

export interface AddMemberDto {
  userId: string;
  role: ProjectRole;
}

export interface UpdateMemberRoleDto {
  role: ProjectRole;
}

export interface MembersStore {
  isLoading: boolean;
  error: string | null;

  addMember: (projectId: string, dto: AddMemberDto) => Promise<void>;
  updateRole: (projectId: string, memberId: string, role: ProjectRole) => Promise<void>;
  deleteMember: (projectId: string, memberId: string) => Promise<void>;
}

export interface AddMemberProps {
  projectId: string;
  onClose: () => void;
  members: ProjectMember[];
}
