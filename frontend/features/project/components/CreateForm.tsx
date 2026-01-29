'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useModal } from '@/features/modal/hooks/useModal';
import { useProjects } from '@/features/project/hooks/useProject';
import { CreateFormData, createFormSchema } from '@/features/project/schemas/project.schema';
import { Button, Input } from '@/shared/ui';

const CreateForm = () => {
  const { createProject, isLoading } = useProjects();
  const { closeModal } = useModal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
  });

  const onSubmit = async (data: CreateFormData) => {
    try {
      await createProject({
        title: data.title,
        description: data.description,
      });
      reset();
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2.5">
          <Input type="text" placeholder="Enter project" {...register('title')} />
          {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}

          <Input type="text" placeholder="Enter description" {...register('description')} />
          {errors.description && (
            <span className="text-red-500 text-sm">{errors.description.message}</span>
          )}

          <Button type="submit" className="w-full">
            {isLoading ? 'Creating…' : 'Create project'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateForm;
