import { DndContext, DragEndEvent } from '@dnd-kit/core';

import BoardColumn from '@/features/board/components/BoardColumn';
import { useStoreBoard } from '@/features/board/store/use-store-board';
import { useStoreTask } from '@/features/task/store/use-store-task';
import { Task } from '@/features/task/types';

const Board = () => {
  const { tasks, updateTaskStatus } = useStoreTask();
  const { columns } = useStoreBoard();

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];

    void updateTaskStatus(taskId, newStatus);
  }

  return (
    <div className="p-3 bg-slate-100 md:p-6">
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        <DndContext onDragEnd={handleDragEnd}>
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={tasks.filter((task) => task.status === column.id)}
            />
          ))}
        </DndContext>
      </div>
    </div>
  );
};

export default Board;
