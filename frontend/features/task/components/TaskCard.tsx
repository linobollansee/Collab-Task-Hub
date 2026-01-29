'use client';

import type { TaskCardProps } from '@/features/task/types';
import { Button } from '@/shared/ui';
import { Wrapper } from '@/shared/ui/Wrapper';

export function TaskCard({ task, isProjectMember, onOpen, onDelete, onUpdate }: TaskCardProps) {
  return (
    <Wrapper>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm md:text-base">{task.title}</p>

        {isProjectMember && (
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full px-3 py-2 text-xs md:w-auto"
              onClick={() => onOpen(task.id)}
            >
              Open
            </Button>

            <Button
              type="button"
              variant="primary"
              className="w-full px-3 py-2 text-xs md:w-auto"
              onClick={() => onUpdate(task.id)}
            >
              Edit
            </Button>

            <Button
              type="button"
              variant="danger"
              className="w-full px-3 py-2 text-xs md:w-auto"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
