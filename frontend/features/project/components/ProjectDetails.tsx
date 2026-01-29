'use client';

import { useState } from 'react';

import ConfirmDeleteModal from '@/features/modal/components/ConfirmDeleteModal';
import { useModal } from '@/features/modal/hooks/useModal';
import { useProjectRole } from '@/features/project/hooks/useProjectRole';
import type { Project, UpdateProjectDto } from '@/features/project/types';
import { Button } from '@/shared/ui';
import { useToast } from '@/shared/ui/Toast';
import { Wrapper } from '@/shared/ui/Wrapper';

import { EditProjectForm } from './EditProjectForm';

interface ProjectDetailsProps {
  project: Project;
  currentUserId?: string;
  onUpdate?: (data: UpdateProjectDto) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function ProjectDetails({
  project,
  currentUserId,
  onUpdate,
  onDelete,
}: ProjectDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { canEdit, canDelete } = useProjectRole(project, currentUserId);
  const { showToast } = useToast();
  const { openModal } = useModal();

  const handleSave = async (data: UpdateProjectDto) => {
    if (onUpdate) {
      await onUpdate(data);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    openModal(
      <ConfirmDeleteModal
        entityName={`project "${project.title}"`}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await onDelete();
          } catch (err: unknown) {
            setIsDeleting(false);
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
            console.log('Caught error in ProjectDetails:', errorMessage);
            showToast(<div className="text-red-600 font-medium">{errorMessage}</div>, 2000);
          }
        }}
      />,
    );
  };

  if (isEditing) {
    return (
      <Wrapper>
        <h2 className="mb-4 text-xl font-semibold">Edit Project</h2>
        <EditProjectForm
          project={project}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{project.title}</h1>
          <p className="mt-3 text-sm">
            {project.description ? project.description : `No description`}
          </p>
        </div>

        {(canEdit || canDelete) && (
          <menu className="ml-4 flex items-center gap-2">
            <div>
              {canEdit && (
                <Button onClick={() => setIsEditing(true)} variant={'primary'}>
                  Edit
                </Button>
              )}
            </div>
            <div>
              {canDelete && (
                <Button onClick={handleDelete} disabled={isDeleting} variant="danger">
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
          </menu>
        )}
      </div>
    </Wrapper>
  );
}
