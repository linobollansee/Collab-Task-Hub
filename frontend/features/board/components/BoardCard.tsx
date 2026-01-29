import React, { FC } from 'react';
import { useDraggable } from '@dnd-kit/core';

import { BoardCardProps } from '@/features/board/types';
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

  return (
    <div
      className="cursor-grab p-4 border border-gray-200 bg-white"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <h2 className="text-sm font-medium text-slate-900">Title: {task.title}</h2>
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
