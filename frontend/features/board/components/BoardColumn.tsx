import React, { FC } from 'react';
import { useDroppable } from '@dnd-kit/core';

import BoardCard from '@/features/board/components/BoardCard';
import { ColumnType } from '@/features/board/types';
import { Task } from '@/features/task/types';

const BoardColumn: FC<ColumnType> = ({ tasks, column }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  // Sort tasks by priority (high -> medium -> low)
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedTasks = [...tasks].sort((a: Task, b: Task) => {
    const aPriority = a.priority || 'medium';
    const bPriority = b.priority || 'medium';
    return priorityOrder[bPriority] - priorityOrder[aPriority];
  });

  return (
    <div
      ref={setNodeRef}
      className="p-1 flex min-h-12.5 flex-col rounded-lg bg-slate-50 shadow sm:p-2 md:p-2 md:rounded-xl"
    >
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">
        {column.title}
      </h2>

      <div className="flex flex-col gap-3">
        {sortedTasks.map((task) => (
          <BoardCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default BoardColumn;
