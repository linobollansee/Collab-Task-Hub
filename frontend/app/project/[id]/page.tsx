'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { useStoreAuth } from '@/features/auth/store/use-store-auth';
import { ProjectDetails } from '@/features/project/components/ProjectDetails';
import { useProjects } from '@/features/project/hooks/useProject';
import { Tabs } from '@/features/tabs/components';
import { useTasks } from '@/features/task/hooks/useTask';
import { Loader } from '@/shared/ui/Loader';
import { Wrapper } from '@/shared/ui/Wrapper';

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const { user } = useStoreAuth();
  const {
    selectedProject,
    isLoading,
    error,
    hasLoadedProject,
    getProjectById,
    updateProject,
    deleteProject,
  } = useProjects();
  const { getTasks } = useTasks();

  useEffect(() => {
    if (!projectId) return;
    void getProjectById(projectId);
  }, [projectId, getProjectById]);

  useEffect(() => {
    if (!projectId) return;
    void getTasks(projectId);
  }, [projectId, getTasks]);

  const handleUpdateProject = async (data: { title?: string; description?: string }) => {
    await updateProject(projectId, data);
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(projectId);
      router.push('/');
    } catch (error) {
      // Re-throw the error so ProjectDetails can catch it and show the toast
      throw error;
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mt-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (hasLoadedProject && !selectedProject) {
    return (
      <section className="mt-8">
        <div className="container py-6">
          <p className="text-sm text-slate-600">Project not found.</p>
        </div>
      </section>
    );
  }

  if (!selectedProject) {
    return <Loader />;
  }

  return (
    <section className="mt-8 flex flex-col gap-2.5">
      <ProjectDetails
        project={selectedProject}
        currentUserId={user?.id}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
      />

      <Wrapper>
        <Tabs />
      </Wrapper>
    </section>
  );
}
