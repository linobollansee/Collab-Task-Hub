'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useModal } from '@/features/modal/hooks/useModal';
import { useProjects } from '@/features/project/hooks/useProject';
import { useTasks } from '@/features/task/hooks/useTask';
import { CreateTaskFormData, createTaskSchema } from '@/features/task/schemas/task.schema';
import { Button, Input } from '@/shared/ui';

const CreateTaskForm = () => {
  const { createTask, isLoading } = useTasks();
  const { closeModal } = useModal();

  const { selectedProject } = useProjects();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      const projectId = selectedProject?.id;
      if (!projectId) return;

      await createTask({
        title: data.title,
        description: data.description?.trim() || '',
        projectId,
        priority: data.priority || 'medium',
      });

      reset();
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const isDisabled = !selectedProject?.id || isLoading;

  return (
    <div className="w-full max-w-112.5">
      <h3 className="mb-2.5">Create Task</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap gap-2.5 mt-4">
          <div className="w-full">
            <Input type="text" placeholder="Enter title" {...register('title')} />
            {errors.title?.message && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="w-full">
            <Input type="text" placeholder="Enter description" {...register('description')} />
          </div>

          <div className="w-full">
            <select
              {...register('priority')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <Button type="submit" disabled={isDisabled}>
            {isLoading ? 'Creating…' : 'Create task'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskForm;
