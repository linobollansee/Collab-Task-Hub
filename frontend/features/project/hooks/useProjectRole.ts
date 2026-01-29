import { Project, ProjectRole } from '@/features/project/types';

/**
 * Check if a user has a specific role in a project
 */
export function useProjectRole(project: Project | null, userId: string | undefined) {
  if (!project || !userId) {
    return {
      isAdmin: false,
      isMember: false,
      isViewer: false,
      role: null,
      canEdit: false,
      canDelete: false,
    };
  }

  const userMember = project.members?.find((member) => member.userId === userId);
  const role = userMember?.role || null;

  const isAdmin = role === ProjectRole.ADMIN;
  const isMember = role === ProjectRole.MEMBER;
  const isViewer = role === ProjectRole.VIEWER;

  return {
    isAdmin,
    isMember,
    isViewer,
    role,
    canEdit: isAdmin,
    canDelete: isAdmin,
  };
}
