import React, { FC } from 'react';
import { useDraggable } from '@dnd-kit/core';

import { BoardCardProps } from '@/features/board/types';
import { TaskPriority } from '@/features/task/types';
import { useFormattedDate } from '@/shared/hooks/useFormattedDate';

const BoardCard: FC<BoardCardProps> = ({ task }) => {
  const { attributes, listeners, transform, setNodeRef } = useDraggable({
    id: task.id,
  });

  const dateShow = useFormattedDate(task.createdAt);
  const timeOnly = useFormattedDate(task.createdAt, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  const taskDescription = task.description ? task.description : 'Default';

  const priorityStyles: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-500' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-l-yellow-500' },
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-red-500' },
  };

  const priority = task.priority || 'medium';
  const priorityStyle = priorityStyles[priority];

  return (
    <div
      className={`cursor-grab p-4 border border-gray-200 bg-white border-l-4 ${priorityStyle.border}`}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-slate-900">Title: {task.title}</h2>
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${priorityStyle.bg} ${priorityStyle.text}`}
        >
          {priority.toUpperCase()}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500 mb-2.5 line-clamp-2">
        Description: {taskDescription}
      </p>
      <div className="flex flex-col border-t border-slate-200 pt-3">
        <p className="mt-1 text-xs text-slate-500">Date: {dateShow}</p>
        <p className="mt-1 text-xs text-slate-500">Time : {timeOnly}</p>
      </div>
    </div>
  );
};

export default BoardCard;
