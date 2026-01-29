'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { useStoreTask } from '@/features/task/store/use-store-task';
import { EditTaskFormProps, Task } from '@/features/task/types';
import { Button } from '@/shared/ui';

export const EditTaskForm = ({ task, onClose, edit }: EditTaskFormProps) => {
  const { updateTask } = useStoreTask();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Task>({
    defaultValues: task,
  });

  const onSubmit = async (data: Task) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
      };
      await updateTask(task.id, payload as Task);
      onClose();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-2">
      <h2 className="text-xl font-semibold text-slate-900">Edit Task</h2>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">Title</label>
          <input
            {...register('title')}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-2">
        <Button type="button" variant="secondary" onClick={edit} className="px-4 py-2">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-4 py-2">
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
