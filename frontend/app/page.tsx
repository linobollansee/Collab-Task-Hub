'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AuthRequiredModal } from '@/features/auth/components/AuthRequiredModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useModal } from '@/features/modal/hooks/useModal';
import { CreateForm } from '@/features/project/components';
import { ProjectCard } from '@/features/project/components/ProjectCard';
import { useProjects } from '@/features/project/hooks/useProject';
import { Button } from '@/shared/ui';
import { Loader } from '@/shared/ui/Loader';

export default function Home() {
  const router = useRouter();
  const { openModal } = useModal();
  const { isAuth } = useAuth();

  const { projects, error, isLoading, getProjects } = useProjects();

  useEffect(() => {
    void getProjects();
  }, [getProjects]);

  const handleOpenProject = (id: string) => {
    if (!isAuth) {
      openModal(<AuthRequiredModal />);
      return;
    }
    router.push(`/project/${id}`);
  };

  if (isLoading) return <Loader />;

  if (error)
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button className="underline" onClick={getProjects}>
          Retry
        </button>
      </div>
    );

  return (
    <section className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl">Projects</h1>

        {isAuth ? (
          <Button
            variant="primary"
            onClick={() =>
              openModal(
                <div>
                  <h3 className="mb-2.5">Create Project</h3>
                  <CreateForm />
                </div>,
              )
            }
          >
            Create
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col  cursor-pointer"
            onClick={() => handleOpenProject(project.id)}
          >
            <ProjectCard project={project} isAuth={isAuth} />
          </div>
        ))}
      </div>
    </section>
  );
}
